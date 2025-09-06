import { DeviceConfig, DeviceInfo, PowerStatus, PowerCommand, PowerState, EnergyData, CommandResponse } from '../types';
/**
 * Options for device operations
 */
export interface DeviceOperationOptions {
    timeout?: number;
    retries?: number;
    retryDelay?: number;
}
/**
 * Main class for controlling a Tasmota device
 */
export declare class TasmotaDevice {
    private readonly httpClient;
    private readonly config;
    private cachedDeviceInfo?;
    private lastInfoUpdate;
    private readonly INFO_CACHE_DURATION;
    constructor(config: DeviceConfig);
    /**
     * Test connection to the device
     */
    ping(options?: DeviceOperationOptions): Promise<boolean>;
    /**
     * Get device information
     */
    getDeviceInfo(options?: DeviceOperationOptions & {
        forceRefresh?: boolean;
    }): Promise<DeviceInfo>;
    /**
     * Get current power status for all relays
     */
    getPowerStatus(options?: DeviceOperationOptions): Promise<PowerStatus>;
    /**
     * Get power state for a specific relay
     */
    getPowerState(relay?: number, options?: DeviceOperationOptions): Promise<PowerState>;
    /**
     * Set power state for a specific relay
     */
    setPowerState(state: PowerCommand, relay?: number, options?: DeviceOperationOptions): Promise<PowerState>;
    /**
     * Turn on a specific relay
     */
    turnOn(relay?: number, options?: DeviceOperationOptions): Promise<PowerState>;
    /**
     * Turn off a specific relay
     */
    turnOff(relay?: number, options?: DeviceOperationOptions): Promise<PowerState>;
    /**
     * Toggle a specific relay
     */
    toggle(relay?: number, options?: DeviceOperationOptions): Promise<PowerState>;
    /**
     * Turn on all relays
     */
    turnOnAll(options?: DeviceOperationOptions): Promise<PowerStatus>;
    /**
     * Turn off all relays
     */
    turnOffAll(options?: DeviceOperationOptions): Promise<PowerStatus>;
    /**
     * Get energy monitoring data (if supported)
     */
    getEnergyData(options?: DeviceOperationOptions): Promise<EnergyData | null>;
    /**
     * Send a custom command to the device
     */
    sendCommand<T = unknown>(command: string, options?: DeviceOperationOptions): Promise<CommandResponse<T>>;
    /**
     * Restart the device
     */
    restart(options?: DeviceOperationOptions): Promise<CommandResponse>;
    /**
     * Get device uptime in seconds
     */
    getUptime(options?: DeviceOperationOptions): Promise<number>;
    /**
     * Check if device supports energy monitoring
     */
    supportsEnergyMonitoring(options?: DeviceOperationOptions): Promise<boolean>;
    /**
     * Get the number of relays on the device
     */
    getRelayCount(options?: DeviceOperationOptions): Promise<number>;
    /**
     * Get device configuration
     */
    getConfig(): DeviceConfig;
    /**
     * Get device host/IP
     */
    getHost(): string;
    /**
     * Update device timeout
     */
    setTimeout(timeout: number): void;
    /**
     * Clear cached device information
     */
    clearCache(): void;
    /**
     * Cleanup resources
     */
    destroy(): void;
    /**
     * Execute operation with retry logic
     */
    private executeWithRetry;
    /**
     * Create a device instance from IP address
     */
    static fromIp(ipAddress: string, options?: Partial<DeviceConfig>): TasmotaDevice;
    /**
     * Create a device instance from hostname
     */
    static fromHostname(hostname: string, options?: Partial<DeviceConfig>): TasmotaDevice;
}
//# sourceMappingURL=tasmota-device.d.ts.map