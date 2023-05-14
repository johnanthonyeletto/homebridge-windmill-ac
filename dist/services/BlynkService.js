"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlynkService = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const url_1 = require("url");
/**
 * Service class for interacting with Blynk API
 * See: https://docs.blynk.io/en/blynk.cloud/https-api-overview
 */
class BlynkService {
    constructor({ serverAddress, token }) {
        this.serverAddress = serverAddress;
        this.token = token;
    }
    /**
     * Gets the value of a pin
     *
     * @param pin The virtual pin to get the value of (e.g. V1)
     * @returns The value of the pin
     */
    async getPinValue(pin) {
        const url = new url_1.URL('/external/api/get', this.serverAddress);
        url.searchParams.append('token', this.token);
        url.searchParams.append(pin, '');
        const response = await (0, node_fetch_1.default)(url.toString());
        if (!response.ok) {
            throw new Error(`Failed to get pin value for ${pin}`);
        }
        const text = await response.text();
        return text;
    }
    /**
     *
     * @param pin The virtual pin to set the value of (e.g. V1)
     * @param value The value to set the pin to
     * @returns Whether the pin was successfully set
     */
    async setPinValue(pin, value) {
        const url = new url_1.URL('/external/api/update', this.serverAddress);
        url.searchParams.append('token', this.token);
        url.searchParams.append(pin, value);
        const response = await (0, node_fetch_1.default)(url.toString());
        if (!response.ok) {
            throw new Error(`Failed to set pin value for ${pin}`);
        }
        const text = await response.text();
        return text === '1';
    }
}
exports.BlynkService = BlynkService;
//# sourceMappingURL=BlynkService.js.map