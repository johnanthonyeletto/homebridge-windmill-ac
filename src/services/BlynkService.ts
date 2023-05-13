import fetch from 'node-fetch';
import { URL } from 'url';



export interface BlynkServiceConfig {
    serverAddress: string;
    token: string;
}

/**
 * Service class for interacting with Blynk API
 * See: https://docs.blynk.io/en/blynk.cloud/https-api-overview
 */
export class BlynkService {
  protected readonly serverAddress: string;
  protected readonly token: string;

  constructor({ serverAddress, token }: BlynkServiceConfig) {
    this.serverAddress = serverAddress;
    this.token = token;
  }

  /**
   * Gets the value of a pin
   *
   * @param pin The virtual pin to get the value of (e.g. V1)
   * @returns The value of the pin
   */
  protected async getPinValue(pin: string) {
    const url = new URL('/external/api/get', this.serverAddress);
    url.searchParams.append('token', this.token);
    url.searchParams.append(pin, '');

    const response = await fetch(url.toString());

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
  protected async setPinValue(pin: string, value: string): Promise<boolean> {
    const url = new URL('/external/api/update', this.serverAddress);
    url.searchParams.append('token', this.token);
    url.searchParams.append(pin, value);

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Failed to set pin value for ${pin}`);
    }

    const text = await response.text();

    return text === '1';
  }
}