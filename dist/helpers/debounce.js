"use strict";
// Helper function to debounce a function
Object.defineProperty(exports, "__esModule", { value: true });
exports.debounce = void 0;
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            return func(...args);
        };
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(later, wait);
    };
};
exports.debounce = debounce;
//# sourceMappingURL=debounce.js.map