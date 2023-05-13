"use strict";
const settings_1 = require("./settings");
/*
   * IMPORTANT NOTICE
   *
   * One thing you need to take care of is, that you never ever ever import anything directly from the "homebridge" module (or the "hap-nodejs" module).
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
let hap;
class WindmillThermostatAccessory {
    constructor(log, config, api) {
        this.log = log;
        this.config = config;
        this.api = api;
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
    identify() {
        this.log('Identify!');
    }
    /**
     * Handle requests to get the current value of the "Current Heating Cooling State" characteristic
     */
    handleCurrentHeatingCoolingStateGet() {
        this.log.debug('Triggered GET CurrentHeatingCoolingState');
        // set this to a valid value for CurrentHeatingCoolingState
        const currentValue = this.Characteristic.CurrentHeatingCoolingState.OFF;
        return currentValue;
    }
    /**
     * Handle requests to get the current value of the "Target Heating Cooling State" characteristic
     */
    handleTargetHeatingCoolingStateGet() {
        this.log.debug('Triggered GET TargetHeatingCoolingState');
        // set this to a valid value for TargetHeatingCoolingState
        const currentValue = this.Characteristic.TargetHeatingCoolingState.OFF;
        return currentValue;
    }
    /**
     * Handle requests to set the "Target Heating Cooling State" characteristic
     */
    handleTargetHeatingCoolingStateSet(value) {
        this.log.debug('Triggered SET TargetHeatingCoolingState:', value);
    }
    /**
     * Handle requests to get the current value of the "Current Temperature" characteristic
     */
    handleCurrentTemperatureGet() {
        this.log.debug('Triggered GET CurrentTemperature');
        // set this to a valid value for CurrentTemperature
        const currentValue = -270;
        return currentValue;
    }
    /**
     * Handle requests to get the current value of the "Target Temperature" characteristic
     */
    handleTargetTemperatureGet() {
        this.log.debug('Triggered GET TargetTemperature');
        // set this to a valid value for TargetTemperature
        const currentValue = 10;
        return currentValue;
    }
    /**
     * Handle requests to set the "Target Temperature" characteristic
     */
    handleTargetTemperatureSet(value) {
        this.log.debug('Triggered SET TargetTemperature:', value);
    }
    /**
     * Handle requests to get the current value of the "Temperature Display Units" characteristic
     */
    handleTemperatureDisplayUnitsGet() {
        this.log.debug('Triggered GET TemperatureDisplayUnits');
        // set this to a valid value for TemperatureDisplayUnits
        const currentValue = this.Characteristic.TemperatureDisplayUnits.CELSIUS;
        return currentValue;
    }
    /**
     * Handle requests to set the "Temperature Display Units" characteristic
     */
    handleTemperatureDisplayUnitsSet(value) {
        this.log.debug('Triggered SET TemperatureDisplayUnits:', value);
    }
    /*
       * This method is called directly after creation of this instance.
       * It should return all services which should be added to the accessory.
       */
    getServices() {
        return [
            this.service,
            this.informationService,
        ];
    }
}
module.exports = (api) => {
    hap = api.hap;
    api.registerAccessory(settings_1.ACCESSORY_NAME, WindmillThermostatAccessory);
};
//# sourceMappingURL=accessory.js.map