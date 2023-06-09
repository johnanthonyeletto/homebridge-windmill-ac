"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fahrenheitToCelsius = exports.celsiusToFahrenheit = void 0;
const celsiusToFahrenheit = (celsius) => {
    return (celsius * 9) / 5 + 32;
};
exports.celsiusToFahrenheit = celsiusToFahrenheit;
const fahrenheitToCelsius = (fahrenheit) => {
    return ((fahrenheit - 32) * 5) / 9;
};
exports.fahrenheitToCelsius = fahrenheitToCelsius;
//# sourceMappingURL=temperature.js.map