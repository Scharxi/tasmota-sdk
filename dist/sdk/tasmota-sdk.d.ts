import { EventEmitter } from 'events';
import { DeviceConfig, SDKOptions, PowerState, PowerCommand } from '../types';
import { TasmotaError } from '../errors';
import { TasmotaDevice, DeviceOperationOptions } from '../device/tasmota-device';
import { DiscoveryOptions, DiscoveryResult } from '../discovery/device-discovery';
/**
 * Device registry entry
 */
export interface DeviceEntry {
    id: string;
    device: TasmotaDevice;
    config: DeviceConfig;
    lastSeen: number;
    isOnline: boolean;
}
/**
 * SDK Events
 */
export interface SDKEvents {
    'device-added': (entry: DeviceEntry) => void;
    'device-removed': (id: string) => void;
    'device-online': (id: string) => void;
    'device-offline': (id: string) => void;
    'discovery-complete': (result: DiscoveryResult) => void;
    'error': (error: TasmotaError) => void;
}
/**
 * Bulk operation result
 */
export interface BulkOperationResult<T = unknown> {
    successful: Array<{
        deviceId: string;
        result: T;
    }>;
    failed: Array<{
        deviceId: string;
        error: TasmotaError;
    }>;
    totalDevices: number;
    successCount: number;
    failureCount: number;
}
/**
 * Main SDK class for managing multiple Tasmota devices
 */
export declare class TasmotaSDK extends EventEmitter {
    private readonly devices;
    private readonly discovery;
    private readonly options;
    private healthCheckInterval?;
    constructor(options?: SDKOptions);
    /**
     * Add a device to the SDK
     */
    addDevice(config: DeviceConfig, id?: string): string;
    /**
     * Remove a device from the SDK
     */
    removeDevice(deviceId: string): boolean;
    /**
     * Get a device by ID
     */
    getDevice(deviceId: string): TasmotaDevice | undefined;
    /**
     * Get all device IDs
     */
    getDeviceIds(): string[];
    /**
     * Get all devices
     */
    getDevices(): Map<string, TasmotaDevice>;
    /**
     * Get device entry with metadata
     */
    getDeviceEntry(deviceId: string): DeviceEntry | undefined;
    /**
     * Get all device entries
     */
    getDeviceEntries(): DeviceEntry[];
    /**
     * Check if a device exists
     */
    hasDevice(deviceId: string): boolean;
    /**
     * Get the number of registered devices
     */
    getDeviceCount(): number;
    /**
     * Get online devices
     */
    getOnlineDevices(): string[];
    /**
     * Get offline devices
     */
    getOfflineDevices(): string[];
    /**
     * Discover and add devices automatically
     */
    discoverAndAddDevices(options?: DiscoveryOptions): Promise<DiscoveryResult>;
    /**
     * Ping all devices to check their status
     */
    pingAllDevices(options?: DeviceOperationOptions): Promise<BulkOperationResult<boolean>>;
    /**
     * Turn on all devices
     */
    turnOnAll(relay?: number, options?: DeviceOperationOptions): Promise<BulkOperationResult<PowerState>>;
    /**
     * Turn off all devices
     */
    turnOffAll(relay?: number, options?: DeviceOperationOptions): Promise<BulkOperationResult<PowerState>>;
    /**
     * Toggle all devices
     */
    toggleAll(relay?: number, options?: DeviceOperationOptions): Promise<BulkOperationResult<PowerState>>;
    /**
     * Set power state for all devices
     */
    setPowerStateAll(state: PowerCommand, relay?: number, options?: DeviceOperationOptions): Promise<BulkOperationResult<PowerState>>;
    /**
     * Send a command to all devices
     */
    sendCommandToAll<T = unknown>(command: string, options?: DeviceOperationOptions): Promise<BulkOperationResult<T | undefined>>;
    /**
     * Send a command to specific devices
     */
    sendCommandToDevices<T = unknown>(deviceIds: string[], command: string, options?: DeviceOperationOptions): Promise<BulkOperationResult<T | undefined>>;
    /**
     * Start health check monitoring
     */
    startHealthCheck(intervalMs?: number): void;
    /**
     * Stop health check monitoring
     */
    stopHealthCheck(): void;
    /**
     * Clear all devices
     */
    clearDevices(): void;
    /**
     * Cleanup and destroy the SDK
     */
    destroy(): void;
    /**
     * Execute a bulk operation on devices
     */
    private executeBulkOperation;
    /**
     * Generate a device ID from host
     */
    private generateDeviceId;
    /**
     * Setup discovery event handlers
     */
    private setupDiscoveryEvents;
    /**
     * Typed event emitter methods
     */
    on<K extends keyof SDKEvents>(event: K, listener: SDKEvents[K]): this;
    emit<K extends keyof SDKEvents>(event: K, ...args: Parameters<SDKEvents[K]>): boolean;
    /**
     * Create SDK instance with default options
     */
    static create(options?: SDKOptions): TasmotaSDK;
}
//# sourceMappingURL=tasmota-sdk.d.ts.map