"use strict";
const settings_1 = require("./settings");
const accessory_1 = require("./accessory");
module.exports = (api) => {
    api.registerAccessory(settings_1.PLATFORM_NAME, accessory_1.WindmillThermostatAccessory);
};
//# sourceMappingURL=index.js.map