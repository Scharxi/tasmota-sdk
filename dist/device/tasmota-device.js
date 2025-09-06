"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasmotaDevice = void 0;
const types_1 = require("../types");
const errors_1 = require("../errors");
const http_client_1 = require("../utils/http-client");
const transformers_1 = require("../utils/transformers");
/**
 * Main class for controlling a Tasmota device
 */
class TasmotaDevice {
    constructor(config) {
        this.lastInfoUpdate = 0;
        this.INFO_CACHE_DURATION = 30000; // 30 seconds
        try {
            // Validate configuration using Zod
            this.config = types_1.DeviceConfig.parse(config);
            this.httpClient = new http_client_1.TasmotaHttpClient(this.config);
        }
        catch (error) {
            throw errors_1.TasmotaError.validationError('Invalid device configuration', error);
        }
    }
    /**
     * Test connection to the device
     */
    async ping(options) {
        try {
            await this.executeWithRetry(() => this.httpClient.ping(), options);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Get device information
     */
    async getDeviceInfo(options) {
        const now = Date.now();
        const forceRefresh = options?.forceRefresh ?? false;
        // Return cached info if available and not expired
        if (!forceRefresh &&
            this.cachedDeviceInfo &&
            now - this.lastInfoUpdate < this.INFO_CACHE_DURATION) {
            return this.cachedDeviceInfo;
        }
        try {
            const statusData = await this.executeWithRetry(() => this.httpClient.getStatus(0), options);
            const deviceInfo = (0, transformers_1.transformToDeviceInfo)(statusData);
            // Cache the result
            this.cachedDeviceInfo = deviceInfo;
            this.lastInfoUpdate = now;
            return deviceInfo;
        }
        catch (error) {
            throw errors_1.TasmotaError.fromUnknown(error, this.config.host, 'Status 0');
        }
    }
    /**
     * Get current power status for all relays
     */
    async getPowerStatus(options) {
        try {
            const response = await this.executeWithRetry(() => this.httpClient.sendCommand('Power'), options);
            return (0, transformers_1.transformToPowerStatus)(response);
        }
        catch (error) {
            throw errors_1.TasmotaError.fromUnknown(error, this.config.host, 'Power');
        }
    }
    /**
     * Get power state for a specific relay
     */
    async getPowerState(relay = 1, options) {
        try {
            const command = relay === 1 ? 'Power' : `Power${relay}`;
            const response = await this.executeWithRetry(() => this.httpClient.sendCommand(command), options);
            const powerStatus = (0, transformers_1.transformToPowerStatus)(response);
            const relayState = powerStatus.relays[relay.toString()];
            if (!relayState) {
                throw errors_1.TasmotaError.commandFailed(command, this.config.host, undefined, new Error(`Relay ${relay} not found`));
            }
            return relayState;
        }
        catch (error) {
            throw errors_1.TasmotaError.fromUnknown(error, this.config.host, `Power${relay === 1 ? '' : relay}`);
        }
    }
    /**
     * Set power state for a specific relay
     */
    async setPowerState(state, relay = 1, options) {
        try {
            const command = relay === 1
                ? `Power ${state}`
                : `Power${relay} ${state}`;
            const response = await this.executeWithRetry(() => this.httpClient.sendCommand(command), options);
            const powerStatus = (0, transformers_1.transformToPowerStatus)(response);
            const newState = powerStatus.relays[relay.toString()];
            if (!newState) {
                throw errors_1.TasmotaError.commandFailed(command, this.config.host, undefined, new Error(`Failed to set relay ${relay} state`));
            }
            return newState;
        }
        catch (error) {
            throw errors_1.TasmotaError.fromUnknown(error, this.config.host, `Power${relay === 1 ? '' : relay} ${state}`);
        }
    }
    /**
     * Turn on a specific relay
     */
    async turnOn(relay = 1, options) {
        return this.setPowerState('ON', relay, options);
    }
    /**
     * Turn off a specific relay
     */
    async turnOff(relay = 1, options) {
        return this.setPowerState('OFF', relay, options);
    }
    /**
     * Toggle a specific relay
     */
    async toggle(relay = 1, options) {
        return this.setPowerState('TOGGLE', relay, options);
    }
    /**
     * Turn on all relays
     */
    async turnOnAll(options) {
        try {
            const response = await this.executeWithRetry(() => this.httpClient.sendCommand('Power0 1'), options);
            return (0, transformers_1.transformToPowerStatus)(response);
        }
        catch (error) {
            throw errors_1.TasmotaError.fromUnknown(error, this.config.host, 'Power0 1');
        }
    }
    /**
     * Turn off all relays
     */
    async turnOffAll(options) {
        try {
            const response = await this.executeWithRetry(() => this.httpClient.sendCommand('Power0 0'), options);
            return (0, transformers_1.transformToPowerStatus)(response);
        }
        catch (error) {
            throw errors_1.TasmotaError.fromUnknown(error, this.config.host, 'Power0 0');
        }
    }
    /**
     * Get energy monitoring data (if supported)
     */
    async getEnergyData(options) {
        try {
            const statusData = await this.executeWithRetry(() => this.httpClient.getStatus(8), options);
            return (0, transformers_1.transformToEnergyData)(statusData);
        }
        catch (error) {
            if (errors_1.TasmotaError.isTasmotaError(error) && error.type === 'VALIDATION_ERROR') {
                // Device doesn't support energy monitoring
                return null;
            }
            throw errors_1.TasmotaError.fromUnknown(error, this.config.host, 'Status 8');
        }
    }
    /**
     * Send a custom command to the device
     */
    async sendCommand(command, options) {
        try {
            const response = await this.executeWithRetry(() => this.httpClient.sendCommand(command), options);
            const parsed = (0, transformers_1.parseCommandResponse)(response);
            if (!parsed.success && parsed.error) {
                throw errors_1.TasmotaError.commandFailed(command, this.config.host, undefined, new Error(parsed.error));
            }
            return {
                success: true,
                data: parsed.data,
            };
        }
        catch (error) {
            if (errors_1.TasmotaError.isTasmotaError(error)) {
                return {
                    success: false,
                    error: {
                        type: error.type,
                        message: error.message,
                        deviceHost: error.deviceHost,
                        command: error.command,
                        statusCode: error.statusCode,
                    },
                };
            }
            const tasmotaError = errors_1.TasmotaError.fromUnknown(error, this.config.host, command);
            return {
                success: false,
                error: {
                    type: tasmotaError.type,
                    message: tasmotaError.message,
                    deviceHost: tasmotaError.deviceHost,
                    command: tasmotaError.command,
                    statusCode: tasmotaError.statusCode,
                },
            };
        }
    }
    /**
     * Restart the device
     */
    async restart(options) {
        return this.sendCommand('Restart 1', options);
    }
    /**
     * Get device uptime in seconds
     */
    async getUptime(options) {
        const deviceInfo = await this.getDeviceInfo(options);
        return deviceInfo.uptimeSeconds;
    }
    /**
     * Check if device supports energy monitoring
     */
    async supportsEnergyMonitoring(options) {
        const energyData = await this.getEnergyData(options);
        return energyData !== null;
    }
    /**
     * Get the number of relays on the device
     */
    async getRelayCount(options) {
        const powerStatus = await this.getPowerStatus(options);
        return powerStatus.relayCount;
    }
    /**
     * Get device configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Get device host/IP
     */
    getHost() {
        return this.config.host;
    }
    /**
     * Update device timeout
     */
    setTimeout(timeout) {
        this.httpClient.setTimeout(timeout);
    }
    /**
     * Clear cached device information
     */
    clearCache() {
        this.cachedDeviceInfo = undefined;
        this.lastInfoUpdate = 0;
    }
    /**
     * Cleanup resources
     */
    destroy() {
        this.httpClient.destroy();
        this.clearCache();
    }
    /**
     * Execute operation with retry logic
     */
    async executeWithRetry(operation, options) {
        const maxRetries = options?.retries ?? 3;
        const retryDelay = options?.retryDelay ?? 1000;
        if (options?.timeout) {
            this.httpClient.setTimeout(options.timeout);
        }
        return (0, transformers_1.retryOperation)(operation, maxRetries, retryDelay);
    }
    /**
     * Create a device instance from IP address
     */
    static fromIp(ipAddress, options) {
        return new TasmotaDevice({
            host: ipAddress,
            port: 80,
            timeout: 5000,
            ...options,
        });
    }
    /**
     * Create a device instance from hostname
     */
    static fromHostname(hostname, options) {
        return new TasmotaDevice({
            host: hostname,
            port: 80,
            timeout: 5000,
            ...options,
        });
    }
}
exports.TasmotaDevice = TasmotaDevice;
//# sourceMappingURL=tasmota-device.js.map