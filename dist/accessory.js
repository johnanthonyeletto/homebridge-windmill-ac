"use strict";
const settings_1 = require("./settings");
const WindmillService_1 = require("./services/WindmillService");
const sleep_1 = require("./helpers/sleep");
const temperature_1 = require("./helpers/temperature");
const debounce_1 = require("./helpers/debounce");
const SET_DEBOUNCE_TIME = 1000;
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
    constructor(log, config) {
        this.log = log;
        this.config = config;
        this.name = config.name;
        this.displayUnits = hap.Characteristic.TemperatureDisplayUnits.FAHRENHEIT;
        // create a new Windmill service - this handles the communication with the Windmill API
        this.windmill = new WindmillService_1.WindmillService(this.config.token, this.log);
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
            .onSet((0, debounce_1.debounce)(this.handleSetTargetHeatingCoolingState.bind(this), SET_DEBOUNCE_TIME));
        this.thermostatService.getCharacteristic(hap.Characteristic.CurrentTemperature)
            .onGet(this.handleGetCurrentTemperature.bind(this));
        this.thermostatService.getCharacteristic(hap.Characteristic.TargetTemperature)
            .setProps({
            minValue: (0, temperature_1.fahrenheitToCelsius)(60),
            maxValue: (0, temperature_1.fahrenheitToCelsius)(86),
            minStep: 1,
        })
            .onGet(this.handleGetTargetTemperature.bind(this))
            .onSet((0, debounce_1.debounce)(this.handleSetTargetTemperature.bind(this), SET_DEBOUNCE_TIME));
        this.thermostatService.getCharacteristic(hap.Characteristic.TemperatureDisplayUnits)
            .onGet(this.handleGetTemperatureDisplayUnits.bind(this))
            .onSet((0, debounce_1.debounce)(this.handleSetTemperatureDisplayUnits.bind(this), SET_DEBOUNCE_TIME));
        // create a new Fan service
        this.fanService = new hap.Service.Fanv2();
        this.fanService.getCharacteristic(hap.Characteristic.Active)
            .onGet(this.handleGetFanActive.bind(this))
            .onSet((0, debounce_1.debounce)(this.handleSetFanActive.bind(this), SET_DEBOUNCE_TIME));
        this.fanService.getCharacteristic(hap.Characteristic.RotationSpeed)
            .onGet(this.handleGetFanRotationSpeed.bind(this))
            .onSet((0, debounce_1.debounce)(this.handleSetFanRotationSpeed.bind(this), SET_DEBOUNCE_TIME));
        // Set the thermostat service as the primary service
        this.thermostatService.setPrimaryService(true);
        this.fanService.setPrimaryService(false);
        this.informationService.setPrimaryService(false);
    }
    /**
     * This method is optional to implement. It is called when HomeKit ask to identify the accessory.
     * Typical this only ever happens at the pairing process.
     */
    async identify() {
        this.log.debug('Identify requested!');
        const currentPowerState = await this.windmill.getPower();
        await this.windmill.setPower(!currentPowerState);
        await (0, sleep_1.sleep)(3000);
        await this.windmill.setPower(currentPowerState);
    }
    /**
     * Handle requests to get the current value of the "Current Heating Cooling State" characteristic
     *
     * This is the mode that the thermostat is currently in (e.g. heat, cool, off) only (not auto)
     */
    async handleGetCurrentHeatingCoolingState() {
        this.log.debug('Triggered GET CurrentHeatingCoolingState');
        const [currentPowerState, currentMode,] = await Promise.all([
            this.windmill.getPower(),
            this.windmill.getMode(),
        ]);
        if (!currentPowerState) {
            return hap.Characteristic.CurrentHeatingCoolingState.OFF;
        }
        switch (currentMode) {
            case WindmillService_1.Mode.COOL:
            case WindmillService_1.Mode.ECO:
                return hap.Characteristic.CurrentHeatingCoolingState.COOL;
            case WindmillService_1.Mode.FAN:
                return hap.Characteristic.CurrentHeatingCoolingState.HEAT;
        }
    }
    /**
     * Handle requests to get the current value of the "Target Heating Cooling State" characteristic
     *
     * This is the mode that the user set the thermostat to (e.g. heat, cool, auto, off)
     */
    async handleGetTargetHeatingCoolingState() {
        this.log.debug('Triggered GET TargetHeatingCoolingState');
        const [currentPowerState, currentMode,] = await Promise.all([
            this.windmill.getPower(),
            this.windmill.getMode(),
        ]);
        if (!currentPowerState) {
            return hap.Characteristic.TargetHeatingCoolingState.OFF;
        }
        switch (currentMode) {
            case WindmillService_1.Mode.COOL:
                return hap.Characteristic.TargetHeatingCoolingState.COOL;
            case WindmillService_1.Mode.FAN:
                return hap.Characteristic.TargetHeatingCoolingState.HEAT;
            case WindmillService_1.Mode.ECO:
                return hap.Characteristic.TargetHeatingCoolingState.AUTO;
        }
    }
    /**
     * Handle requests to set the "Target Heating Cooling State" characteristic
     */
    async handleSetTargetHeatingCoolingState(value) {
        this.log.debug('Triggered SET TargetHeatingCoolingState:', value);
        if (value === hap.Characteristic.TargetHeatingCoolingState.OFF) {
            await this.windmill.setPower(false);
            return;
        }
        else {
            // If the mode is not off, we need to turn on the AC
            await this.windmill.setPower(true);
        }
        switch (value) {
            case hap.Characteristic.TargetHeatingCoolingState.COOL:
                await this.windmill.setMode(WindmillService_1.Mode.COOL);
                break;
            case hap.Characteristic.TargetHeatingCoolingState.HEAT:
                await this.windmill.setMode(WindmillService_1.Mode.FAN);
                break;
            case hap.Characteristic.TargetHeatingCoolingState.AUTO:
                await this.windmill.setMode(WindmillService_1.Mode.ECO);
                break;
        }
        // Default to AUTO fan speed when changing modes
        await this.windmill.setFanSpeed(WindmillService_1.FanSpeed.AUTO);
        // Update the fan state to match the mode
        await this.fanService.updateCharacteristic(hap.Characteristic.Active, false);
    }
    /**
     * Handle requests to get the current value of the "Current Temperature" characteristic
     */
    async handleGetCurrentTemperature() {
        this.log.debug('Triggered GET CurrentTemperature');
        const currentValue = await this.windmill.getCurrentTemperature();
        return (0, temperature_1.fahrenheitToCelsius)(currentValue);
    }
    /**
     * Handle requests to get the current value of the "Target Temperature" characteristic
     */
    async handleGetTargetTemperature() {
        this.log.debug('Triggered GET TargetTemperature');
        const currentValue = await this.windmill.getTargetTemperature();
        return (0, temperature_1.fahrenheitToCelsius)(currentValue);
    }
    /**
     * Handle requests to set the "Target Temperature" characteristic
     */
    async handleSetTargetTemperature(value) {
        this.log.debug('Triggered SET TargetTemperature:', value);
        const celsiusValue = (0, temperature_1.celsiusToFahrenheit)(parseFloat(value.toString()));
        return this.windmill.setTargetTemperature(celsiusValue);
    }
    /**
     * Handle requests to get the current value of the "Temperature Display Units" characteristic
     */
    handleGetTemperatureDisplayUnits() {
        this.log.debug('Triggered GET TemperatureDisplayUnits');
        return this.displayUnits;
    }
    /**
     * Handle requests to set the "Temperature Display Units" characteristic
     */
    handleSetTemperatureDisplayUnits(value) {
        this.log.debug('Triggered SET TemperatureDisplayUnits:', value);
        this.displayUnits = parseInt(value.toString(), 10);
    }
    async handleGetFanActive() {
        this.log.debug('Triggered GET FanActive');
        const [currentPowerState, fanSpeed,] = await Promise.all([
            this.windmill.getPower(),
            this.windmill.getFanSpeed(),
        ]);
        // If the fan is in AUTO mode, it is displayed as "off"
        if (!currentPowerState || fanSpeed === WindmillService_1.FanSpeed.AUTO) {
            return hap.Characteristic.Active.INACTIVE;
        }
        return hap.Characteristic.Active.ACTIVE;
    }
    async handleSetFanActive(value) {
        this.log.debug('Triggered SET FanActive:', value);
        // If the fan is turned off, set the fan speed to AUTO
        if (value === hap.Characteristic.Active.INACTIVE) {
            await this.windmill.setFanSpeed(WindmillService_1.FanSpeed.AUTO);
        }
    }
    async handleGetFanRotationSpeed() {
        this.log.debug('Triggered GET FanRotationSpeed');
        const [currentPowerState, fanSpeed,] = await Promise.all([
            this.windmill.getPower(),
            this.windmill.getFanSpeed(),
        ]);
        if (!currentPowerState) {
            return 0;
        }
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
    async handleSetFanRotationSpeed(value) {
        this.log.debug('Triggered SET FanRotationSpeed:', value);
        const intValue = parseInt(value.toString(), 10);
        // If value is 0, the fan speed will be set to AUTO by `handleSetFanActive`
        if (intValue === 0) {
            return;
        }
        if (intValue <= 33) {
            await this.windmill.setFanSpeed(WindmillService_1.FanSpeed.LOW);
        }
        else if (intValue <= 66) {
            await this.windmill.setFanSpeed(WindmillService_1.FanSpeed.MEDIUM);
        }
        else if (intValue <= 100) {
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