"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WindmillService = exports.FanSpeed = exports.Mode = exports.Pin = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const url_1 = require("url");
const BASE_URL = 'https://dashboard.windmillair.com';
var Pin;
(function (Pin) {
    Pin["POWER"] = "V0";
    Pin["CURRENT_TEMP"] = "V1";
    Pin["TARGET_TEMP"] = "V2";
    Pin["MODE"] = "V3";
    Pin["FAN"] = "V4";
})(Pin = exports.Pin || (exports.Pin = {}));
var Mode;
(function (Mode) {
    Mode["FAN"] = "Fan";
    Mode["COOL"] = "Cool";
    Mode["ECO"] = "Eco";
})(Mode = exports.Mode || (exports.Mode = {}));
var FanSpeed;
(function (FanSpeed) {
    FanSpeed["AUTO"] = "Auto";
    FanSpeed["LOW"] = "Low";
    FanSpeed["MEDIUM"] = "Medium";
    FanSpeed["HIGH"] = "High";
})(FanSpeed = exports.FanSpeed || (exports.FanSpeed = {}));
class WindmillService {
    constructor(token, log) {
        this.log = log;
        this.token = token;
    }
    async getPinValue(pin) {
        this.log(`Getting pin value for ${pin}`);
        const url = new url_1.URL('/external/api/get', BASE_URL);
        url.searchParams.append('token', this.token);
        url.searchParams.append(pin, '');
        this.log(`Fetching ${url.toString()}`);
        const response = await (0, node_fetch_1.default)(url.toString());
        if (!response.ok) {
            this.log(`Failed to get pin value for ${pin}`, response.statusText);
            throw new Error(`Failed to get pin value for ${pin}`);
        }
        const text = await response.text();
        return text;
    }
    async setPinValue(pin, value) {
        this.log(`Setting pin value for ${pin} to ${value}`);
        const url = new url_1.URL('/external/api/update', BASE_URL);
        url.searchParams.append('token', this.token);
        url.searchParams.append(pin, value);
        this.log(`Fetching ${url.toString()}`);
        const response = await (0, node_fetch_1.default)(url.toString());
        if (!response.ok) {
            this.log(`Failed to set pin value for ${pin}`, response.statusText);
            throw new Error(`Failed to set pin value for ${pin}`);
        }
    }
    async getPower() {
        this.log('Getting power');
        const value = await this.getPinValue(Pin.POWER);
        return value === '1';
    }
    async getCurrentTemperature() {
        this.log('Getting current temperature');
        const value = await this.getPinValue(Pin.CURRENT_TEMP);
        return parseFloat(value);
    }
    async getTargetTemperature() {
        this.log('Getting target temperature');
        const value = await this.getPinValue(Pin.TARGET_TEMP);
        return parseFloat(value);
    }
    async getMode() {
        this.log('Getting mode');
        const value = await this.getPinValue(Pin.MODE);
        return value;
    }
    async getFanSpeed() {
        this.log('Getting fan speed');
        const value = await this.getPinValue(Pin.FAN);
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
        await this.setPinValue(Pin.MODE, value);
    }
    async setFanSpeed(value) {
        this.log(`Setting fan speed to ${value}`);
        await this.setPinValue(Pin.FAN, value);
    }
}
exports.WindmillService = WindmillService;
//# sourceMappingURL=WindmillService.js.map