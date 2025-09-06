import { z } from 'zod';
import {
  StatusResponse,
  DeviceInfo,
  PowerStatus,
  EnergyData,
  PowerState,
  DiscoveryDevice,
} from '../types';
import { TasmotaError } from '../errors';

/**
 * Transform raw status response to device info
 */
export function transformToDeviceInfo(statusData: unknown): DeviceInfo {
  try {
    // Parse the status response
    const parsed = StatusResponse.parse(statusData);
    
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
  } catch (error) {
    throw TasmotaError.validationError(
      'Failed to parse device info from status response',
      error
    );
  }
}

/**
 * Transform power response to power status
 */
export function transformToPowerStatus(powerData: unknown): PowerStatus {
  try {
    // Handle different response formats
    let relays: Record<string, PowerState> = {};
    let relayCount = 0;

    if (typeof powerData === 'object' && powerData !== null) {
      const data = powerData as Record<string, unknown>;
      
      // Check for single power state
      if (data.POWER && typeof data.POWER === 'string') {
        relays['1'] = PowerState.parse(data.POWER);
        relayCount = 1;
      }
      
      // Check for multiple power states (POWER1, POWER2, etc.)
      for (let i = 1; i <= 8; i++) {
        const powerKey = i === 1 ? 'POWER' : `POWER${i}`;
        if (data[powerKey] && typeof data[powerKey] === 'string') {
          relays[i.toString()] = PowerState.parse(data[powerKey]);
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
  } catch (error) {
    throw TasmotaError.validationError(
      'Failed to parse power status from response',
      error
    );
  }
}

/**
 * Transform energy data from status response
 */
export function transformToEnergyData(statusData: unknown): EnergyData | null {
  try {
    const parsed = StatusResponse.parse(statusData);
    
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
  } catch (error) {
    if (error instanceof z.ZodError) {
      // If parsing fails, the device might not support energy monitoring
      return null;
    }
    throw TasmotaError.validationError(
      'Failed to parse energy data from status response',
      error
    );
  }
}

/**
 * Transform discovery response to device info
 */
export function transformToDiscoveryDevice(
  ipAddress: string,
  statusData: unknown
): DiscoveryDevice {
  try {
    const parsed = StatusResponse.parse(statusData);
    
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
  } catch (error) {
    throw TasmotaError.validationError(
      'Failed to parse discovery device info',
      error
    );
  }
}

/**
 * Normalize IP address (remove protocol, port, etc.)
 */
export function normalizeIpAddress(input: string): string {
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
export function isValidIpAddress(ip: string): boolean {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipv4Regex.test(ip);
}

/**
 * Generate IP address range for discovery
 */
export function generateIpRange(baseIp: string, start = 1, end = 254): string[] {
  const normalizedIp = normalizeIpAddress(baseIp);
  const parts = normalizedIp.split('.');
  
  if (parts.length !== 4) {
    throw new Error('Invalid IP address format');
  }
  
  const baseNetwork = parts.slice(0, 3).join('.');
  const ips: string[] = [];
  
  for (let i = start; i <= end; i++) {
    ips.push(`${baseNetwork}.${i}`);
  }
  
  return ips;
}

/**
 * Parse command response for success/failure
 */
export function parseCommandResponse<T>(response: unknown): {
  success: boolean;
  data?: T;
  error?: string;
} {
  if (typeof response === 'object' && response !== null) {
    const data = response as Record<string, unknown>;
    
    // Check for error indicators
    if (data.WARNING || data.ERROR) {
      return {
        success: false,
        error: (data.WARNING || data.ERROR) as string,
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
      data: response as T,
    };
  }
  
  return {
    success: true,
    data: response as T,
  };
}

/**
 * Retry utility for async operations
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000,
  backoffMultiplier: number = 2
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxAttempts) {
        break;
      }
      
      // Wait before retrying
      const waitTime = delay * Math.pow(backoffMultiplier, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError!;
}

/**
 * Debounce utility for frequent operations
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): T {
  let timeout: NodeJS.Timeout | null = null;
  
  return ((...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  }) as T;
}

/**
 * Throttle utility for rate limiting
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): T {
  let inThrottle = false;
  
  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  }) as T;
}
