import { Logging } from 'homebridge';
import fetch from 'node-fetch';
import { URL } from 'url';

const BASE_URL = 'https://dashboard.windmillair.com';

export enum Pin {
    POWER = 'V0',
    CURRENT_TEMP = 'V1',
    TARGET_TEMP = 'V2',
    MODE = 'V3',
    FAN = 'V4',
}

enum ModeInt {
    FAN = 0,
    COOL = 1,
    ECO = 2,
}

export enum Mode {
    FAN = 'Fan',
    COOL = 'Cool',
    ECO = 'Eco',
}

export enum FanSpeed {
    AUTO = 'Auto',
    LOW = 'Low',
    MEDIUM = 'Medium',
    HIGH = 'High',
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

  public async setPinValue(pin: Pin, value: string): Promise<void> {
    this.log(`Setting pin value for ${pin} to ${value}`);
    const url = new URL('/external/api/update', BASE_URL);
    url.searchParams.append('token', this.token);
    url.searchParams.append(pin, value);

    this.log(`Fetching ${url.toString()}`);
    const response = await fetch(url.toString());

    if (!response.ok) {
      this.log(`Failed to set pin value for ${pin}`, response.statusText);
      throw new Error(`Failed to set pin value for ${pin}`);
    }
  }

  public async getPower(): Promise<boolean> {
    this.log('Getting power');
    const value = await this.getPinValue(Pin.POWER);
    return value === '1';
  }

  public async getCurrentTemperature(): Promise<number> {
    this.log('Getting current temperature');
    const value = await this.getPinValue(Pin.CURRENT_TEMP);
    return parseFloat(value);
  }

  public async getTargetTemperature(): Promise<number> {
    this.log('Getting target temperature');
    const value = await this.getPinValue(Pin.TARGET_TEMP);
    return parseFloat(value);
  }

  public async getMode(): Promise<Mode> {
    this.log('Getting mode');
    const value = await this.getPinValue(Pin.MODE);
    return value as Mode;
  }

  public async getFanSpeed(): Promise<FanSpeed> {
    this.log('Getting fan speed');
    const value = await this.getPinValue(Pin.FAN);
    return value as FanSpeed;
  }

  public async setPower(value: boolean): Promise<void> {
    this.log(`Setting power to ${value}`);
    await this.setPinValue(Pin.POWER, value ? '1' : '0');
  }

  public async setTargetTemperature(value: number): Promise<void> {
    this.log(`Setting target temperature to ${value}`);
    await this.setPinValue(Pin.TARGET_TEMP, value.toString());
  }

  public async setMode(value: Mode): Promise<void> {
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

  public async setFanSpeed(value: FanSpeed): Promise<void> {
    this.log(`Setting fan speed to ${value}`);
    await this.setPinValue(Pin.FAN, value);
  }
}