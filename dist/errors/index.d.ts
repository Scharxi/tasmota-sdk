import { TasmotaErrorType, TasmotaErrorDetails } from '../types';
/**
 * Custom error class for Tasmota SDK operations
 */
export declare class TasmotaError extends Error {
    readonly type: TasmotaErrorType;
    readonly originalError?: unknown;
    readonly deviceHost?: string;
    readonly command?: string;
    readonly statusCode?: number;
    constructor(details: TasmotaErrorDetails);
    /**
     * Create a network error
     */
    static networkError(message: string, originalError?: unknown, deviceHost?: string, command?: string): TasmotaError;
    /**
     * Create a timeout error
     */
    static timeoutError(deviceHost: string, command?: string, timeout?: number): TasmotaError;
    /**
     * Create an authentication error
     */
    static authenticationError(deviceHost: string): TasmotaError;
    /**
     * Create a device not found error
     */
    static deviceNotFound(deviceHost: string): TasmotaError;
    /**
     * Create an invalid response error
     */
    static invalidResponse(message: string, deviceHost?: string, command?: string, originalError?: unknown): TasmotaError;
    /**
     * Create a command failed error
     */
    static commandFailed(command: string, deviceHost: string, statusCode?: number, originalError?: unknown): TasmotaError;
    /**
     * Create a validation error
     */
    static validationError(message: string, originalError?: unknown, deviceHost?: string): TasmotaError;
    /**
     * Check if an error is a TasmotaError
     */
    static isTasmotaError(error: unknown): error is TasmotaError;
    /**
     * Convert an unknown error to a TasmotaError
     */
    static fromUnknown(error: unknown, deviceHost?: string, command?: string): TasmotaError;
    /**
     * Get a user-friendly error message
     */
    getUserFriendlyMessage(): string;
    /**
     * Convert error to JSON
     */
    toJSON(): Record<string, unknown>;
}
//# sourceMappingURL=index.d.ts.map