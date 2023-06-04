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

  public readonly name: string;

  private readonly thermostatService: Service;
  private readonly informationService: Service;
  private readonly fanService: Service;

  private displayUnits: number;


  constructor(log: Logging, config: AccessoryConfig) {
    this.log = log;
    this.config = config as WindmillThermostatAccessoryConfig;
    this.name = config.name;

    this.displayUnits = hap.Characteristic.TemperatureDisplayUnits.FAHRENHEIT;

    // create a new Windmill service - this handles the communication with the Windmill API
    this.windmill = new WindmillService(this.config.token, this.log);

    // create a new Accessory Information service
    this.informationService = new hap.Service.AccessoryInformation()
      .setCharacteristic(hap.Characteristic.Manufacturer, 'The Air Lab, Inc.')
      .setCharacteristic(hap.Characteristic.Model, 'The Windmill AC');

    // create a new Thermostat service
    this.thermostatService = new hap.Service.Thermostat();

    this.thermostatService.getCharacteristic(hap.Characteristic.CurrentHeatingCoolingState)
      .onGet(this.handleGetCurrentHeatingCoolingState.bind(this));

    this.thermostatService.getCharacteristic(hap.Characteristic.TargetHeatingCoolingState)
      .onGet(this.handleGetTargetHeatingCoolingState.bind(this))
      .onSet(this.handleSetTargetHeatingCoolingState.bind(this));

    this.thermostatService.getCharacteristic(hap.Characteristic.CurrentTemperature)
      .onGet(this.handleGetCurrentTemperature.bind(this));

    this.thermostatService.getCharacteristic(hap.Characteristic.TargetTemperature)
      .setProps({
        minValue: fahrenheitToCelsius(60),
        maxValue: fahrenheitToCelsius(86),
        minStep: 1,
      })
      .onGet(this.handleGetTargetTemperature.bind(this))
      .onSet(this.handleSetTargetTemperature.bind(this));

    this.thermostatService.getCharacteristic(hap.Characteristic.TemperatureDisplayUnits)
      .onGet(this.handleGetTemperatureDisplayUnits.bind(this))
      .onSet(this.handleSetTemperatureDisplayUnits.bind(this));

    // create a new Fan service
    this.fanService = new hap.Service.Fanv2();

    this.fanService.getCharacteristic(hap.Characteristic.Active)
      .onGet(this.handleGetFanActive.bind(this))
      .onSet(this.handleSetFanActive.bind(this));

    this.fanService.getCharacteristic(hap.Characteristic.RotationSpeed)
      .onGet(this.handleGetFanRotationSpeed.bind(this))
      .onSet(this.handleSetFanRotationSpeed.bind(this));


    // Set the thermostat service as the primary service
    this.thermostatService.setPrimaryService(true);
    this.fanService.setPrimaryService(false);
    this.informationService.setPrimaryService(false);
  }

  /**
   * This method is optional to implement. It is called when HomeKit ask to identify the accessory.
   * Typical this only ever happens at the pairing process.
   */
  async identify(): Promise<void> {
    this.log.debug('Identify requested!');

    const currentPowerState = await this.windmill.getPower();
    await this.windmill.setPower(!currentPowerState);
    await sleep(3000);
    await this.windmill.setPower(currentPowerState);
  }

  /**
   * Handle requests to get the current value of the "Current Heating Cooling State" characteristic
   *
   * This is the mode that the thermostat is currently in (e.g. heat, cool, off) only (not auto)
   */
  async handleGetCurrentHeatingCoolingState(): Promise<CharacteristicValue> {
    this.log.debug('Triggered GET CurrentHeatingCoolingState');

    const [
      currentPowerState,
      currentMode,
    ] = await Promise.all([
      this.windmill.getPower(),
      this.windmill.getMode(),
    ]);

    if(!currentPowerState) {
      return hap.Characteristic.CurrentHeatingCoolingState.OFF;
    }

    switch(currentMode) {
      case Mode.COOL:
      case Mode.ECO:
        return hap.Characteristic.CurrentHeatingCoolingState.COOL;
      case Mode.FAN:
        return hap.Characteristic.CurrentHeatingCoolingState.HEAT;
    }
  }

  /**
   * Handle requests to get the current value of the "Target Heating Cooling State" characteristic
   *
   * This is the mode that the user set the thermostat to (e.g. heat, cool, auto, off)
   */
  async handleGetTargetHeatingCoolingState(): Promise<CharacteristicValue> {
    this.log.debug('Triggered GET TargetHeatingCoolingState');

    const [
      currentPowerState,
      currentMode,
    ] = await Promise.all([
      this.windmill.getPower(),
      this.windmill.getMode(),
    ]);

    if(!currentPowerState) {
      return hap.Characteristic.TargetHeatingCoolingState.OFF;
    }

    switch(currentMode) {
      case Mode.COOL:
        return hap.Characteristic.TargetHeatingCoolingState.COOL;
      case Mode.FAN:
        return hap.Characteristic.TargetHeatingCoolingState.HEAT;
      case Mode.ECO:
        return hap.Characteristic.TargetHeatingCoolingState.AUTO;
    }
  }

  /**
   * Handle requests to set the "Target Heating Cooling State" characteristic
   */
  async handleSetTargetHeatingCoolingState(value: CharacteristicValue): Promise<void> {
    this.log.debug('Triggered SET TargetHeatingCoolingState:', value);

    if(value === hap.Characteristic.TargetHeatingCoolingState.OFF) {
      await this.windmill.setPower(false);
      // Update the fan state to match the mode
      await this.fanService.updateCharacteristic(hap.Characteristic.Active, false);
      return;
    } else {
      // If the mode is not off, we need to turn on the AC
      await this.windmill.setPower(true);
    }

    const previousFanSpeed = await this.windmill.getFanSpeed();

    switch(value) {
      case hap.Characteristic.TargetHeatingCoolingState.COOL:
        await this.windmill.setMode(Mode.COOL);
        break;
      case hap.Characteristic.TargetHeatingCoolingState.HEAT:
        await this.windmill.setMode(Mode.FAN);
        break;
      case hap.Characteristic.TargetHeatingCoolingState.AUTO:
        await this.windmill.setMode(Mode.ECO);
        break;
    }

    // Default to AUTO fan speed when changing modes
    await this.windmill.setFanSpeed(previousFanSpeed);
  }

  /**
   * Handle requests to get the current value of the "Current Temperature" characteristic
   */
  async handleGetCurrentTemperature(): Promise<CharacteristicValue> {
    this.log.debug('Triggered GET CurrentTemperature');

    const currentValue = await this.windmill.getCurrentTemperature();

    return fahrenheitToCelsius(currentValue);
  }

  /**
   * Handle requests to get the current value of the "Target Temperature" characteristic
   */
  async handleGetTargetTemperature(): Promise<CharacteristicValue> {
    this.log.debug('Triggered GET TargetTemperature');

    const currentValue = await this.windmill.getTargetTemperature();

    return fahrenheitToCelsius(currentValue);
  }

  /**
   * Handle requests to set the "Target Temperature" characteristic
   */
  async handleSetTargetTemperature(value: CharacteristicValue): Promise<void> {
    this.log.debug('Triggered SET TargetTemperature:', value);
    const celsiusValue = celsiusToFahrenheit(parseFloat(value.toString()));
    return this.windmill.setTargetTemperature(celsiusValue);
  }

  /**
   * Handle requests to get the current value of the "Temperature Display Units" characteristic
   */
  handleGetTemperatureDisplayUnits(): CharacteristicValue {
    this.log.debug('Triggered GET TemperatureDisplayUnits');

    return this.displayUnits;
  }

  /**
   * Handle requests to set the "Temperature Display Units" characteristic
   */
  handleSetTemperatureDisplayUnits(value: CharacteristicValue): void {
    this.log.debug('Triggered SET TemperatureDisplayUnits:', value);
    this.displayUnits = parseInt(value.toString(), 10);
  }

  async handleGetFanActive(): Promise<CharacteristicValue> {
    this.log.debug('Triggered GET FanActive');

    const [
      currentPowerState,
      fanSpeed,
    ] = await Promise.all([
      this.windmill.getPower(),
      this.windmill.getFanSpeed(),
    ]);

    // If the fan is in AUTO mode, it is displayed as "off"
    if(!currentPowerState || fanSpeed === FanSpeed.AUTO) {
      return hap.Characteristic.Active.INACTIVE;
    }

    return hap.Characteristic.Active.ACTIVE;
  }

  async handleSetFanActive(value: CharacteristicValue) {
    this.log.debug('Triggered SET FanActive:', value);

    // If the fan is turned off, set the fan speed to AUTO
    if(value === hap.Characteristic.Active.INACTIVE) {
      await this.windmill.setFanSpeed(FanSpeed.AUTO);
    }
  }

  async handleGetFanRotationSpeed(): Promise<CharacteristicValue> {
    this.log.debug('Triggered GET FanRotationSpeed');
    const [
      currentPowerState,
      fanSpeed,
    ] = await Promise.all([
      this.windmill.getPower(),
      this.windmill.getFanSpeed(),
    ]);

    if(!currentPowerState) {
      return 0;
    }

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

  async handleSetFanRotationSpeed(value: CharacteristicValue) {
    this.log.debug('Triggered SET FanRotationSpeed:', value);

    const intValue = parseInt(value.toString(), 10);

    // If value is 0, the fan speed will be set to AUTO by `handleSetFanActive`
    if (intValue === 0) {
      return;
    }

    if (intValue <= 33) {
      await this.windmill.setFanSpeed(FanSpeed.LOW);
    } else if (intValue <= 66) {
      await this.windmill.setFanSpeed(FanSpeed.MEDIUM);
    } else if (intValue <= 100) {
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
