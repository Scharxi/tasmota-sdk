"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VERSION = exports.SDKOptionsSchema = exports.DiscoveryDeviceSchema = exports.StatusResponseSchema = exports.PowerCommandSchema = exports.PowerStateSchema = exports.DeviceConfigSchema = exports.retryOperation = exports.parseCommandResponse = exports.generateIpRange = exports.isValidIpAddress = exports.normalizeIpAddress = exports.transformToDiscoveryDevice = exports.transformToEnergyData = exports.transformToPowerStatus = exports.transformToDeviceInfo = exports.TasmotaError = exports.TasmotaDeviceDiscovery = exports.TasmotaDevice = exports.TasmotaSDK = void 0;
exports.createSDK = createSDK;
exports.createDevice = createDevice;
exports.createDiscovery = createDiscovery;
exports.discoverDevices = discoverDevices;
exports.scanDevice = scanDevice;
exports.isTasmotaDevice = isTasmotaDevice;
// Main SDK exports
var tasmota_sdk_1 = require("./sdk/tasmota-sdk");
Object.defineProperty(exports, "TasmotaSDK", { enumerable: true, get: function () { return tasmota_sdk_1.TasmotaSDK; } });
var tasmota_device_1 = require("./device/tasmota-device");
Object.defineProperty(exports, "TasmotaDevice", { enumerable: true, get: function () { return tasmota_device_1.TasmotaDevice; } });
var device_discovery_1 = require("./discovery/device-discovery");
Object.defineProperty(exports, "TasmotaDeviceDiscovery", { enumerable: true, get: function () { return device_discovery_1.TasmotaDeviceDiscovery; } });
// Import classes for use in functions
const tasmota_sdk_2 = require("./sdk/tasmota-sdk");
const tasmota_device_2 = require("./device/tasmota-device");
const device_discovery_2 = require("./discovery/device-discovery");
const errors_1 = require("./errors");
// Errors
var errors_2 = require("./errors");
Object.defineProperty(exports, "TasmotaError", { enumerable: true, get: function () { return errors_2.TasmotaError; } });
// Utilities (for advanced users)
var transformers_1 = require("./utils/transformers");
Object.defineProperty(exports, "transformToDeviceInfo", { enumerable: true, get: function () { return transformers_1.transformToDeviceInfo; } });
Object.defineProperty(exports, "transformToPowerStatus", { enumerable: true, get: function () { return transformers_1.transformToPowerStatus; } });
Object.defineProperty(exports, "transformToEnergyData", { enumerable: true, get: function () { return transformers_1.transformToEnergyData; } });
Object.defineProperty(exports, "transformToDiscoveryDevice", { enumerable: true, get: function () { return transformers_1.transformToDiscoveryDevice; } });
Object.defineProperty(exports, "normalizeIpAddress", { enumerable: true, get: function () { return transformers_1.normalizeIpAddress; } });
Object.defineProperty(exports, "isValidIpAddress", { enumerable: true, get: function () { return transformers_1.isValidIpAddress; } });
Object.defineProperty(exports, "generateIpRange", { enumerable: true, get: function () { return transformers_1.generateIpRange; } });
Object.defineProperty(exports, "parseCommandResponse", { enumerable: true, get: function () { return transformers_1.parseCommandResponse; } });
Object.defineProperty(exports, "retryOperation", { enumerable: true, get: function () { return transformers_1.retryOperation; } });
// Zod schemas for validation (for advanced users)
var types_1 = require("./types");
Object.defineProperty(exports, "DeviceConfigSchema", { enumerable: true, get: function () { return types_1.DeviceConfig; } });
Object.defineProperty(exports, "PowerStateSchema", { enumerable: true, get: function () { return types_1.PowerState; } });
Object.defineProperty(exports, "PowerCommandSchema", { enumerable: true, get: function () { return types_1.PowerCommand; } });
Object.defineProperty(exports, "StatusResponseSchema", { enumerable: true, get: function () { return types_1.StatusResponse; } });
Object.defineProperty(exports, "DiscoveryDeviceSchema", { enumerable: true, get: function () { return types_1.DiscoveryDevice; } });
Object.defineProperty(exports, "SDKOptionsSchema", { enumerable: true, get: function () { return types_1.SDKOptions; } });
/**
 * Create a new SDK instance
 */
function createSDK(options) {
    return new tasmota_sdk_2.TasmotaSDK(options);
}
/**
 * Create a new device instance from IP address
 */
function createDevice(ipAddress, options) {
    return tasmota_device_2.TasmotaDevice.fromIp(ipAddress, options);
}
/**
 * Create a new device discovery instance
 */
function createDiscovery(options) {
    return new device_discovery_2.TasmotaDeviceDiscovery(options);
}
/**
 * Quick discovery function
 */
async function discoverDevices(options) {
    return device_discovery_2.TasmotaDeviceDiscovery.discover(options);
}
/**
 * Quick device scan function
 */
async function scanDevice(ip, timeout) {
    return device_discovery_2.TasmotaDeviceDiscovery.scanDevice(ip, timeout);
}
/**
 * Check if a device is a Tasmota device
 */
async function isTasmotaDevice(ip, timeout) {
    return device_discovery_2.TasmotaDeviceDiscovery.isTasmotaDevice(ip, timeout);
}
// Version information
exports.VERSION = '1.0.0';
// Default export for convenience
exports.default = {
    TasmotaSDK: tasmota_sdk_2.TasmotaSDK,
    TasmotaDevice: tasmota_device_2.TasmotaDevice,
    TasmotaDeviceDiscovery: device_discovery_2.TasmotaDeviceDiscovery,
    TasmotaError: errors_1.TasmotaError,
    createSDK,
    createDevice,
    createDiscovery,
    discoverDevices,
    scanDevice,
    isTasmotaDevice,
    VERSION: exports.VERSION,
};
//# sourceMappingURL=index.js.map