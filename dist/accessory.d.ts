import { API, AccessoryConfig, AccessoryPlugin, Logging, Service } from 'homebridge';
export declare class WindmillThermostatAccessory implements AccessoryPlugin {
    private readonly log;
    private readonly config;
    private readonly api;
    private readonly service;
    private readonly Service;
    private readonly Characteristic;
    readonly name: string;
    constructor(log: Logging, config: AccessoryConfig, api: API);
    /**
                   * Handle requests to get the current value of the "Current Heating Cooling State" characteristic
                   */
    handleCurrentHeatingCoolingStateGet(): number;
    /**
                   * Handle requests to get the current value of the "Target Heating Cooling State" characteristic
                   */
    handleTargetHeatingCoolingStateGet(): number;
    /**
                   * Handle requests to set the "Target Heating Cooling State" characteristic
                   */
    handleTargetHeatingCoolingStateSet(value: any): void;
    /**
                   * Handle requests to get the current value of the "Current Temperature" characteristic
                   */
    handleCurrentTemperatureGet(): number;
    /**
                   * Handle requests to get the current value of the "Target Temperature" characteristic
                   */
    handleTargetTemperatureGet(): number;
    /**
                   * Handle requests to set the "Target Temperature" characteristic
                   */
    handleTargetTemperatureSet(value: any): void;
    /**
                   * Handle requests to get the current value of the "Temperature Display Units" characteristic
                   */
    handleTemperatureDisplayUnitsGet(): number;
    /**
                   * Handle requests to set the "Temperature Display Units" characteristic
                   */
    handleTemperatureDisplayUnitsSet(value: any): void;
    getServices(): Service[];
}
//# sourceMappingURL=accessory.d.ts.map