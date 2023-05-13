export declare enum Pin {
    CURRENT_TEMP = "V1",
    TARGET_TEMP = "V2",
    MODE = "V3",
    FAN = "V4"
}
export declare class WindmillService {
    private readonly token;
    constructor(token: string);
    getPinValue(pin: Pin): Promise<string>;
    getCurrentTemperature(): Promise<number>;
}
//# sourceMappingURL=WindmillService.d.ts.map