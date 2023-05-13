export interface BlynkServiceConfig {
    serverAddress: string;
    token: string;
}
/**
 * Service class for interacting with Blynk API
 * See: https://docs.blynk.io/en/blynk.cloud/https-api-overview
 */
export declare class BlynkService {
    protected readonly serverAddress: string;
    protected readonly token: string;
    constructor({ serverAddress, token }: BlynkServiceConfig);
    /**
     * Gets the value of a pin
     *
     * @param pin The virtual pin to get the value of (e.g. V1)
     * @returns The value of the pin
     */
    protected getPinValue(pin: string): Promise<string>;
    /**
     *
     * @param pin The virtual pin to set the value of (e.g. V1)
     * @param value The value to set the pin to
     * @returns Whether the pin was successfully set
     */
    protected setPinValue(pin: string, value: string): Promise<boolean>;
}
//# sourceMappingURL=BlynkService.d.ts.map