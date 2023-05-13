import {
  Characteristic,
  CharacteristicEventTypes,
  CharacteristicGetCallback,
  Service,
  CharacteristicValue,
  CharacteristicSetCallback,
} from 'hap-nodejs';
import { AccessoryConfig, AccessoryPlugin, Logging } from 'homebridge';

export class WindmillThermostatAccessory implements AccessoryPlugin {

  private readonly log: Logging;
  private readonly name: string;
  private switchOn = false;

  private readonly switchService: Service;
  private readonly informationService: Service;

  constructor(log: Logging, config: AccessoryConfig) {
    this.log = log;
    this.name = config.name;

    this.switchService = new Service.Switch(this.name);
    this.switchService.getCharacteristic(Characteristic.On)
      .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
        log.info('Current state of the switch was returned: ' + (this.switchOn? 'ON': 'OFF'));
        callback(undefined, this.switchOn);
      })
      .on(CharacteristicEventTypes.SET, (value: CharacteristicValue, callback: CharacteristicSetCallback) => {
        this.switchOn = value as boolean;
        log.info('Switch state was set to: ' + (this.switchOn? 'ON': 'OFF'));
        callback();
      });

    this.informationService = new Service.AccessoryInformation()
      .setCharacteristic(Characteristic.Manufacturer, 'Custom Manufacturer')
      .setCharacteristic(Characteristic.Model, 'Custom Model');

    log.info('Switch finished initializing!');
  }

  /*
     * This method is optional to implement. It is called when HomeKit ask to identify the accessory.
     * Typical this only ever happens at the pairing process.
     */
  identify(): void {
    this.log('Identify!');
  }

  /*
     * This method is called directly after creation of this instance.
     * It should return all services which should be added to the accessory.
     */
  getServices(): Service[] {
    return [
      this.informationService,
      this.switchService,
    ];
  }

}