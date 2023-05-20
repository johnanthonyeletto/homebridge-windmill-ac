import { Logging } from 'homebridge';
import { BlynkService } from './BlynkService';

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

enum FanSpeedInt {
    AUTO = 0,
    LOW = 1,
    MEDIUM = 2,
    HIGH = 3,
}

export enum FanSpeed {
    AUTO = 'Auto',
    LOW = 'Low',
    MEDIUM = 'Medium',
    HIGH = 'High',
}

export class WindmillService extends BlynkService {

  constructor(token: string, private readonly log: Logging) {
    super({ serverAddress: BASE_URL, token });
  }

  public async getPower(): Promise<boolean> {
    this.log.debug('Getting power');
    const value = await this.getPinValue(Pin.POWER);
    this.log.debug(`Power is ${value}`);
    return value === '1';
  }

  public async getCurrentTemperature(): Promise<number> {
    this.log.debug('Getting current temperature');
    const value = await this.getPinValue(Pin.CURRENT_TEMP);
    this.log.debug(`Current temperature is ${value}`);
    return parseFloat(value);
  }

  public async getTargetTemperature(): Promise<number> {
    this.log.debug('Getting target temperature');
    const value = await this.getPinValue(Pin.TARGET_TEMP);
    this.log.debug(`Target temperature is ${value}`);
    return parseFloat(value);
  }

  public async getMode(): Promise<Mode> {
    this.log.debug('Getting mode');
    const value = await this.getPinValue(Pin.MODE);
    this.log.debug(`Mode is ${value}`);
    return value as Mode;
  }

  public async getFanSpeed(): Promise<FanSpeed> {
    this.log.debug('Getting fan speed');
    const value = await this.getPinValue(Pin.FAN);
    this.log.debug(`Fan speed is ${value}`);
    return value as FanSpeed;
  }

  public async setPower(value: boolean): Promise<void> {
    this.log.debug(`Setting power to ${value}`);
    await this.setPinValue(Pin.POWER, value ? '1' : '0');
  }

  public async setTargetTemperature(value: number): Promise<void> {
    this.log.debug(`Setting target temperature to ${value}`);
    await this.setPinValue(Pin.TARGET_TEMP, Math.round(value).toString());
  }

  public async setMode(value: Mode): Promise<void> {
    this.log.debug(`Setting mode to ${value}`);
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
    this.log.debug(`Setting fan speed to ${value}`);
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