"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasmotaSDK = void 0;
const events_1 = require("events");
const errors_1 = require("../errors");
const tasmota_device_1 = require("../device/tasmota-device");
const device_discovery_1 = require("../discovery/device-discovery");
/**
 * Main SDK class for managing multiple Tasmota devices
 */
class TasmotaSDK extends events_1.EventEmitter {
    constructor(options) {
        super();
        this.devices = new Map();
        this.options = {
            defaultTimeout: options?.defaultTimeout ?? 5000,
            retryAttempts: options?.retryAttempts ?? 3,
            retryDelay: options?.retryDelay ?? 1000,
            discoveryTimeout: options?.discoveryTimeout ?? 10000,
            validateResponses: options?.validateResponses ?? true,
        };
        this.discovery = new device_discovery_1.TasmotaDeviceDiscovery(this.options);
        this.setupDiscoveryEvents();
    }
    /**
     * Add a device to the SDK
     */
    addDevice(config, id) {
        try {
            const deviceId = id ?? this.generateDeviceId(config.host);
            if (this.devices.has(deviceId)) {
                throw errors_1.TasmotaError.validationError(`Device with ID '${deviceId}' already exists`);
            }
            const device = new tasmota_device_1.TasmotaDevice(config);
            const entry = {
                id: deviceId,
                device,
                config,
                lastSeen: Date.now(),
                isOnline: false,
            };
            this.devices.set(deviceId, entry);
            this.emit('device-added', entry);
            return deviceId;
        }
        catch (error) {
            throw errors_1.TasmotaError.fromUnknown(error);
        }
    }
    /**
     * Remove a device from the SDK
     */
    removeDevice(deviceId) {
        const entry = this.devices.get(deviceId);
        if (!entry) {
            return false;
        }
        entry.device.destroy();
        this.devices.delete(deviceId);
        this.emit('device-removed', deviceId);
        return true;
    }
    /**
     * Get a device by ID
     */
    getDevice(deviceId) {
        return this.devices.get(deviceId)?.device;
    }
    /**
     * Get all device IDs
     */
    getDeviceIds() {
        return Array.from(this.devices.keys());
    }
    /**
     * Get all devices
     */
    getDevices() {
        const result = new Map();
        for (const [id, entry] of this.devices) {
            result.set(id, entry.device);
        }
        return result;
    }
    /**
     * Get device entry with metadata
     */
    getDeviceEntry(deviceId) {
        return this.devices.get(deviceId);
    }
    /**
     * Get all device entries
     */
    getDeviceEntries() {
        return Array.from(this.devices.values());
    }
    /**
     * Check if a device exists
     */
    hasDevice(deviceId) {
        return this.devices.has(deviceId);
    }
    /**
     * Get the number of registered devices
     */
    getDeviceCount() {
        return this.devices.size;
    }
    /**
     * Get online devices
     */
    getOnlineDevices() {
        return Array.from(this.devices.entries())
            .filter(([, entry]) => entry.isOnline)
            .map(([id]) => id);
    }
    /**
     * Get offline devices
     */
    getOfflineDevices() {
        return Array.from(this.devices.entries())
            .filter(([, entry]) => !entry.isOnline)
            .map(([id]) => id);
    }
    /**
     * Discover and add devices automatically
     */
    async discoverAndAddDevices(options = {}) {
        try {
            const result = await this.discovery.discover(options);
            // Add discovered devices
            for (const discoveredDevice of result.devices) {
                const deviceId = this.generateDeviceId(discoveredDevice.ipAddress);
                if (!this.devices.has(deviceId)) {
                    this.addDevice({
                        host: discoveredDevice.ipAddress,
                        port: 80,
                        timeout: this.options.defaultTimeout,
                    }, deviceId);
                }
            }
            this.emit('discovery-complete', result);
            return result;
        }
        catch (error) {
            const tasmotaError = errors_1.TasmotaError.fromUnknown(error);
            this.emit('error', tasmotaError);
            throw tasmotaError;
        }
    }
    /**
     * Ping all devices to check their status
     */
    async pingAllDevices(options) {
        return this.executeBulkOperation(async (device) => device.ping(options), 'ping');
    }
    /**
     * Turn on all devices
     */
    async turnOnAll(relay = 1, options) {
        return this.executeBulkOperation(async (device) => device.turnOn(relay, options), `turnOn(${relay})`);
    }
    /**
     * Turn off all devices
     */
    async turnOffAll(relay = 1, options) {
        return this.executeBulkOperation(async (device) => device.turnOff(relay, options), `turnOff(${relay})`);
    }
    /**
     * Toggle all devices
     */
    async toggleAll(relay = 1, options) {
        return this.executeBulkOperation(async (device) => device.toggle(relay, options), `toggle(${relay})`);
    }
    /**
     * Set power state for all devices
     */
    async setPowerStateAll(state, relay = 1, options) {
        return this.executeBulkOperation(async (device) => device.setPowerState(state, relay, options), `setPowerState(${state}, ${relay})`);
    }
    /**
     * Send a command to all devices
     */
    async sendCommandToAll(command, options) {
        return this.executeBulkOperation(async (device) => {
            const result = await device.sendCommand(command, options);
            return result.data;
        }, `sendCommand(${command})`);
    }
    /**
     * Send a command to specific devices
     */
    async sendCommandToDevices(deviceIds, command, options) {
        return this.executeBulkOperation(async (device) => {
            const result = await device.sendCommand(command, options);
            return result.data;
        }, `sendCommand(${command})`, deviceIds);
    }
    /**
     * Start health check monitoring
     */
    startHealthCheck(intervalMs = 60000) {
        this.stopHealthCheck();
        this.healthCheckInterval = setInterval(async () => {
            for (const [deviceId, entry] of this.devices) {
                try {
                    const isOnline = await entry.device.ping({ timeout: 3000, retries: 1 });
                    const wasOnline = entry.isOnline;
                    entry.isOnline = isOnline;
                    entry.lastSeen = Date.now();
                    if (isOnline && !wasOnline) {
                        this.emit('device-online', deviceId);
                    }
                    else if (!isOnline && wasOnline) {
                        this.emit('device-offline', deviceId);
                    }
                }
                catch {
                    if (entry.isOnline) {
                        entry.isOnline = false;
                        this.emit('device-offline', deviceId);
                    }
                }
            }
        }, intervalMs);
    }
    /**
     * Stop health check monitoring
     */
    stopHealthCheck() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = undefined;
        }
    }
    /**
     * Clear all devices
     */
    clearDevices() {
        for (const entry of this.devices.values()) {
            entry.device.destroy();
        }
        this.devices.clear();
    }
    /**
     * Cleanup and destroy the SDK
     */
    destroy() {
        this.stopHealthCheck();
        this.clearDevices();
        this.removeAllListeners();
    }
    /**
     * Execute a bulk operation on devices
     */
    async executeBulkOperation(operation, operationName, deviceIds) {
        const targetDevices = deviceIds
            ? deviceIds.map(id => ({ id, entry: this.devices.get(id) })).filter(({ entry }) => entry)
            : Array.from(this.devices.entries()).map(([id, entry]) => ({ id, entry }));
        const successful = [];
        const failed = [];
        await Promise.allSettled(targetDevices.map(async ({ id, entry }) => {
            if (!entry)
                return;
            try {
                const result = await operation(entry.device);
                successful.push({ deviceId: id, result });
            }
            catch (error) {
                const tasmotaError = errors_1.TasmotaError.fromUnknown(error, entry.config.host, operationName);
                failed.push({ deviceId: id, error: tasmotaError });
            }
        }));
        return {
            successful,
            failed,
            totalDevices: targetDevices.length,
            successCount: successful.length,
            failureCount: failed.length,
        };
    }
    /**
     * Generate a device ID from host
     */
    generateDeviceId(host) {
        return host.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
    }
    /**
     * Setup discovery event handlers
     */
    setupDiscoveryEvents() {
        this.discovery.on('device-found', (device) => {
            // Optionally auto-add discovered devices
        });
        this.discovery.on('error', (error) => {
            this.emit('error', error);
        });
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
     * Create SDK instance with default options
     */
    static create(options) {
        return new TasmotaSDK(options);
    }
}
exports.TasmotaSDK = TasmotaSDK;
//# sourceMappingURL=tasmota-sdk.js.map