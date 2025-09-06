import { EventEmitter } from 'events';
import { DiscoveryDevice, SDKOptions } from '../types';
import { TasmotaError } from '../errors';
/**
 * Discovery options
 */
export interface DiscoveryOptions {
    /** Network to scan (e.g., "192.168.1.0/24" or "192.168.1.1") */
    network?: string;
    /** IP range start (default: 1) */
    startIp?: number;
    /** IP range end (default: 254) */
    endIp?: number;
    /** Specific IP addresses to scan */
    ipAddresses?: string[];
    /** Timeout per device (default: 3000ms) */
    timeout?: number;
    /** Maximum concurrent scans (default: 50) */
    concurrency?: number;
    /** Include offline devices in results (default: false) */
    includeOffline?: boolean;
}
/**
 * Discovery result
 */
export interface DiscoveryResult {
    devices: DiscoveryDevice[];
    totalScanned: number;
    totalFound: number;
    duration: number;
    errors: Array<{
        ip: string;
        error: string;
    }>;
}
/**
 * Discovery events
 */
export interface DiscoveryEvents {
    'device-found': (device: DiscoveryDevice) => void;
    'scan-progress': (progress: {
        scanned: number;
        total: number;
        current: string;
    }) => void;
    'scan-complete': (result: DiscoveryResult) => void;
    'error': (error: TasmotaError) => void;
}
/**
 * Device discovery class for finding Tasmota devices on the network
 */
export declare class TasmotaDeviceDiscovery extends EventEmitter {
    private readonly options;
    private isScanning;
    private scanAbortController?;
    constructor(options?: SDKOptions);
    /**
     * Discover Tasmota devices on the network
     */
    discover(options?: DiscoveryOptions): Promise<DiscoveryResult>;
    /**
     * Discover devices by scanning a specific network range
     */
    discoverByNetwork(network: string, options?: Omit<DiscoveryOptions, 'network'>): Promise<DiscoveryResult>;
    /**
     * Discover devices by scanning specific IP addresses
     */
    discoverByIps(ipAddresses: string[], options?: Omit<DiscoveryOptions, 'ipAddresses'>): Promise<DiscoveryResult>;
    /**
     * Quick discovery on common networks
     */
    quickDiscover(options?: Omit<DiscoveryOptions, 'network'>): Promise<DiscoveryResult>;
    /**
     * Scan a single device to check if it's a Tasmota device
     */
    scanDevice(ip: string, timeout?: number): Promise<DiscoveryDevice | null>;
    /**
     * Check if a device is a Tasmota device
     */
    isTasmotaDevice(ip: string, timeout?: number): Promise<boolean>;
    /**
     * Stop the current discovery scan
     */
    stopScan(): void;
    /**
     * Check if a scan is currently in progress
     */
    isScanInProgress(): boolean;
    /**
     * Generate list of IP addresses to scan
     */
    private generateIpList;
    /**
     * Attempt to detect the current network
     */
    private detectCurrentNetwork;
    /**
     * Typed event emitter methods
     */
    on<K extends keyof DiscoveryEvents>(event: K, listener: DiscoveryEvents[K]): this;
    emit<K extends keyof DiscoveryEvents>(event: K, ...args: Parameters<DiscoveryEvents[K]>): boolean;
    /**
     * Create a discovery instance with default options
     */
    static create(options?: SDKOptions): TasmotaDeviceDiscovery;
    /**
     * Quick static method to discover devices
     */
    static discover(options?: DiscoveryOptions): Promise<DiscoveryResult>;
    /**
     * Quick static method to scan a single device
     */
    static scanDevice(ip: string, timeout?: number): Promise<DiscoveryDevice | null>;
    /**
     * Quick static method to check if device is Tasmota
     */
    static isTasmotaDevice(ip: string, timeout?: number): Promise<boolean>;
}
//# sourceMappingURL=device-discovery.d.ts.map