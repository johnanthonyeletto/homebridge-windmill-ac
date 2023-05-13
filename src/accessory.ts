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
import { Mode, WindmillService } from './WindmillService';
import { sleep } from './helpers/sleep';

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
  private readonly name: string;

  private readonly Service: typeof hap.Service;
  private readonly Characteristic: typeof hap.Characteristic;

  private readonly service: Service;
  private readonly informationService: Service;


  constructor(log: Logging, config: AccessoryConfig, api: API) {
    this.log = log;
    this.config = config as WindmillThermostatAccessoryConfig;
    this.api = api;

    this.log('Windmill AC Config:', JSON.stringify(config));

    this.windmill = new WindmillService(this.config.token, this.log);

    this.Service = this.api.hap.Service;
    this.Characteristic = this.api.hap.Characteristic;

    // extract name from config
    this.name = config.name;

    // create a new Thermostat service
    this.service = new hap.Service.Thermostat();
    this.informationService = new hap.Service.AccessoryInformation()
      .setCharacteristic(this.Characteristic.Manufacturer, 'The Air Lab, Inc.')
      .setCharacteristic(this.Characteristic.Model, 'The Windmill AC');

    // create handlers for required characteristics
    this.service.getCharacteristic(this.Characteristic.CurrentHeatingCoolingState)
      .onGet(this.handleCurrentHeatingCoolingStateGet.bind(this));

    this.service.getCharacteristic(this.Characteristic.TargetHeatingCoolingState)
      .onGet(this.handleTargetHeatingCoolingStateGet.bind(this))
      .onSet(this.handleTargetHeatingCoolingStateSet.bind(this));

    this.service.getCharacteristic(this.Characteristic.CurrentTemperature)
      .onGet(this.handleCurrentTemperatureGet.bind(this));

    this.service.getCharacteristic(this.Characteristic.TargetTemperature)
      .onGet(this.handleTargetTemperatureGet.bind(this))
      .onSet(this.handleTargetTemperatureSet.bind(this));

    this.service.getCharacteristic(this.Characteristic.TemperatureDisplayUnits)
      .onGet(this.handleTemperatureDisplayUnitsGet.bind(this))
      .onSet(this.handleTemperatureDisplayUnitsSet.bind(this));
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
  async handleCurrentHeatingCoolingStateGet() {
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
  handleTargetHeatingCoolingStateGet() {
    this.log('Triggered GET TargetHeatingCoolingState');

    return this.handleCurrentHeatingCoolingStateGet();
  }

  /**
   * Handle requests to set the "Target Heating Cooling State" characteristic
   */
  async handleTargetHeatingCoolingStateSet(value) {
    this.log('Triggered SET TargetHeatingCoolingState:', value);

    if(value === this.Characteristic.TargetHeatingCoolingState.OFF) {
      return this.windmill.setPower(false);
    } else {
      await this.windmill.setPower(true);
    }

    switch(value) {
      case this.Characteristic.TargetHeatingCoolingState.COOL:
        return this.windmill.setMode(Mode.COOL);
      case this.Characteristic.TargetHeatingCoolingState.HEAT:
        return this.windmill.setMode(Mode.FAN);
      case this.Characteristic.TargetHeatingCoolingState.AUTO:
        return this.windmill.setMode(Mode.ECO);
    }

  }

  /**
   * Handle requests to get the current value of the "Current Temperature" characteristic
   */
  async handleCurrentTemperatureGet() {
    this.log('Triggered GET CurrentTemperature');

    const currentValue = await this.windmill.getCurrentTemperature();

    return currentValue;
  }

  /**
   * Handle requests to get the current value of the "Target Temperature" characteristic
   */
  async handleTargetTemperatureGet() {
    this.log('Triggered GET TargetTemperature');

    const currentValue = await this.windmill.getTargetTemperature();

    return currentValue;
  }

  /**
   * Handle requests to set the "Target Temperature" characteristic
   */
  async handleTargetTemperatureSet(value: CharacteristicValue) {
    this.log('Triggered SET TargetTemperature:', value);
    return this.windmill.setTargetTemperature(parseFloat(value.toString()));
  }

  /**
   * Handle requests to get the current value of the "Temperature Display Units" characteristic
   */
  handleTemperatureDisplayUnitsGet() {
    this.log('Triggered GET TemperatureDisplayUnits');

    // set this to a valid value for TemperatureDisplayUnits
    const currentValue = this.Characteristic.TemperatureDisplayUnits.FAHRENHEIT;

    return currentValue;
  }

  /**
   * Handle requests to set the "Temperature Display Units" characteristic
   */
  handleTemperatureDisplayUnitsSet(value) {
    this.log('Triggered SET TemperatureDisplayUnits:', value);
  }


  /*
     * This method is called directly after creation of this instance.
     * It should return all services which should be added to the accessory.
     */
  getServices(): Service[] {
    return [
      this.service,
      this.informationService,
    ];
  }

}