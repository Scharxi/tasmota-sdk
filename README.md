# Tasmota SDK for TypeScript

A robust, type-safe, and asynchronous TypeScript SDK for controlling Tasmota power sockets and IoT devices. This SDK provides comprehensive device management, discovery, and control capabilities with full TypeScript support.

[![npm version](https://badge.fury.io/js/tasmota-sdk.svg)](https://badge.fury.io/js/tasmota-sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Features

- **Type-Safe**: Full TypeScript support with comprehensive type definitions
- **Asynchronous**: Promise-based API with async/await support
- **Device Discovery**: Automatic network scanning and device discovery
- **Multi-Device Management**: Control multiple devices simultaneously
- **Error Handling**: Comprehensive error handling with custom error types
- **Energy Monitoring**: Support for devices with power monitoring capabilities
- **Health Monitoring**: Automatic device health checking and status tracking
- **Retry Logic**: Built-in retry mechanisms for network operations
- **Validation**: Input validation using Zod schemas
- **Event-Driven**: Event emitters for real-time device status updates

## 📦 Installation

```bash
npm install tasmota-sdk
```

Or with yarn:

```bash
yarn add tasmota-sdk
```

## 🏃‍♂️ Quick Start

### Basic Device Control

```typescript
import { createDevice, TasmotaError } from 'tasmota-sdk';

async function controlDevice() {
  try {
    // Create a device instance
    const device = createDevice('192.168.1.100');
    
    // Test connection
    const isOnline = await device.ping();
    console.log(`Device is ${isOnline ? 'online' : 'offline'}`);
    
    // Get device information
    const info = await device.getDeviceInfo();
    console.log(`Device: ${info.friendlyName[0]} (${info.version})`);
    
    // Control power
    await device.turnOn();
    console.log('Device turned on');
    
    // Get current power state
    const powerState = await device.getPowerState();
    console.log(`Current state: ${powerState}`);
    
    // Toggle power
    await device.toggle();
    console.log('Device toggled');
    
    // Clean up
    device.destroy();
    
  } catch (error) {
    if (TasmotaError.isTasmotaError(error)) {
      console.error('Tasmota Error:', error.getUserFriendlyMessage());
    } else {
      console.error('Unknown error:', error);
    }
  }
}
```

### Device Discovery

```typescript
import { discoverDevices, createSDK } from 'tasmota-sdk';

async function discoverAndManage() {
  // Quick discovery
  const result = await discoverDevices({
    network: '192.168.1.0',
    startIp: 1,
    endIp: 254,
    timeout: 3000,
  });
  
  console.log(`Found ${result.totalFound} Tasmota devices`);
  
  // List discovered devices
  result.devices.forEach(device => {
    console.log(`- ${device.friendlyName} at ${device.ipAddress}`);
  });
  
  // Create SDK and add discovered devices
  const sdk = createSDK();
  
  for (const device of result.devices) {
    sdk.addDevice({
      host: device.ipAddress,
      port: 80,
      timeout: 5000,
    });
  }
  
  // Control all devices
  await sdk.turnOnAll();
  console.log('All devices turned on');
  
  // Clean up
  sdk.destroy();
}
```

### Multi-Device Management

```typescript
import { createSDK, TasmotaSDK } from 'tasmota-sdk';

async function manageMultipleDevices() {
  const sdk = createSDK({
    defaultTimeout: 5000,
    retryAttempts: 3,
    retryDelay: 1000,
  });
  
  // Add devices
  const device1 = sdk.addDevice({ host: '192.168.1.100', port: 80, timeout: 5000 });
  const device2 = sdk.addDevice({ host: '192.168.1.101', port: 80, timeout: 5000 });
  
  // Setup event handlers
  sdk.on('device-online', (deviceId) => {
    console.log(`Device ${deviceId} came online`);
  });
  
  sdk.on('device-offline', (deviceId) => {
    console.log(`Device ${deviceId} went offline`);
  });
  
  // Start health monitoring
  sdk.startHealthCheck(30000); // Check every 30 seconds
  
  // Bulk operations
  const pingResults = await sdk.pingAllDevices();
  console.log(`Ping results: ${pingResults.successCount} successful, ${pingResults.failureCount} failed`);
  
  const toggleResults = await sdk.toggleAll();
  console.log(`Toggle results: ${toggleResults.successCount} successful, ${toggleResults.failureCount} failed`);
  
  // Send custom commands
  const statusResults = await sdk.sendCommandToAll('Status');
  console.log(`Status command results: ${statusResults.successCount} successful`);
  
  // Clean up
  sdk.stopHealthCheck();
  sdk.destroy();
}
```

## 📚 API Documentation

### Core Classes

#### `TasmotaDevice`

The main class for controlling individual Tasmota devices.

```typescript
class TasmotaDevice {
  // Connection
  async ping(options?: DeviceOperationOptions): Promise<boolean>
  
  // Device Information
  async getDeviceInfo(options?: DeviceOperationOptions & { forceRefresh?: boolean }): Promise<DeviceInfo>
  async getUptime(options?: DeviceOperationOptions): Promise<number>
  
  // Power Control
  async getPowerState(relay?: number, options?: DeviceOperationOptions): Promise<PowerState>
  async getPowerStatus(options?: DeviceOperationOptions): Promise<PowerStatus>
  async setPowerState(state: PowerCommand, relay?: number, options?: DeviceOperationOptions): Promise<PowerState>
  async turnOn(relay?: number, options?: DeviceOperationOptions): Promise<PowerState>
  async turnOff(relay?: number, options?: DeviceOperationOptions): Promise<PowerState>
  async toggle(relay?: number, options?: DeviceOperationOptions): Promise<PowerState>
  async turnOnAll(options?: DeviceOperationOptions): Promise<PowerStatus>
  async turnOffAll(options?: DeviceOperationOptions): Promise<PowerStatus>
  
  // Energy Monitoring
  async getEnergyData(options?: DeviceOperationOptions): Promise<EnergyData | null>
  async supportsEnergyMonitoring(options?: DeviceOperationOptions): Promise<boolean>
  
  // Advanced
  async sendCommand<T>(command: string, options?: DeviceOperationOptions): Promise<CommandResponse<T>>
  async restart(options?: DeviceOperationOptions): Promise<CommandResponse>
  async getRelayCount(options?: DeviceOperationOptions): Promise<number>
  
  // Utility
  getConfig(): DeviceConfig
  getHost(): string
  setTimeout(timeout: number): void
  clearCache(): void
  destroy(): void
  
  // Static Methods
  static fromIp(ipAddress: string, options?: Partial<DeviceConfig>): TasmotaDevice
  static fromHostname(hostname: string, options?: Partial<DeviceConfig>): TasmotaDevice
}
```

#### `TasmotaSDK`

SDK for managing multiple devices simultaneously.

```typescript
class TasmotaSDK extends EventEmitter {
  // Device Management
  addDevice(config: DeviceConfig, id?: string): string
  removeDevice(deviceId: string): boolean
  getDevice(deviceId: string): TasmotaDevice | undefined
  getDeviceIds(): string[]
  getDevices(): Map<string, TasmotaDevice>
  hasDevice(deviceId: string): boolean
  getDeviceCount(): number
  getOnlineDevices(): string[]
  getOfflineDevices(): string[]
  
  // Discovery
  async discoverAndAddDevices(options?: DiscoveryOptions): Promise<DiscoveryResult>
  
  // Bulk Operations
  async pingAllDevices(options?: DeviceOperationOptions): Promise<BulkOperationResult<boolean>>
  async turnOnAll(relay?: number, options?: DeviceOperationOptions): Promise<BulkOperationResult<PowerState>>
  async turnOffAll(relay?: number, options?: DeviceOperationOptions): Promise<BulkOperationResult<PowerState>>
  async toggleAll(relay?: number, options?: DeviceOperationOptions): Promise<BulkOperationResult<PowerState>>
  async setPowerStateAll(state: PowerCommand, relay?: number, options?: DeviceOperationOptions): Promise<BulkOperationResult<PowerState>>
  async sendCommandToAll<T>(command: string, options?: DeviceOperationOptions): Promise<BulkOperationResult<T | undefined>>
  async sendCommandToDevices<T>(deviceIds: string[], command: string, options?: DeviceOperationOptions): Promise<BulkOperationResult<T | undefined>>
  
  // Health Monitoring
  startHealthCheck(intervalMs?: number): void
  stopHealthCheck(): void
  
  // Utility
  clearDevices(): void
  destroy(): void
  
  // Static Methods
  static create(options?: SDKOptions): TasmotaSDK
}
```

#### `TasmotaDeviceDiscovery`

Device discovery and network scanning.

```typescript
class TasmotaDeviceDiscovery extends EventEmitter {
  async discover(options?: DiscoveryOptions): Promise<DiscoveryResult>
  async discoverByNetwork(network: string, options?: Omit<DiscoveryOptions, 'network'>): Promise<DiscoveryResult>
  async discoverByIps(ipAddresses: string[], options?: Omit<DiscoveryOptions, 'ipAddresses'>): Promise<DiscoveryResult>
  async quickDiscover(options?: Omit<DiscoveryOptions, 'network'>): Promise<DiscoveryResult>
  async scanDevice(ip: string, timeout?: number): Promise<DiscoveryDevice | null>
  async isTasmotaDevice(ip: string, timeout?: number): Promise<boolean>
  stopScan(): void
  isScanInProgress(): boolean
  
  // Static Methods
  static create(options?: SDKOptions): TasmotaDeviceDiscovery
  static async discover(options?: DiscoveryOptions): Promise<DiscoveryResult>
  static async scanDevice(ip: string, timeout?: number): Promise<DiscoveryDevice | null>
  static async isTasmotaDevice(ip: string, timeout?: number): Promise<boolean>
}
```

### Types

#### Core Types

```typescript
// Power Control
type PowerState = 'ON' | 'OFF';
type PowerCommand = 'ON' | 'OFF' | 'TOGGLE';

// Configuration
interface DeviceConfig {
  host: string;
  port?: number;
  timeout?: number;
  username?: string;
  password?: string;
}

interface SDKOptions {
  defaultTimeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  discoveryTimeout?: number;
  validateResponses?: boolean;
}

// Device Information
interface DeviceInfo {
  hostname: string;
  ipAddress: string;
  macAddress: string;
  friendlyName: string[];
  version: string;
  buildDateTime: string;
  hardware: string;
  uptime: string;
  uptimeSeconds: number;
}

// Power Status
interface PowerStatus {
  relayCount: number;
  relays: Record<string, PowerState>;
}

// Energy Monitoring
interface EnergyData {
  totalStartTime: string;
  total: number;
  yesterday: number;
  today: number;
  power: number;
  apparentPower: number;
  reactivePower: number;
  factor: number;
  voltage: number;
  current: number;
}

// Discovery
interface DiscoveryDevice {
  hostname: string;
  ipAddress: string;
  macAddress: string;
  friendlyName: string;
  version: string;
  module: string;
  fallbackTopic: string;
  fullTopic: string;
}

interface DiscoveryOptions {
  network?: string;
  startIp?: number;
  endIp?: number;
  ipAddresses?: string[];
  timeout?: number;
  concurrency?: number;
  includeOffline?: boolean;
}

interface DiscoveryResult {
  devices: DiscoveryDevice[];
  totalScanned: number;
  totalFound: number;
  duration: number;
  errors: Array<{ ip: string; error: string }>;
}

// Operations
interface DeviceOperationOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

interface CommandResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: TasmotaErrorDetails;
}

interface BulkOperationResult<T = unknown> {
  successful: Array<{ deviceId: string; result: T }>;
  failed: Array<{ deviceId: string; error: TasmotaError }>;
  totalDevices: number;
  successCount: number;
  failureCount: number;
}
```

#### Error Types

```typescript
type TasmotaErrorType = 
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'DEVICE_NOT_FOUND'
  | 'INVALID_RESPONSE'
  | 'COMMAND_FAILED'
  | 'VALIDATION_ERROR';

interface TasmotaErrorDetails {
  type: TasmotaErrorType;
  message: string;
  originalError?: unknown;
  deviceHost?: string;
  command?: string;
  statusCode?: number;
}

class TasmotaError extends Error {
  readonly type: TasmotaErrorType;
  readonly originalError?: unknown;
  readonly deviceHost?: string;
  readonly command?: string;
  readonly statusCode?: number;
  
  getUserFriendlyMessage(): string;
  toJSON(): Record<string, unknown>;
  
  // Static factory methods
  static networkError(message: string, originalError?: unknown, deviceHost?: string, command?: string): TasmotaError;
  static timeoutError(deviceHost: string, command?: string, timeout?: number): TasmotaError;
  static authenticationError(deviceHost: string): TasmotaError;
  static deviceNotFound(deviceHost: string): TasmotaError;
  static invalidResponse(message: string, deviceHost?: string, command?: string, originalError?: unknown): TasmotaError;
  static commandFailed(command: string, deviceHost: string, statusCode?: number, originalError?: unknown): TasmotaError;
  static validationError(message: string, originalError?: unknown, deviceHost?: string): TasmotaError;
  static fromUnknown(error: unknown, deviceHost?: string, command?: string): TasmotaError;
  static isTasmotaError(error: unknown): error is TasmotaError;
}
```

### Utility Functions

```typescript
// Device Creation
function createSDK(options?: SDKOptions): TasmotaSDK;
function createDevice(ipAddress: string, options?: Partial<DeviceConfig>): TasmotaDevice;
function createDiscovery(options?: SDKOptions): TasmotaDeviceDiscovery;

// Quick Operations
async function discoverDevices(options?: DiscoveryOptions): Promise<DiscoveryResult>;
async function scanDevice(ip: string, timeout?: number): Promise<DiscoveryDevice | null>;
async function isTasmotaDevice(ip: string, timeout?: number): Promise<boolean>;

// Utility Functions (Advanced)
function transformToDeviceInfo(statusData: unknown): DeviceInfo;
function transformToPowerStatus(powerData: unknown): PowerStatus;
function transformToEnergyData(statusData: unknown): EnergyData | null;
function normalizeIpAddress(input: string): string;
function isValidIpAddress(ip: string): boolean;
function generateIpRange(baseIp: string, start?: number, end?: number): string[];
async function retryOperation<T>(operation: () => Promise<T>, maxAttempts?: number, delay?: number, backoffMultiplier?: number): Promise<T>;
```

## 🔧 Configuration

### Device Configuration

```typescript
const deviceConfig: DeviceConfig = {
  host: '192.168.1.100',    // Required: Device IP address or hostname
  port: 80,                 // Optional: HTTP port (default: 80)
  timeout: 5000,            // Optional: Request timeout in ms (default: 5000)
  username: 'admin',        // Optional: HTTP authentication username
  password: 'password',     // Optional: HTTP authentication password
};
```

### SDK Options

```typescript
const sdkOptions: SDKOptions = {
  defaultTimeout: 5000,     // Default timeout for all operations (default: 5000ms)
  retryAttempts: 3,         // Number of retry attempts for failed operations (default: 3)
  retryDelay: 1000,         // Delay between retry attempts (default: 1000ms)
  discoveryTimeout: 10000,  // Timeout for discovery operations (default: 10000ms)
  validateResponses: true,  // Enable response validation using Zod (default: true)
};
```

### Discovery Options

```typescript
const discoveryOptions: DiscoveryOptions = {
  network: '192.168.1.0',   // Network to scan (CIDR notation supported)
  startIp: 1,               // Start IP range (default: 1)
  endIp: 254,               // End IP range (default: 254)
  ipAddresses: [],          // Specific IP addresses to scan (alternative to network range)
  timeout: 3000,            // Timeout per device scan (default: 3000ms)
  concurrency: 50,          // Maximum concurrent scans (default: 50)
  includeOffline: false,    // Include offline devices in results (default: false)
};
```

## 📝 Examples

### Energy Monitoring

```typescript
import { createDevice } from 'tasmota-sdk';

async function monitorEnergy() {
  const device = createDevice('192.168.1.100');
  
  // Check if device supports energy monitoring
  const supportsEnergy = await device.supportsEnergyMonitoring();
  
  if (supportsEnergy) {
    const energyData = await device.getEnergyData();
    
    if (energyData) {
      console.log(`Current Power: ${energyData.power}W`);
      console.log(`Today's Consumption: ${energyData.today}kWh`);
      console.log(`Total Consumption: ${energyData.total}kWh`);
      console.log(`Voltage: ${energyData.voltage}V`);
      console.log(`Current: ${energyData.current}A`);
    }
  } else {
    console.log('Device does not support energy monitoring');
  }
  
  device.destroy();
}
```

### Multi-Relay Control

```typescript
import { createDevice } from 'tasmota-sdk';

async function controlMultiRelay() {
  const device = createDevice('192.168.1.100');
  
  // Get number of relays
  const relayCount = await device.getRelayCount();
  console.log(`Device has ${relayCount} relays`);
  
  // Control each relay individually
  for (let relay = 1; relay <= relayCount; relay++) {
    console.log(`Controlling relay ${relay}`);
    
    // Turn on relay
    await device.turnOn(relay);
    console.log(`Relay ${relay} turned on`);
    
    // Wait 1 second
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Turn off relay
    await device.turnOff(relay);
    console.log(`Relay ${relay} turned off`);
  }
  
  // Control all relays at once
  await device.turnOnAll();
  console.log('All relays turned on');
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await device.turnOffAll();
  console.log('All relays turned off');
  
  device.destroy();
}
```

### Custom Commands

```typescript
import { createDevice, TasmotaError } from 'tasmota-sdk';

async function sendCustomCommands() {
  const device = createDevice('192.168.1.100');
  
  try {
    // Get device status
    const statusResult = await device.sendCommand('Status 0');
    if (statusResult.success) {
      console.log('Device Status:', statusResult.data);
    }
    
    // Set device name
    const setNameResult = await device.sendCommand('DeviceName MyTasmotaDevice');
    if (setNameResult.success) {
      console.log('Device name set successfully');
    }
    
    // Get WiFi information
    const wifiResult = await device.sendCommand('Status 5');
    if (wifiResult.success) {
      console.log('WiFi Info:', wifiResult.data);
    }
    
    // Set power on state (device behavior when powered on)
    const powerOnStateResult = await device.sendCommand('PowerOnState 1');
    if (powerOnStateResult.success) {
      console.log('Power on state set to ON');
    }
    
  } catch (error) {
    if (TasmotaError.isTasmotaError(error)) {
      console.error('Command failed:', error.getUserFriendlyMessage());
    } else {
      console.error('Unknown error:', error);
    }
  } finally {
    device.destroy();
  }
}
```

### Event Handling

```typescript
import { createSDK } from 'tasmota-sdk';

async function handleEvents() {
  const sdk = createSDK();
  
  // Device status events
  sdk.on('device-added', (entry) => {
    console.log(`Device added: ${entry.id} (${entry.config.host})`);
  });
  
  sdk.on('device-removed', (deviceId) => {
    console.log(`Device removed: ${deviceId}`);
  });
  
  sdk.on('device-online', (deviceId) => {
    console.log(`Device ${deviceId} came online`);
  });
  
  sdk.on('device-offline', (deviceId) => {
    console.log(`Device ${deviceId} went offline`);
  });
  
  // Discovery events
  sdk.on('discovery-complete', (result) => {
    console.log(`Discovery completed: found ${result.totalFound} devices`);
  });
  
  // Error events
  sdk.on('error', (error) => {
    console.error('SDK Error:', error.getUserFriendlyMessage());
  });
  
  // Add some devices and start health monitoring
  sdk.addDevice({ host: '192.168.1.100', port: 80, timeout: 5000 });
  sdk.addDevice({ host: '192.168.1.101', port: 80, timeout: 5000 });
  
  sdk.startHealthCheck(30000); // Check every 30 seconds
  
  // Let it run for a while
  await new Promise(resolve => setTimeout(resolve, 60000));
  
  // Clean up
  sdk.stopHealthCheck();
  sdk.destroy();
}
```

## 🛠️ Advanced Usage

For more advanced usage examples, including smart home automation, custom device classes, and complex discovery patterns, see the [Advanced Examples](src/examples/advanced-usage.ts) file.

## 🚨 Error Handling

The SDK provides comprehensive error handling with custom error types:

```typescript
import { TasmotaError } from 'tasmota-sdk';

try {
  // Your Tasmota operations here
} catch (error) {
  if (TasmotaError.isTasmotaError(error)) {
    // Handle Tasmota-specific errors
    console.error('Error Type:', error.type);
    console.error('Error Message:', error.message);
    console.error('User-Friendly Message:', error.getUserFriendlyMessage());
    console.error('Device Host:', error.deviceHost);
    console.error('Failed Command:', error.command);
    console.error('Status Code:', error.statusCode);
  } else {
    // Handle other errors
    console.error('Unknown error:', error);
  }
}
```

### Error Types

- `NETWORK_ERROR`: Network connectivity issues
- `TIMEOUT_ERROR`: Request timeout
- `AUTHENTICATION_ERROR`: HTTP authentication failure
- `DEVICE_NOT_FOUND`: Device not reachable or not found
- `INVALID_RESPONSE`: Invalid or unexpected response from device
- `COMMAND_FAILED`: Tasmota command execution failed
- `VALIDATION_ERROR`: Input validation failure

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🏗️ Building

```bash
# Build the project
npm run build

# Build in watch mode
npm run build:watch

# Lint the code
npm run lint

# Format the code
npm run format
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [documentation](README.md)
2. Look at the [examples](src/examples/)
3. Search existing [issues](../../issues)
4. Create a new [issue](../../issues/new) if needed

## 🙏 Acknowledgments

- [Tasmota](https://tasmota.github.io/docs/) - The amazing open-source firmware that makes this SDK possible
- [TypeScript](https://www.typescriptlang.org/) - For excellent type safety and developer experience
- [Zod](https://zod.dev/) - For runtime type validation
- [Axios](https://axios-http.com/) - For reliable HTTP client functionality

## 🔗 Related Projects

- [Tasmota](https://github.com/arendst/Tasmota) - The main Tasmota firmware project
- [Home Assistant](https://www.home-assistant.io/) - Popular home automation platform with Tasmota integration
- [Node-RED](https://nodered.org/) - Flow-based development tool that works great with Tasmota devices

---

**Made with ❤️ for the Tasmota community**
