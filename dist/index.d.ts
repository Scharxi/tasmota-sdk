export { TasmotaSDK } from './sdk/tasmota-sdk';
export { TasmotaDevice } from './device/tasmota-device';
export { TasmotaDeviceDiscovery } from './discovery/device-discovery';
import { TasmotaSDK } from './sdk/tasmota-sdk';
import { TasmotaDevice } from './device/tasmota-device';
import { TasmotaDeviceDiscovery } from './discovery/device-discovery';
import { TasmotaError } from './errors';
import type { SDKOptions, DeviceConfig, DiscoveryDevice } from './types';
import type { DiscoveryOptions, DiscoveryResult } from './discovery/device-discovery';
export type { DeviceConfig, DeviceInfo, PowerStatus, PowerState, PowerCommand, EnergyData, CommandResponse, DiscoveryDevice, SDKOptions, TasmotaErrorType, TasmotaErrorDetails, } from './types';
export type { DeviceOperationOptions, } from './device/tasmota-device';
export type { DiscoveryOptions, DiscoveryResult, } from './discovery/device-discovery';
export type { DeviceEntry, BulkOperationResult, } from './sdk/tasmota-sdk';
export { TasmotaError } from './errors';
export { transformToDeviceInfo, transformToPowerStatus, transformToEnergyData, transformToDiscoveryDevice, normalizeIpAddress, isValidIpAddress, generateIpRange, parseCommandResponse, retryOperation, } from './utils/transformers';
export { DeviceConfig as DeviceConfigSchema, PowerState as PowerStateSchema, PowerCommand as PowerCommandSchema, StatusResponse as StatusResponseSchema, DiscoveryDevice as DiscoveryDeviceSchema, SDKOptions as SDKOptionsSchema, } from './types';
/**
 * Create a new SDK instance
 */
export declare function createSDK(options?: SDKOptions): TasmotaSDK;
/**
 * Create a new device instance from IP address
 */
export declare function createDevice(ipAddress: string, options?: Partial<DeviceConfig>): TasmotaDevice;
/**
 * Create a new device discovery instance
 */
export declare function createDiscovery(options?: SDKOptions): TasmotaDeviceDiscovery;
/**
 * Quick discovery function
 */
export declare function discoverDevices(options?: DiscoveryOptions): Promise<DiscoveryResult>;
/**
 * Quick device scan function
 */
export declare function scanDevice(ip: string, timeout?: number): Promise<DiscoveryDevice | null>;
/**
 * Check if a device is a Tasmota device
 */
export declare function isTasmotaDevice(ip: string, timeout?: number): Promise<boolean>;
export type { AxiosRequestConfig } from 'axios';
export type { z } from 'zod';
export declare const VERSION = "1.0.0";
declare const _default: {
    TasmotaSDK: typeof TasmotaSDK;
    TasmotaDevice: typeof TasmotaDevice;
    TasmotaDeviceDiscovery: typeof TasmotaDeviceDiscovery;
    TasmotaError: typeof TasmotaError;
    createSDK: typeof createSDK;
    createDevice: typeof createDevice;
    createDiscovery: typeof createDiscovery;
    discoverDevices: typeof discoverDevices;
    scanDevice: typeof scanDevice;
    isTasmotaDevice: typeof isTasmotaDevice;
    VERSION: string;
};
export default _default;
//# sourceMappingURL=index.d.ts.map