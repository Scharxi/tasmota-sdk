"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasmotaHttpClient = void 0;
const axios_1 = __importDefault(require("axios"));
const errors_1 = require("../errors");
/**
 * HTTP Client for Tasmota device communication
 */
class TasmotaHttpClient {
    constructor(config) {
        // Validate and set defaults for config
        this.config = {
            host: config.host,
            port: config.port ?? 80,
            timeout: config.timeout ?? 5000,
            username: config.username ?? undefined,
            password: config.password ?? undefined,
        };
        // Create axios instance with base configuration
        this.client = axios_1.default.create({
            timeout: this.config.timeout,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'tasmota-sdk',
            },
        });
        // Set up authentication if provided
        if (this.config.username && this.config.password) {
            this.client.defaults.auth = {
                username: this.config.username,
                password: this.config.password,
            };
        }
        // Add request interceptor for logging (in development)
        this.client.interceptors.request.use((config) => {
            // Add timestamp for request tracking
            config.metadata = { startTime: Date.now() };
            return config;
        }, (error) => Promise.reject(error));
        // Add response interceptor for error handling
        this.client.interceptors.response.use((response) => {
            // Log response time in development
            const duration = Date.now() - (response.config.metadata?.startTime || 0);
            if (process.env.NODE_ENV === 'development') {
                console.debug(`Tasmota request completed in ${duration}ms`);
            }
            return response;
        }, (error) => {
            return Promise.reject(this.handleAxiosError(error));
        });
    }
    /**
     * Get the base URL for the device
     */
    getBaseUrl() {
        const protocol = 'http'; // Tasmota typically uses HTTP
        const host = this.config.host.startsWith('http')
            ? this.config.host
            : `${protocol}://${this.config.host}`;
        // Only add port if it's not the default HTTP port and not already in the URL
        if (this.config.port !== 80 && !host.includes(':')) {
            return `${host}:${this.config.port}`;
        }
        return host;
    }
    /**
     * Send a command to the Tasmota device
     */
    async sendCommand(command, options) {
        const url = `${this.getBaseUrl()}/cm`;
        const params = { cmnd: command };
        try {
            const response = await this.client.get(url, {
                params,
                ...options,
            });
            return response.data;
        }
        catch (error) {
            throw this.handleAxiosError(error, command);
        }
    }
    /**
     * Send a JSON command to the Tasmota device
     */
    async sendJsonCommand(command, options) {
        const url = `${this.getBaseUrl()}/jc`;
        const params = { cmnd: command };
        try {
            const response = await this.client.get(url, {
                params,
                ...options,
            });
            return response.data;
        }
        catch (error) {
            throw this.handleAxiosError(error, command);
        }
    }
    /**
     * Get device status
     */
    async getStatus(statusType) {
        const command = statusType !== undefined ? `Status ${statusType}` : 'Status';
        return this.sendCommand(command);
    }
    /**
     * Check if the device is reachable
     */
    async ping() {
        try {
            await this.sendCommand('Status');
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Get device information for discovery
     */
    async getDeviceInfo() {
        try {
            const [status, statusNet, statusFwr] = await Promise.all([
                this.sendCommand('Status 0'),
                this.sendCommand('Status 5'),
                this.sendCommand('Status 2'),
            ]);
            return {
                status,
                network: statusNet,
                firmware: statusFwr,
            };
        }
        catch (error) {
            throw errors_1.TasmotaError.fromUnknown(error, this.config.host);
        }
    }
    /**
     * Handle axios errors and convert to TasmotaError
     */
    handleAxiosError(error, command) {
        const deviceHost = this.config.host;
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
            return errors_1.TasmotaError.timeoutError(deviceHost, command, this.config.timeout);
        }
        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            return errors_1.TasmotaError.deviceNotFound(deviceHost);
        }
        if (error.response) {
            const { status, statusText } = error.response;
            if (status === 401) {
                return errors_1.TasmotaError.authenticationError(deviceHost);
            }
            if (status >= 400 && status < 500) {
                return errors_1.TasmotaError.commandFailed(command || 'unknown', deviceHost, status, error);
            }
            return errors_1.TasmotaError.networkError(`HTTP ${status}: ${statusText}`, error, deviceHost, command);
        }
        if (error.request) {
            return errors_1.TasmotaError.networkError('No response received from device', error, deviceHost, command);
        }
        return errors_1.TasmotaError.networkError(error.message || 'Unknown network error', error, deviceHost, command);
    }
    /**
     * Get the device configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Update the timeout for requests
     */
    setTimeout(timeout) {
        this.client.defaults.timeout = timeout;
    }
    /**
     * Close the HTTP client and cleanup resources
     */
    destroy() {
        // Axios doesn't have a specific destroy method, but we can clear interceptors
        this.client.interceptors.request.clear();
        this.client.interceptors.response.clear();
    }
}
exports.TasmotaHttpClient = TasmotaHttpClient;
//# sourceMappingURL=http-client.js.map