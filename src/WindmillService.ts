import { Logging } from 'homebridge';
import fetch from 'node-fetch';
import { URL } from 'url';

const BASE_URL = 'https://dashboard.windmillair.com';

export enum Pin {
    CURRENT_TEMP = 'V1',
    TARGET_TEMP = 'V2',
    MODE = 'V3',
    FAN = 'V4',
}

export class WindmillService {
  private readonly token: string;

  constructor(token: string, private readonly log: Logging) {
    this.token = token;
  }

  public async getPinValue(pin: Pin): Promise<string> {
    this.log(`Getting pin value for ${pin}`);
    const url = new URL('/external/api/get', BASE_URL);
    url.searchParams.append('token', this.token);
    url.searchParams.append(pin, '');

    this.log(`Fetching ${url.toString()}`);
    const response = await fetch(url.toString());

    if (!response.ok) {
      this.log(`Failed to get pin value for ${pin}`, response.statusText);
      throw new Error(`Failed to get pin value for ${pin}`);
    }

    const text = await response.text();

    return text;
  }

  public async getCurrentTemperature(): Promise<number> {
    this.log('Getting current temperature');
    const value = await this.getPinValue(Pin.CURRENT_TEMP);
    return parseFloat(value);
  }
}