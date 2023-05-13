"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WindmillThermostatAccessory = void 0;
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
        this.service = new this.Service.Thermostat(this.name);
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
    getServices() {
        return [
            this.service,
        ];
    }
}
exports.WindmillThermostatAccessory = WindmillThermostatAccessory;
//# sourceMappingURL=accessory.js.map