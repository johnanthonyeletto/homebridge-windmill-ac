import { AccessoryConfig } from 'homebridge';

export interface WindmillThermostatAccessoryConfig extends AccessoryConfig {
    token: string;
}