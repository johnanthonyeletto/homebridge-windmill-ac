"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WindmillService = exports.Pin = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const url_1 = require("url");
const BASE_URL = 'https://dashboard.windmillair.com';
var Pin;
(function (Pin) {
    Pin["CURRENT_TEMP"] = "V1";
    Pin["TARGET_TEMP"] = "V2";
    Pin["MODE"] = "V3";
    Pin["FAN"] = "V4";
})(Pin = exports.Pin || (exports.Pin = {}));
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
        const response = await (0, node_fetch_1.default)(url.toString());
        if (!response.ok) {
            this.log(`Failed to get pin value for ${pin}`, response.statusText);
            throw new Error(`Failed to get pin value for ${pin}`);
        }
        const text = await response.text();
        return text;
    }
    async getCurrentTemperature() {
        this.log('Getting current temperature');
        const value = await this.getPinValue(Pin.CURRENT_TEMP);
        return parseFloat(value);
    }
}
exports.WindmillService = WindmillService;
//# sourceMappingURL=WindmillService.js.map