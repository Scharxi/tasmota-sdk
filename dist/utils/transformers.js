"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformToDeviceInfo = transformToDeviceInfo;
exports.transformToPowerStatus = transformToPowerStatus;
exports.transformToEnergyData = transformToEnergyData;
exports.transformToDiscoveryDevice = transformToDiscoveryDevice;
exports.normalizeIpAddress = normalizeIpAddress;
exports.isValidIpAddress = isValidIpAddress;
exports.generateIpRange = generateIpRange;
exports.parseCommandResponse = parseCommandResponse;
exports.retryOperation = retryOperation;
exports.debounce = debounce;
exports.throttle = throttle;
const zod_1 = require("zod");
const types_1 = require("../types");
const errors_1 = require("../errors");
/**
 * Transform raw status response to device info
 */
function transformToDeviceInfo(statusData) {
    try {
        // Parse the status response
        const parsed = types_1.StatusResponse.parse(statusData);
        return {
            hostname: parsed.StatusNET.Hostname,
            ipAddress: parsed.StatusNET.IPAddress,
            macAddress: parsed.StatusNET.Mac,
            friendlyName: parsed.Status.FriendlyName,
            version: parsed.StatusFWR.Version,
            buildDateTime: parsed.StatusFWR.BuildDateTime,
            hardware: parsed.StatusFWR.Hardware,
            uptime: parsed.StatusSTS.Uptime,
            uptimeSeconds: parsed.StatusSTS.UptimeSec,
        };
    }
    catch (error) {
        throw errors_1.TasmotaError.validationError('Failed to parse device info from status response', error);
    }
}
/**
 * Transform power response to power status
 */
function transformToPowerStatus(powerData) {
    try {
        // Handle different response formats
        let relays = {};
        let relayCount = 0;
        if (typeof powerData === 'object' && powerData !== null) {
            const data = powerData;
            // Check for single power state
            if (data.POWER && typeof data.POWER === 'string') {
                relays['1'] = types_1.PowerState.parse(data.POWER);
                relayCount = 1;
            }
            // Check for multiple power states (POWER1, POWER2, etc.)
            for (let i = 1; i <= 8; i++) {
                const powerKey = i === 1 ? 'POWER' : `POWER${i}`;
                if (data[powerKey] && typeof data[powerKey] === 'string') {
                    relays[i.toString()] = types_1.PowerState.parse(data[powerKey]);
                    relayCount = Math.max(relayCount, i);
                }
            }
        }
        if (relayCount === 0) {
            throw new Error('No power states found in response');
        }
        return {
            relayCount,
            relays,
        };
    }
    catch (error) {
        throw errors_1.TasmotaError.validationError('Failed to parse power status from response', error);
    }
}
/**
 * Transform energy data from status response
 */
function transformToEnergyData(statusData) {
    try {
        const parsed = types_1.StatusResponse.parse(statusData);
        if (!parsed.StatusSNS.ENERGY) {
            return null; // Device doesn't support energy monitoring
        }
        const energy = parsed.StatusSNS.ENERGY;
        return {
            totalStartTime: energy.TotalStartTime,
            total: energy.Total,
            yesterday: energy.Yesterday,
            today: energy.Today,
            power: energy.Power,
            apparentPower: energy.ApparentPower,
            reactivePower: energy.ReactivePower,
            factor: energy.Factor,
            voltage: energy.Voltage,
            current: energy.Current,
        };
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            // If parsing fails, the device might not support energy monitoring
            return null;
        }
        throw errors_1.TasmotaError.validationError('Failed to parse energy data from status response', error);
    }
}
/**
 * Transform discovery response to device info
 */
function transformToDiscoveryDevice(ipAddress, statusData) {
    try {
        const parsed = types_1.StatusResponse.parse(statusData);
        return {
            hostname: parsed.StatusNET.Hostname,
            ipAddress,
            macAddress: parsed.StatusNET.Mac,
            friendlyName: parsed.Status.FriendlyName[0] || parsed.StatusNET.Hostname,
            version: parsed.StatusFWR.Version,
            module: `Module ${parsed.Status.Module}`,
            fallbackTopic: parsed.Status.Topic,
            fullTopic: parsed.Status.Topic,
        };
    }
    catch (error) {
        throw errors_1.TasmotaError.validationError('Failed to parse discovery device info', error);
    }
}
/**
 * Normalize IP address (remove protocol, port, etc.)
 */
function normalizeIpAddress(input) {
    // Remove protocol
    let ip = input.replace(/^https?:\/\//, '');
    // Remove port
    ip = ip.split(':')[0];
    // Remove path
    ip = ip.split('/')[0];
    return ip;
}
/**
 * Validate IP address format
 */
function isValidIpAddress(ip) {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipv4Regex.test(ip);
}
/**
 * Generate IP address range for discovery
 */
function generateIpRange(baseIp, start = 1, end = 254) {
    const normalizedIp = normalizeIpAddress(baseIp);
    const parts = normalizedIp.split('.');
    if (parts.length !== 4) {
        throw new Error('Invalid IP address format');
    }
    const baseNetwork = parts.slice(0, 3).join('.');
    const ips = [];
    for (let i = start; i <= end; i++) {
        ips.push(`${baseNetwork}.${i}`);
    }
    return ips;
}
/**
 * Parse command response for success/failure
 */
function parseCommandResponse(response) {
    if (typeof response === 'object' && response !== null) {
        const data = response;
        // Check for error indicators
        if (data.WARNING || data.ERROR) {
            return {
                success: false,
                error: (data.WARNING || data.ERROR),
            };
        }
        // Check for command result
        if (data.Command && data.Command === 'Unknown') {
            return {
                success: false,
                error: 'Unknown command',
            };
        }
        return {
            success: true,
            data: response,
        };
    }
    return {
        success: true,
        data: response,
    };
}
/**
 * Retry utility for async operations
 */
async function retryOperation(operation, maxAttempts = 3, delay = 1000, backoffMultiplier = 2) {
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await operation();
        }
        catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            if (attempt === maxAttempts) {
                break;
            }
            // Wait before retrying
            const waitTime = delay * Math.pow(backoffMultiplier, attempt - 1);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }
    throw lastError;
}
/**
 * Debounce utility for frequent operations
 */
function debounce(func, wait) {
    let timeout = null;
    return ((...args) => {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            func(...args);
        }, wait);
    });
}
/**
 * Throttle utility for rate limiting
 */
function throttle(func, limit) {
    let inThrottle = false;
    return ((...args) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
    });
}
//# sourceMappingURL=transformers.js.map