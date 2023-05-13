import { Logging } from 'homebridge';
export declare enum Pin {
    POWER = "V0",
    CURRENT_TEMP = "V1",
    TARGET_TEMP = "V2",
    MODE = "V3",
    FAN = "V4"
}
export declare enum Mode {
    FAN = "Fan",
    COOL = "Cool",
    ECO = "Eco"
}
export declare enum FanSpeed {
    AUTO = "Auto",
    LOW = "Low",
    MEDIUM = "Medium",
    HIGH = "High"
}
export declare class WindmillService {
    private readonly log;
    private readonly token;
    constructor(token: string, log: Logging);
    getPinValue(pin: Pin): Promise<string>;
    setPinValue(pin: Pin, value: string): Promise<void>;
    getPower(): Promise<boolean>;
    getCurrentTemperature(): Promise<number>;
    getTargetTemperature(): Promise<number>;
    getMode(): Promise<Mode>;
    getFanSpeed(): Promise<FanSpeed>;
    setPower(value: boolean): Promise<void>;
    setTargetTemperature(value: number): Promise<void>;
    setMode(value: Mode): Promise<void>;
    setFanSpeed(value: FanSpeed): Promise<void>;
}
//# sourceMappingURL=WindmillService.d.ts.map