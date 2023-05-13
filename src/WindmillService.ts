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

  constructor(token: string) {
    this.token = token;
  }

  public async getPinValue(pin: Pin): Promise<string> {
    const url = new URL('/external/api/get', BASE_URL);
    url.searchParams.append('token', this.token);
    url.searchParams.append(pin, '');

    const response = await fetch(url.toString());
    const text = await response.text();

    return text;
  }

  public async getCurrentTemperature(): Promise<number> {
    const value = await this.getPinValue(Pin.CURRENT_TEMP);
    return parseFloat(value);
  }
}