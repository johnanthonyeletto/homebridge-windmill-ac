import fetch from 'node-fetch';
import PQueue from 'p-queue';
import { URL } from 'url';
/**
 * Service class for interacting with Blynk API
 * See: https://docs.blynk.io/en/blynk.cloud/https-api-overview
 */
export class BlynkService {
    constructor({ serverAddress, token, log }) {
        this.logger = log;
        this.serverAddress = serverAddress;
        this.token = token;
        this.queue = new PQueue({ concurrency: 1 });
        this.queue.on('active', () => {
            var _a;
            (_a = this.logger) === null || _a === void 0 ? void 0 : _a.debug(`[Blynk Queue] Size: ${this.queue.size} Pending: ${this.queue.pending}`);
        });
    }
    /**
     * Gets the value of a pin
     *
     * @param pin The virtual pin to get the value of (e.g. V1)
     * @returns The value of the pin
     */
    async getPinValue(pin) {
        return this.queue.add(async () => {
            const url = new URL('/external/api/get', this.serverAddress);
            url.searchParams.append('token', this.token);
            url.searchParams.append(pin, '');
            const response = await fetch(url.toString());
            if (!response.ok) {
                throw new Error(`Failed to get pin value for ${pin}`);
            }
            const text = await response.text();
            return text;
        });
    }
    /**
     *
     * @param pin The virtual pin to set the value of (e.g. V1)
     * @param value The value to set the pin to
     * @returns Whether the pin was successfully set
     */
    async setPinValue(pin, value) {
        this.queue.add(async () => {
            const url = new URL('/external/api/update', this.serverAddress);
            url.searchParams.append('token', this.token);
            url.searchParams.append(pin, value);
            const response = await fetch(url.toString());
            if (!response.ok) {
                throw new Error(`Failed to set pin value for ${pin}`);
            }
            const text = await response.text();
            return text === '1';
        });
    }
}
//# sourceMappingURL=BlynkService.js.map