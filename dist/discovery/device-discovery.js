"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasmotaDeviceDiscovery = void 0;
const events_1 = require("events");
const errors_1 = require("../errors");
const http_client_1 = require("../utils/http-client");
const transformers_1 = require("../utils/transformers");
/**
 * Device discovery class for finding Tasmota devices on the network
 */
class TasmotaDeviceDiscovery extends events_1.EventEmitter {
    constructor(options) {
        super();
        this.isScanning = false;
        this.options = {
            defaultTimeout: options?.defaultTimeout ?? 5000,
            retryAttempts: options?.retryAttempts ?? 3,
            retryDelay: options?.retryDelay ?? 1000,
            discoveryTimeout: options?.discoveryTimeout ?? 10000,
            validateResponses: options?.validateResponses ?? true,
        };
    }
    /**
     * Discover Tasmota devices on the network
     */
    async discover(options = {}) {
        if (this.isScanning) {
            throw errors_1.TasmotaError.validationError('Discovery scan is already in progress');
        }
        this.isScanning = true;
        this.scanAbortController = new AbortController();
        const startTime = Date.now();
        const devices = [];
        const errors = [];
        try {
            const ipAddresses = this.generateIpList(options);
            const timeout = options.timeout ?? 3000;
            const concurrency = Math.min(options.concurrency ?? 50, 100);
            let scanned = 0;
            const total = ipAddresses.length;
            // Process IPs in batches to control concurrency
            for (let i = 0; i < ipAddresses.length; i += concurrency) {
                if (this.scanAbortController.signal.aborted) {
                    break;
                }
                const batch = ipAddresses.slice(i, i + concurrency);
                const promises = batch.map(async (ip) => {
                    try {
                        this.emit('scan-progress', { scanned, total, current: ip });
                        const device = await this.scanDevice(ip, timeout);
                        if (device) {
                            devices.push(device);
                            this.emit('device-found', device);
                        }
                    }
                    catch (error) {
                        const errorMessage = error instanceof Error ? error.message : String(error);
                        errors.push({ ip, error: errorMessage });
                    }
                    finally {
                        scanned++;
                    }
                });
                await Promise.all(promises);
            }
            const result = {
                devices,
                totalScanned: scanned,
                totalFound: devices.length,
                duration: Date.now() - startTime,
                errors,
            };
            this.emit('scan-complete', result);
            return result;
        }
        catch (error) {
            const tasmotaError = errors_1.TasmotaError.fromUnknown(error);
            this.emit('error', tasmotaError);
            throw tasmotaError;
        }
        finally {
            this.isScanning = false;
            this.scanAbortController = undefined;
        }
    }
    /**
     * Discover devices by scanning a specific network range
     */
    async discoverByNetwork(network, options = {}) {
        return this.discover({ ...options, network });
    }
    /**
     * Discover devices by scanning specific IP addresses
     */
    async discoverByIps(ipAddresses, options = {}) {
        return this.discover({ ...options, ipAddresses });
    }
    /**
     * Quick discovery on common networks
     */
    async quickDiscover(options = {}) {
        // Try to detect current network
        const currentNetwork = await this.detectCurrentNetwork();
        return this.discover({ ...options, network: currentNetwork });
    }
    /**
     * Scan a single device to check if it's a Tasmota device
     */
    async scanDevice(ip, timeout = 3000) {
        if (!(0, transformers_1.isValidIpAddress)(ip)) {
            throw errors_1.TasmotaError.validationError(`Invalid IP address: ${ip}`);
        }
        const config = {
            host: ip,
            port: 80,
            timeout,
        };
        const client = new http_client_1.TasmotaHttpClient(config);
        try {
            // Quick ping first
            const isReachable = await client.ping();
            if (!isReachable) {
                return null;
            }
            // Get device info
            const statusData = await client.getStatus(0);
            return (0, transformers_1.transformToDiscoveryDevice)(ip, statusData);
        }
        catch (error) {
            // Device is not a Tasmota device or not reachable
            if (errors_1.TasmotaError.isTasmotaError(error)) {
                if (error.type === 'DEVICE_NOT_FOUND' || error.type === 'TIMEOUT_ERROR') {
                    return null;
                }
            }
            throw error;
        }
        finally {
            client.destroy();
        }
    }
    /**
     * Check if a device is a Tasmota device
     */
    async isTasmotaDevice(ip, timeout = 3000) {
        try {
            const device = await this.scanDevice(ip, timeout);
            return device !== null;
        }
        catch {
            return false;
        }
    }
    /**
     * Stop the current discovery scan
     */
    stopScan() {
        if (this.isScanning && this.scanAbortController) {
            this.scanAbortController.abort();
        }
    }
    /**
     * Check if a scan is currently in progress
     */
    isScanInProgress() {
        return this.isScanning;
    }
    /**
     * Generate list of IP addresses to scan
     */
    generateIpList(options) {
        if (options.ipAddresses) {
            return options.ipAddresses.filter(transformers_1.isValidIpAddress);
        }
        let baseIp = options.network;
        if (!baseIp) {
            // Default to common home network ranges
            baseIp = '192.168.1.0';
        }
        // Handle CIDR notation
        if (baseIp.includes('/')) {
            baseIp = baseIp.split('/')[0];
        }
        const normalizedIp = (0, transformers_1.normalizeIpAddress)(baseIp);
        const startIp = options.startIp ?? 1;
        const endIp = options.endIp ?? 254;
        return (0, transformers_1.generateIpRange)(normalizedIp, startIp, endIp);
    }
    /**
     * Attempt to detect the current network
     */
    async detectCurrentNetwork() {
        // This is a simplified implementation
        // In a real scenario, you might use network interfaces or other methods
        return '192.168.1.0';
    }
    /**
     * Typed event emitter methods
     */
    on(event, listener) {
        return super.on(event, listener);
    }
    emit(event, ...args) {
        return super.emit(event, ...args);
    }
    /**
     * Create a discovery instance with default options
     */
    static create(options) {
        return new TasmotaDeviceDiscovery(options);
    }
    /**
     * Quick static method to discover devices
     */
    static async discover(options = {}) {
        const discovery = new TasmotaDeviceDiscovery();
        return discovery.discover(options);
    }
    /**
     * Quick static method to scan a single device
     */
    static async scanDevice(ip, timeout = 3000) {
        const discovery = new TasmotaDeviceDiscovery();
        return discovery.scanDevice(ip, timeout);
    }
    /**
     * Quick static method to check if device is Tasmota
     */
    static async isTasmotaDevice(ip, timeout = 3000) {
        const discovery = new TasmotaDeviceDiscovery();
        return discovery.isTasmotaDevice(ip, timeout);
    }
}
exports.TasmotaDeviceDiscovery = TasmotaDeviceDiscovery;
//# sourceMappingURL=device-discovery.js.map