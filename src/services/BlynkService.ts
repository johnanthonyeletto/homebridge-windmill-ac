import { Logging } from 'homebridge';
import fetch from 'node-fetch';
import PQueue from 'p-queue';
import { URL } from 'url';

export interface BlynkServiceConfig {
    serverAddress: string;
    token: string;
    log?: Logging;
}

/**
 * Service class for interacting with Blynk API
 * See: https://docs.blynk.io/en/blynk.cloud/https-api-overview
 */
export class BlynkService {
  protected readonly serverAddress: string;
  protected readonly token: string;
  private readonly logger?: Logging;

  private queue: PQueue;

  constructor({ serverAddress, token, log }: BlynkServiceConfig) {
    this.logger = log;
    this.serverAddress = serverAddress;
    this.token = token;

    this.queue = new PQueue({ concurrency: 1 });

    this.queue.on('active', () => {
      this.logger?.debug(`[Blynk Queue] Size: ${this.queue.size} Pending: ${this.queue.pending}`);
    });
    
  }

  /**
   * Gets the value of a pin
   *
   * @param pin The virtual pin to get the value of (e.g. V1)
   * @returns The value of the pin
   */
  protected async getPinValue(pin: string) {
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
  protected async setPinValue(pin: string, value: string): Promise<boolean | void> {
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
