import { AxiosRequestConfig } from 'axios';
import { DeviceConfig } from '../types';
/**
 * HTTP Client for Tasmota device communication
 */
export declare class TasmotaHttpClient {
    private readonly client;
    private readonly config;
    constructor(config: DeviceConfig);
    /**
     * Get the base URL for the device
     */
    private getBaseUrl;
    /**
     * Send a command to the Tasmota device
     */
    sendCommand<T = unknown>(command: string, options?: AxiosRequestConfig): Promise<T>;
    /**
     * Send a JSON command to the Tasmota device
     */
    sendJsonCommand<T = unknown>(command: string, options?: AxiosRequestConfig): Promise<T>;
    /**
     * Get device status
     */
    getStatus<T = unknown>(statusType?: number): Promise<T>;
    /**
     * Check if the device is reachable
     */
    ping(): Promise<boolean>;
    /**
     * Get device information for discovery
     */
    getDeviceInfo(): Promise<Record<string, unknown>>;
    /**
     * Handle axios errors and convert to TasmotaError
     */
    private handleAxiosError;
    /**
     * Get the device configuration
     */
    getConfig(): Required<Pick<DeviceConfig, 'host' | 'port' | 'timeout'>> & Pick<DeviceConfig, 'username' | 'password'>;
    /**
     * Update the timeout for requests
     */
    setTimeout(timeout: number): void;
    /**
     * Close the HTTP client and cleanup resources
     */
    destroy(): void;
}
declare module 'axios' {
    interface AxiosRequestConfig {
        metadata?: {
            startTime: number;
        };
    }
}
//# sourceMappingURL=http-client.d.ts.map