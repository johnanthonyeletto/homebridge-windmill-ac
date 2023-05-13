import { API } from 'homebridge';

import { PLATFORM_NAME } from './settings';
import { WindmillThermostatAccessory } from './accessory';

/**
 * This method registers the platform with Homebridge
 */
export = (api: API) => {
  api.registerAccessory(PLATFORM_NAME, WindmillThermostatAccessory);
};
