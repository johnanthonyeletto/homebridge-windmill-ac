"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WindmillService = exports.FanSpeed = exports.Mode = exports.Pin = void 0;
const BlynkService_1 = require("./BlynkService");
const BASE_URL = 'https://dashboard.windmillair.com';
var Pin;
(function (Pin) {
    Pin["POWER"] = "V0";
    Pin["CURRENT_TEMP"] = "V1";
    Pin["TARGET_TEMP"] = "V2";
    Pin["MODE"] = "V3";
    Pin["FAN"] = "V4";
})(Pin = exports.Pin || (exports.Pin = {}));
var ModeInt;
(function (ModeInt) {
    ModeInt[ModeInt["FAN"] = 0] = "FAN";
    ModeInt[ModeInt["COOL"] = 1] = "COOL";
    ModeInt[ModeInt["ECO"] = 2] = "ECO";
})(ModeInt || (ModeInt = {}));
var Mode;
(function (Mode) {
    Mode["FAN"] = "Fan";
    Mode["COOL"] = "Cool";
    Mode["ECO"] = "Eco";
})(Mode = exports.Mode || (exports.Mode = {}));
var FanSpeedInt;
(function (FanSpeedInt) {
    FanSpeedInt[FanSpeedInt["AUTO"] = 0] = "AUTO";
    FanSpeedInt[FanSpeedInt["LOW"] = 1] = "LOW";
    FanSpeedInt[FanSpeedInt["MEDIUM"] = 2] = "MEDIUM";
    FanSpeedInt[FanSpeedInt["HIGH"] = 3] = "HIGH";
})(FanSpeedInt || (FanSpeedInt = {}));
var FanSpeed;
(function (FanSpeed) {
    FanSpeed["AUTO"] = "Auto";
    FanSpeed["LOW"] = "Low";
    FanSpeed["MEDIUM"] = "Medium";
    FanSpeed["HIGH"] = "High";
})(FanSpeed = exports.FanSpeed || (exports.FanSpeed = {}));
class WindmillService extends BlynkService_1.BlynkService {
    constructor(token, log) {
        super({ serverAddress: BASE_URL, token });
        this.log = log;
    }
    async getPower() {
        this.log('Getting power');
        const value = await this.getPinValue(Pin.POWER);
        this.log(`Power is ${value}`);
        return value === '1';
    }
    async getCurrentTemperature() {
        this.log('Getting current temperature');
        const value = await this.getPinValue(Pin.CURRENT_TEMP);
        this.log(`Current temperature is ${value}`);
        return parseFloat(value);
    }
    async getTargetTemperature() {
        this.log('Getting target temperature');
        const value = await this.getPinValue(Pin.TARGET_TEMP);
        this.log(`Target temperature is ${value}`);
        return parseFloat(value);
    }
    async getMode() {
        this.log('Getting mode');
        const value = await this.getPinValue(Pin.MODE);
        this.log(`Mode is ${value}`);
        return value;
    }
    async getFanSpeed() {
        this.log('Getting fan speed');
        const value = await this.getPinValue(Pin.FAN);
        this.log(`Fan speed is ${value}`);
        return value;
    }
    async setPower(value) {
        this.log(`Setting power to ${value}`);
        await this.setPinValue(Pin.POWER, value ? '1' : '0');
    }
    async setTargetTemperature(value) {
        this.log(`Setting target temperature to ${value}`);
        await this.setPinValue(Pin.TARGET_TEMP, value.toString());
    }
    async setMode(value) {
        this.log(`Setting mode to ${value}`);
        switch (value) {
            case Mode.FAN:
                await this.setPinValue(Pin.MODE, ModeInt.FAN.toString());
                break;
            case Mode.COOL:
                await this.setPinValue(Pin.MODE, ModeInt.COOL.toString());
                break;
            case Mode.ECO:
                await this.setPinValue(Pin.MODE, ModeInt.ECO.toString());
                break;
        }
    }
    async setFanSpeed(value) {
        this.log(`Setting fan speed to ${value}`);
        switch (value) {
            case FanSpeed.AUTO:
                await this.setPinValue(Pin.FAN, FanSpeedInt.AUTO.toString());
                break;
            case FanSpeed.LOW:
                await this.setPinValue(Pin.FAN, FanSpeedInt.LOW.toString());
                break;
            case FanSpeed.MEDIUM:
                await this.setPinValue(Pin.FAN, FanSpeedInt.MEDIUM.toString());
                break;
            case FanSpeed.HIGH:
                await this.setPinValue(Pin.FAN, FanSpeedInt.HIGH.toString());
                break;
        }
    }
}
exports.WindmillService = WindmillService;
//# sourceMappingURL=WindmillService.js.map