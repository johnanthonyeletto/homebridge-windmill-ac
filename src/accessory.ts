import {
  AccessoryConfig,
  AccessoryPlugin,
  API,
  CharacteristicValue,
  HAP,
  Logging,
  Service,
} from 'homebridge';
import { ACCESSORY_NAME } from './settings';
import { WindmillThermostatAccessoryConfig } from './types';
import { FanSpeed, Mode, WindmillService } from './services/WindmillService';
import { sleep } from './helpers/sleep';
import { celsiusToFahrenheit, fahrenheitToCelsius } from './helpers/temperature';

/*
 * IMPORTANT NOTICE
 *
 * One thing you need to take care of is, that you never ever ever import anything
 * directly from the "homebridge" module (or the "hap-nodejs" module).
 * The above import block may seem like, that we do exactly that, but actually those imports are only used for types and interfaces
 * and will disappear once the code is compiled to Javascript.
 * In fact you can check that by running `npm run build` and opening the compiled Javascript file in the `dist` folder.
 * You will notice that the file does not contain a `... = require("homebridge");` statement anywhere in the code.
 *
 * The contents of the above import statement MUST ONLY be used for type annotation or accessing things like CONST ENUMS,
 * which is a special case as they get replaced by the actual value and do not remain as a reference in the compiled code.
 * Meaning normal enums are bad, const enums can be used.
 *
 * You MUST NOT import anything else which remains as a reference in the code, as this will result in
 * a `... = require("homebridge");` to be compiled into the final Javascript code.
 * This typically leads to unexpected behavior at runtime, as in many cases it won't be able to find the module
 * or will import another instance of homebridge causing collisions.
 *
 * To mitigate this the {@link API | Homebridge API} exposes the whole suite of HAP-NodeJS inside the `hap` property
 * of the api object, which can be acquired for example in the initializer function. This reference can be stored
 * like this for example and used to access all exported variables and classes from HAP-NodeJS.
 */
let hap: HAP;

/*
 * Initializer function called when the plugin is loaded.
 */
export = (api: API) => {
  hap = api.hap;
  api.registerAccessory(ACCESSORY_NAME, WindmillThermostatAccessory);
};

class WindmillThermostatAccessory implements AccessoryPlugin {
  private readonly windmill: WindmillService;

  private readonly log: Logging;
  private readonly config: WindmillThermostatAccessoryConfig;
  private readonly api: API;

  public readonly name: string;

  private readonly Characteristic: typeof hap.Characteristic;

  private readonly thermostatService: Service;
  private readonly informationService: Service;
  private readonly fanService: Service;

  private displayUnits: number;


  constructor(log: Logging, config: AccessoryConfig, api: API) {
    this.log = log;
    this.config = config as WindmillThermostatAccessoryConfig;
    this.api = api;

    this.windmill = new WindmillService(this.config.token, this.log);

    this.Characteristic = this.api.hap.Characteristic;

    // extract name from config
    this.name = config.name;

    // create a new Thermostat service
    this.thermostatService = new hap.Service.Thermostat();
    this.informationService = new hap.Service.AccessoryInformation()
      .setCharacteristic(this.Characteristic.Manufacturer, 'The Air Lab, Inc.')
      .setCharacteristic(this.Characteristic.Model, 'The Windmill AC');
    this.fanService = new hap.Service.Fanv2();

    this.displayUnits = this.Characteristic.TemperatureDisplayUnits.FAHRENHEIT;

    // create handlers for thermostat characteristics
    this.thermostatService.getCharacteristic(this.Characteristic.CurrentHeatingCoolingState)
      .onGet(this.handleGetHeatingCoolingState.bind(this));

    this.thermostatService.getCharacteristic(this.Characteristic.TargetHeatingCoolingState)
      .onGet(this.handleGetTargetHeatingCoolingState.bind(this))
      .onSet(this.handleSetTargetHeatingCoolingState.bind(this));

    this.thermostatService.getCharacteristic(this.Characteristic.CurrentTemperature)
      .onGet(this.handleGetCurrentTemperature.bind(this));

    this.thermostatService.getCharacteristic(this.Characteristic.TargetTemperature)
      .onGet(this.handleGetTargetTemperature.bind(this))
      .onSet(this.handleSetTargetTemperature.bind(this));

    this.thermostatService.getCharacteristic(this.Characteristic.TemperatureDisplayUnits)
      .onGet(this.handleGetTemperatureDisplayUnits.bind(this))
      .onSet(this.handleSetTemperatureDisplayUnits.bind(this));

    this.fanService.getCharacteristic(this.Characteristic.Active)
      .onGet(this.handleGetFanActive.bind(this))
      .onSet(this.handleSetFanActive.bind(this));

    this.fanService.getCharacteristic(this.Characteristic.RotationSpeed)
      .onGet(this.handleGetFanRotationSpeed.bind(this))
      .onSet(this.handleSetFanRotationSpeed.bind(this));
  }

  /**
   * This method is optional to implement. It is called when HomeKit ask to identify the accessory.
   * Typical this only ever happens at the pairing process.
   */
  async identify(): Promise<void> {
    this.log('Identify requested!');

    const currentPowerState = await this.windmill.getPower();
    await this.windmill.setPower(!currentPowerState);
    await sleep(3000);
    await this.windmill.setPower(currentPowerState);
  }

  /**
   * Handle requests to get the current value of the "Current Heating Cooling State" characteristic
   */
  async handleGetHeatingCoolingState(): Promise<CharacteristicValue> {
    this.log('Triggered GET CurrentHeatingCoolingState');

    const [
      currentPowerState,
      currentMode,
    ] = await Promise.all([
      this.windmill.getPower(),
      this.windmill.getMode(),
    ]);

    if(!currentPowerState) {
      return this.Characteristic.CurrentHeatingCoolingState.OFF;
    }

    switch(currentMode) {
      case Mode.COOL:
        return this.Characteristic.CurrentHeatingCoolingState.COOL;
      case Mode.FAN:
        return this.Characteristic.CurrentHeatingCoolingState.HEAT;
    }

    // Fallback to OFF
    return this.Characteristic.CurrentHeatingCoolingState.OFF;
  }

  /**
   * Handle requests to get the current value of the "Target Heating Cooling State" characteristic
   */
  handleGetTargetHeatingCoolingState() {
    this.log('Triggered GET TargetHeatingCoolingState');

    return this.handleGetHeatingCoolingState();
  }

  /**
   * Handle requests to set the "Target Heating Cooling State" characteristic
   */
  async handleSetTargetHeatingCoolingState(value) {
    this.log('Triggered SET TargetHeatingCoolingState:', value);

    if(value === this.Characteristic.TargetHeatingCoolingState.OFF) {
      await this.windmill.setPower(false);
      return;
    } else {
      await this.windmill.setPower(true);
    }

    switch(value) {
      case this.Characteristic.TargetHeatingCoolingState.COOL:
        await this.windmill.setMode(Mode.COOL);
        break;
      case this.Characteristic.TargetHeatingCoolingState.HEAT:
        await this.windmill.setMode(Mode.FAN);
        break;
      case this.Characteristic.TargetHeatingCoolingState.AUTO:
        await this.windmill.setMode(Mode.ECO);
        break;
    }

    await this.windmill.setFanSpeed(FanSpeed.AUTO);
    await this.fanService.updateCharacteristic(this.Characteristic.Active, false);
  }

  /**
   * Handle requests to get the current value of the "Current Temperature" characteristic
   */
  async handleGetCurrentTemperature() {
    this.log('Triggered GET CurrentTemperature');

    const currentValue = await this.windmill.getCurrentTemperature();

    return fahrenheitToCelsius(currentValue);
  }

  /**
   * Handle requests to get the current value of the "Target Temperature" characteristic
   */
  async handleGetTargetTemperature() {
    this.log('Triggered GET TargetTemperature');

    const currentValue = await this.windmill.getTargetTemperature();

    return fahrenheitToCelsius(currentValue);
  }

  /**
   * Handle requests to set the "Target Temperature" characteristic
   */
  async handleSetTargetTemperature(value: CharacteristicValue) {
    this.log('Triggered SET TargetTemperature:', value);
    const celsiusValue = celsiusToFahrenheit(parseFloat(value.toString()));
    return this.windmill.setTargetTemperature(celsiusValue);
  }

  /**
   * Handle requests to get the current value of the "Temperature Display Units" characteristic
   */
  handleGetTemperatureDisplayUnits() {
    this.log('Triggered GET TemperatureDisplayUnits');

    return this.displayUnits;
  }

  /**
   * Handle requests to set the "Temperature Display Units" characteristic
   */
  handleSetTemperatureDisplayUnits(value: CharacteristicValue) {
    this.log('Triggered SET TemperatureDisplayUnits:', value);
    this.displayUnits = parseInt(value.toString(), 10);
  }

  async handleGetFanActive() {
    this.log('Triggered GET FanActive');

    const currentPowerState = await this.windmill.getFanSpeed();

    // If the fan is in AUTO mode, it is not active
    return currentPowerState !== FanSpeed.AUTO;
  }

  async handleSetFanActive(value) {
    this.log('Triggered SET FanActive:', value);

    if(value === this.Characteristic.Active.INACTIVE) {
      await this.windmill.setFanSpeed(FanSpeed.AUTO);
    }
  }

  async handleGetFanRotationSpeed() {
    this.log('Triggered GET FanRotationSpeed');
    const fanSpeed = await this.windmill.getFanSpeed();

    switch(fanSpeed) {
      case FanSpeed.AUTO:
        return 0;
      case FanSpeed.LOW:
        return 33;
      case FanSpeed.MEDIUM:
        return 66;
      case FanSpeed.HIGH:
        return 100;
    }
  }

  async handleSetFanRotationSpeed(value) {
    this.log('Triggered SET FanRotationSpeed:', value);

    if (value <= 33) {
      await this.windmill.setFanSpeed(FanSpeed.LOW);
    } else if (value <= 66) {
      await this.windmill.setFanSpeed(FanSpeed.MEDIUM);
    } else if (value <= 100) {
      await this.windmill.setFanSpeed(FanSpeed.HIGH);
    }
  }

  /*
     * This method is called directly after creation of this instance.
     * It should return all services which should be added to the accessory.
     */
  getServices(): Service[] {
    return [
      this.thermostatService,
      this.informationService,
      this.fanService,
    ];
  }

}