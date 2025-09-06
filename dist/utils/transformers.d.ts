import { DeviceInfo, PowerStatus, EnergyData, DiscoveryDevice } from '../types';
/**
 * Transform raw status response to device info
 */
export declare function transformToDeviceInfo(statusData: unknown): DeviceInfo;
/**
 * Transform power response to power status
 */
export declare function transformToPowerStatus(powerData: unknown): PowerStatus;
/**
 * Transform energy data from status response
 */
export declare function transformToEnergyData(statusData: unknown): EnergyData | null;
/**
 * Transform discovery response to device info
 */
export declare function transformToDiscoveryDevice(ipAddress: string, statusData: unknown): DiscoveryDevice;
/**
 * Normalize IP address (remove protocol, port, etc.)
 */
export declare function normalizeIpAddress(input: string): string;
/**
 * Validate IP address format
 */
export declare function isValidIpAddress(ip: string): boolean;
/**
 * Generate IP address range for discovery
 */
export declare function generateIpRange(baseIp: string, start?: number, end?: number): string[];
/**
 * Parse command response for success/failure
 */
export declare function parseCommandResponse<T>(response: unknown): {
    success: boolean;
    data?: T;
    error?: string;
};
/**
 * Retry utility for async operations
 */
export declare function retryOperation<T>(operation: () => Promise<T>, maxAttempts?: number, delay?: number, backoffMultiplier?: number): Promise<T>;
/**
 * Debounce utility for frequent operations
 */
export declare function debounce<T extends (...args: unknown[]) => unknown>(func: T, wait: number): T;
/**
 * Throttle utility for rate limiting
 */
export declare function throttle<T extends (...args: unknown[]) => unknown>(func: T, limit: number): T;
//# sourceMappingURL=transformers.d.ts.map