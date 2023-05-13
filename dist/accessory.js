"use strict";
const settings_1 = require("./settings");
const WindmillService_1 = require("./services/WindmillService");
const sleep_1 = require("./helpers/sleep");
const temperature_1 = require("./helpers/temperature");
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
let hap;
class WindmillThermostatAccessory {
    constructor(log, config, api) {
        this.log = log;
        this.config = config;
        this.api = api;
        this.log('Windmill AC Config:', JSON.stringify(config));
        this.windmill = new WindmillService_1.WindmillService(this.config.token, this.log);
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
            .onGet(this.handleCurrentHeatingCoolingStateGet.bind(this));
        this.thermostatService.getCharacteristic(this.Characteristic.TargetHeatingCoolingState)
            .onGet(this.handleTargetHeatingCoolingStateGet.bind(this))
            .onSet(this.handleTargetHeatingCoolingStateSet.bind(this));
        this.thermostatService.getCharacteristic(this.Characteristic.CurrentTemperature)
            .onGet(this.handleCurrentTemperatureGet.bind(this));
        this.thermostatService.getCharacteristic(this.Characteristic.TargetTemperature)
            .onGet(this.handleTargetTemperatureGet.bind(this))
            .onSet(this.handleTargetTemperatureSet.bind(this));
        this.thermostatService.getCharacteristic(this.Characteristic.TemperatureDisplayUnits)
            .onGet(this.handleTemperatureDisplayUnitsGet.bind(this))
            .onSet(this.handleTemperatureDisplayUnitsSet.bind(this));
        this.fanService.getCharacteristic(this.Characteristic.Active)
            .onGet(this.handleFanActiveGet.bind(this))
            .onSet(this.handleFanActiveSet.bind(this));
        this.fanService.getCharacteristic(this.Characteristic.RotationSpeed)
            .onGet(this.handleFanRotationSpeedGet.bind(this))
            .onSet(this.handleFanRotationSpeedSet.bind(this));
    }
    /**
     * This method is optional to implement. It is called when HomeKit ask to identify the accessory.
     * Typical this only ever happens at the pairing process.
     */
    async identify() {
        this.log('Identify requested!');
        const currentPowerState = await this.windmill.getPower();
        await this.windmill.setPower(!currentPowerState);
        await (0, sleep_1.sleep)(3000);
        await this.windmill.setPower(currentPowerState);
    }
    /**
     * Handle requests to get the current value of the "Current Heating Cooling State" characteristic
     */
    async handleCurrentHeatingCoolingStateGet() {
        this.log('Triggered GET CurrentHeatingCoolingState');
        const [currentPowerState, currentMode,] = await Promise.all([
            this.windmill.getPower(),
            this.windmill.getMode(),
        ]);
        if (!currentPowerState) {
            return this.Characteristic.CurrentHeatingCoolingState.OFF;
        }
        switch (currentMode) {
            case WindmillService_1.Mode.COOL:
                return this.Characteristic.CurrentHeatingCoolingState.COOL;
            case WindmillService_1.Mode.FAN:
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
        if (value === this.Characteristic.TargetHeatingCoolingState.OFF) {
            await this.windmill.setPower(false);
            return;
        }
        else {
            await this.windmill.setPower(true);
        }
        switch (value) {
            case this.Characteristic.TargetHeatingCoolingState.COOL:
                await this.windmill.setMode(WindmillService_1.Mode.COOL);
                break;
            case this.Characteristic.TargetHeatingCoolingState.HEAT:
                await this.windmill.setMode(WindmillService_1.Mode.FAN);
                break;
            case this.Characteristic.TargetHeatingCoolingState.AUTO:
                await this.windmill.setMode(WindmillService_1.Mode.ECO);
                break;
        }
        await this.windmill.setFanSpeed(WindmillService_1.FanSpeed.AUTO);
        await this.fanService.updateCharacteristic(this.Characteristic.Active, false);
    }
    /**
     * Handle requests to get the current value of the "Current Temperature" characteristic
     */
    async handleCurrentTemperatureGet() {
        this.log('Triggered GET CurrentTemperature');
        const currentValue = await this.windmill.getCurrentTemperature();
        return (0, temperature_1.fahrenheitToCelsius)(currentValue);
    }
    /**
     * Handle requests to get the current value of the "Target Temperature" characteristic
     */
    async handleTargetTemperatureGet() {
        this.log('Triggered GET TargetTemperature');
        const currentValue = await this.windmill.getTargetTemperature();
        return (0, temperature_1.fahrenheitToCelsius)(currentValue);
    }
    /**
     * Handle requests to set the "Target Temperature" characteristic
     */
    async handleTargetTemperatureSet(value) {
        this.log('Triggered SET TargetTemperature:', value);
        const celsiusValue = (0, temperature_1.celsiusToFahrenheit)(parseFloat(value.toString()));
        return this.windmill.setTargetTemperature(celsiusValue);
    }
    /**
     * Handle requests to get the current value of the "Temperature Display Units" characteristic
     */
    handleTemperatureDisplayUnitsGet() {
        this.log('Triggered GET TemperatureDisplayUnits');
        return this.displayUnits;
    }
    /**
     * Handle requests to set the "Temperature Display Units" characteristic
     */
    handleTemperatureDisplayUnitsSet(value) {
        this.log('Triggered SET TemperatureDisplayUnits:', value);
        this.displayUnits = parseInt(value.toString(), 10);
    }
    async handleFanActiveGet() {
        this.log('Triggered GET FanActive');
        const currentPowerState = await this.windmill.getFanSpeed();
        // If the fan is in AUTO mode, it is not active
        return currentPowerState !== WindmillService_1.FanSpeed.AUTO;
    }
    async handleFanActiveSet(value) {
        this.log('Triggered SET FanActive:', value);
        if (value === this.Characteristic.Active.INACTIVE) {
            await this.windmill.setFanSpeed(WindmillService_1.FanSpeed.AUTO);
        }
    }
    async handleFanRotationSpeedGet() {
        this.log('Triggered GET FanRotationSpeed');
        const fanSpeed = await this.windmill.getFanSpeed();
        switch (fanSpeed) {
            case WindmillService_1.FanSpeed.AUTO:
                return 0;
            case WindmillService_1.FanSpeed.LOW:
                return 33;
            case WindmillService_1.FanSpeed.MEDIUM:
                return 66;
            case WindmillService_1.FanSpeed.HIGH:
                return 100;
        }
    }
    async handleFanRotationSpeedSet(value) {
        this.log('Triggered SET FanRotationSpeed:', value);
        if (value <= 33) {
            await this.windmill.setFanSpeed(WindmillService_1.FanSpeed.LOW);
        }
        else if (value <= 66) {
            await this.windmill.setFanSpeed(WindmillService_1.FanSpeed.MEDIUM);
        }
        else if (value <= 100) {
            await this.windmill.setFanSpeed(WindmillService_1.FanSpeed.HIGH);
        }
    }
    /*
       * This method is called directly after creation of this instance.
       * It should return all services which should be added to the accessory.
       */
    getServices() {
        return [
            this.thermostatService,
            this.informationService,
            this.fanService,
        ];
    }
}
module.exports = (api) => {
    hap = api.hap;
    api.registerAccessory(settings_1.ACCESSORY_NAME, WindmillThermostatAccessory);
};
//# sourceMappingURL=accessory.js.map