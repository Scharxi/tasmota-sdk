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
- **Backlog Support**: Execute up to 30 commands in a single request
- **Error Handling**: Comprehensive error handling with custom error types
- **Energy Monitoring**: Support for devices with power monitoring capabilities
- **Health Monitoring**: Automatic device health checking and status tracking
- **Retry Logic**: Built-in retry mechanisms with exponential backoff
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
  // Create a device instance
  const device = createDevice('192.168.1.100');
  
  // Test connection
  const isOnline = await device.ping();
  console.log(`Device is ${isOnline ? 'online' : 'offline'}`);
  
  // Get device information
  const info = await device.getDeviceInfo();
  console.log(`Device: ${info.friendlyName[0]} (${info.version})`);
  console.log(`Uptime: ${info.uptime}`);
  
  // Control power
  await device.turnOn();       // Turn on relay 1
  await device.turnOff();      // Turn off relay 1
  await device.toggle();       // Toggle relay 1
  
  // Get current power state
  const powerState = await device.getPowerState();
  console.log(`Current state: ${powerState}`); // 'ON' or 'OFF'
  
  // Clean up
  device.destroy();
}
```

### Device with Authentication

Tasmota uses query parameter authentication (not HTTP Basic Auth):

```typescript
import { createDevice } from 'tasmota-sdk';

// If your device has web authentication enabled
const device = createDevice('192.168.1.100', {
  username: 'admin',
  password: 'your-password',
});

// Requests will be sent as:
// http://192.168.1.100/cm?user=admin&password=your-password&cmnd=Power
```

### Power Commands

The SDK supports all Tasmota power command formats:

```typescript
import { createDevice } from 'tasmota-sdk';

const device = createDevice('192.168.1.100');

// All these are equivalent for turning ON
await device.setPowerState('ON', 1);
await device.setPowerState('on', 1);
await device.setPowerState('1', 1);
await device.setPowerState('true', 1);

// All these are equivalent for turning OFF
await device.setPowerState('OFF', 1);
await device.setPowerState('off', 1);
await device.setPowerState('0', 1);
await device.setPowerState('false', 1);

// Toggle
await device.setPowerState('TOGGLE', 1);
await device.setPowerState('toggle', 1);
await device.setPowerState('2', 1);

// Blink commands
await device.blink(1);       // Start blinking relay 1
await device.blinkOff(1);    // Stop blinking relay 1

// Or using setPowerState
await device.setPowerState('3', 1);  // Start blink
await device.setPowerState('4', 1);  // Stop blink
```

### Backlog - Execute Multiple Commands

Execute up to 30 commands in a single request using Tasmota's Backlog feature:

```typescript
import { createDevice } from 'tasmota-sdk';

const device = createDevice('192.168.1.100');

// Configure WiFi and MQTT in one request
await device.backlog([
  'SSID1 MyNetwork',
  'Password1 MyPassword',
  'MqttHost broker.local',
  'MqttUser mqttuser',
  'MqttPassword mqttpass',
]);

// Create a power sequence with delays
await device.backlog([
  'Power1 ON',
  'Delay 20',      // 2 second delay (in 100ms units)
  'Power1 OFF',
  'Delay 10',
  'Power1 ON',
]);

// Clear any pending backlog commands
await device.clearBacklog();
```

### Multi-Relay Devices

```typescript
import { createDevice } from 'tasmota-sdk';

const device = createDevice('192.168.1.100');

// Get number of relays
const relayCount = await device.getRelayCount();
console.log(`Device has ${relayCount} relays`);

// Control specific relays
await device.turnOn(1);   // Turn on relay 1
await device.turnOn(2);   // Turn on relay 2
await device.turnOff(3);  // Turn off relay 3
await device.toggle(4);   // Toggle relay 4

// Control all relays at once
await device.turnOnAll();
await device.turnOffAll();

// Get status of all relays
const status = await device.getPowerStatus();
console.log(`Relay 1: ${status.relays['1']}`);
console.log(`Relay 2: ${status.relays['2']}`);
```

### Energy Monitoring

```typescript
import { createDevice } from 'tasmota-sdk';

const device = createDevice('192.168.1.100');

// Check if device supports energy monitoring
const supportsEnergy = await device.supportsEnergyMonitoring();

if (supportsEnergy) {
  const energy = await device.getEnergyData();
  
  if (energy) {
    console.log(`Current Power: ${energy.power}W`);
    console.log(`Voltage: ${energy.voltage}V`);
    console.log(`Current: ${energy.current}A`);
    console.log(`Power Factor: ${energy.factor}`);
    console.log(`Today: ${energy.today}kWh`);
    console.log(`Yesterday: ${energy.yesterday}kWh`);
    console.log(`Total: ${energy.total}kWh`);
  }
}
```

### Device Discovery

```typescript
import { discoverDevices, createSDK } from 'tasmota-sdk';

// Quick discovery on a network range
const result = await discoverDevices({
  network: '192.168.1.0',
  startIp: 1,
  endIp: 254,
  timeout: 3000,
  concurrency: 50,
});

console.log(`Found ${result.totalFound} Tasmota devices in ${result.duration}ms`);

// List discovered devices
for (const device of result.devices) {
  console.log(`- ${device.friendlyName} (${device.ipAddress})`);
  console.log(`  Version: ${device.version}`);
  console.log(`  MAC: ${device.macAddress}`);
}

// Auto-discover and add to SDK
const sdk = createSDK();
await sdk.discoverAndAddDevices({
  network: '192.168.1.0',
  timeout: 3000,
});

console.log(`Managing ${sdk.getDeviceCount()} devices`);
```

### Multi-Device Management with SDK

```typescript
import { createSDK } from 'tasmota-sdk';

const sdk = createSDK({
  defaultTimeout: 5000,
  retryAttempts: 3,
  retryDelay: 1000,
});

// Add devices manually
sdk.addDevice({ host: '192.168.1.100' });
sdk.addDevice({ host: '192.168.1.101' });
sdk.addDevice({ host: '192.168.1.102' }, 'living-room');

// Setup event handlers
sdk.on('device-online', (deviceId) => {
  console.log(`Device ${deviceId} came online`);
});

sdk.on('device-offline', (deviceId) => {
  console.log(`Device ${deviceId} went offline`);
});

// Start health monitoring (checks every 30 seconds)
sdk.startHealthCheck(30000);

// Bulk operations
const pingResults = await sdk.pingAllDevices();
console.log(`${pingResults.successCount}/${pingResults.totalDevices} devices online`);

// Turn on all devices
await sdk.turnOnAll();

// Turn off all devices
await sdk.turnOffAll();

// Toggle all devices
await sdk.toggleAll();

// Blink all devices
await sdk.blinkAll();

// Send command to all devices
await sdk.sendCommandToAll('Status 0');

// Send command to specific devices
await sdk.sendCommandToDevices(['living-room', '192.168.1.100'], 'Power TOGGLE');

// Get online/offline devices
const online = sdk.getOnlineDevices();
const offline = sdk.getOfflineDevices();

// Cleanup
sdk.stopHealthCheck();
sdk.destroy();
```

### Custom Commands

Send any Tasmota command directly:

```typescript
import { createDevice } from 'tasmota-sdk';

const device = createDevice('192.168.1.100');

// Get full device status
const status = await device.sendCommand('Status 0');
console.log(status.data);

// Set device name
await device.sendCommand('DeviceName Living Room Light');

// Configure power-on behavior
await device.sendCommand('PowerOnState 1'); // Always ON when powered

// Set timezone
await device.sendCommand('Timezone +01:00');

// Configure MQTT
await device.sendCommand('MqttHost broker.local');

// Restart device
await device.restart();
```

### Error Handling

```typescript
import { createDevice, TasmotaError } from 'tasmota-sdk';

const device = createDevice('192.168.1.100');

try {
  await device.turnOn();
} catch (error) {
  if (TasmotaError.isTasmotaError(error)) {
    console.error('Error Type:', error.type);
    console.error('Message:', error.message);
    console.error('User-Friendly:', error.getUserFriendlyMessage());
    console.error('Device:', error.deviceHost);
    console.error('Command:', error.command);
    
    // Handle specific error types
    switch (error.type) {
      case 'TIMEOUT_ERROR':
        console.log('Device is not responding');
        break;
      case 'DEVICE_NOT_FOUND':
        console.log('Device is unreachable');
        break;
      case 'AUTHENTICATION_ERROR':
        console.log('Invalid credentials');
        break;
      case 'COMMAND_FAILED':
        console.log('Command was rejected');
        break;
    }
  }
}
```

## 📚 API Reference

### TasmotaDevice

Main class for controlling individual Tasmota devices.

```typescript
class TasmotaDevice {
  // Connection
  ping(options?: DeviceOperationOptions): Promise<boolean>
  
  // Device Information
  getDeviceInfo(options?: { forceRefresh?: boolean }): Promise<DeviceInfo>
  getUptime(options?: DeviceOperationOptions): Promise<number>
  getRelayCount(options?: DeviceOperationOptions): Promise<number>
  
  // Power Control
  getPowerState(relay?: number): Promise<PowerState>
  getPowerStatus(): Promise<PowerStatus>
  setPowerState(state: PowerCommand, relay?: number): Promise<PowerState>
  turnOn(relay?: number): Promise<PowerState>
  turnOff(relay?: number): Promise<PowerState>
  toggle(relay?: number): Promise<PowerState>
  blink(relay?: number): Promise<PowerState>
  blinkOff(relay?: number): Promise<PowerState>
  turnOnAll(): Promise<PowerStatus>
  turnOffAll(): Promise<PowerStatus>
  
  // Energy Monitoring
  getEnergyData(): Promise<EnergyData | null>
  supportsEnergyMonitoring(): Promise<boolean>
  
  // Commands
  sendCommand<T>(command: string): Promise<CommandResponse<T>>
  backlog(commands: string[]): Promise<CommandResponse>
  clearBacklog(): Promise<CommandResponse>
  restart(): Promise<CommandResponse>
  
  // Utility
  getConfig(): DeviceConfig
  getHost(): string
  setTimeout(timeout: number): void
  clearCache(): void
  destroy(): void
  
  // Static Factory Methods
  static fromIp(ip: string, options?: Partial<DeviceConfig>): TasmotaDevice
  static fromHostname(hostname: string, options?: Partial<DeviceConfig>): TasmotaDevice
}
```

### TasmotaSDK

SDK for managing multiple devices.

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
  discoverAndAddDevices(options?: DiscoveryOptions): Promise<DiscoveryResult>
  
  // Bulk Operations
  pingAllDevices(): Promise<BulkOperationResult<boolean>>
  turnOnAll(relay?: number): Promise<BulkOperationResult<PowerState>>
  turnOffAll(relay?: number): Promise<BulkOperationResult<PowerState>>
  toggleAll(relay?: number): Promise<BulkOperationResult<PowerState>>
  blinkAll(relay?: number): Promise<BulkOperationResult<PowerState>>
  blinkOffAll(relay?: number): Promise<BulkOperationResult<PowerState>>
  setPowerStateAll(state: PowerCommand, relay?: number): Promise<BulkOperationResult<PowerState>>
  sendCommandToAll<T>(command: string): Promise<BulkOperationResult<T>>
  sendCommandToDevices<T>(deviceIds: string[], command: string): Promise<BulkOperationResult<T>>
  
  // Health Monitoring
  startHealthCheck(intervalMs?: number): void
  stopHealthCheck(): void
  
  // Events: 'device-added', 'device-removed', 'device-online', 'device-offline', 'discovery-complete', 'error'
}
```

### TasmotaDeviceDiscovery

Network scanning and device discovery.

```typescript
class TasmotaDeviceDiscovery extends EventEmitter {
  discover(options?: DiscoveryOptions): Promise<DiscoveryResult>
  discoverByNetwork(network: string): Promise<DiscoveryResult>
  discoverByIps(ipAddresses: string[]): Promise<DiscoveryResult>
  scanDevice(ip: string, timeout?: number): Promise<DiscoveryDevice | null>
  isTasmotaDevice(ip: string, timeout?: number): Promise<boolean>
  stopScan(): void
  isScanInProgress(): boolean
  
  // Events: 'device-found', 'scan-progress', 'scan-complete', 'error'
}
```

### Types

```typescript
// Power States
type PowerState = 'ON' | 'OFF';

// Power Commands (all formats accepted by Tasmota)
type PowerCommand = 
  | 'ON' | 'OFF' | 'TOGGLE'           // Uppercase
  | 'on' | 'off' | 'toggle'           // Lowercase
  | '0' | '1' | '2'                   // Numeric
  | 'true' | 'false'                  // Boolean
  | '3' | '4' | 'BLINK' | 'BLINKOFF'; // Blink

// Device Configuration
interface DeviceConfig {
  host: string;           // IP address or hostname
  port?: number;          // Default: 80
  timeout?: number;       // Default: 5000ms
  username?: string;      // For web authentication
  password?: string;      // For web authentication
}

// SDK Options
interface SDKOptions {
  defaultTimeout?: number;      // Default: 5000ms
  retryAttempts?: number;       // Default: 3
  retryDelay?: number;          // Default: 1000ms
  discoveryTimeout?: number;    // Default: 10000ms
  validateResponses?: boolean;  // Default: true
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

// Energy Data
interface EnergyData {
  totalStartTime: string;
  total: number;        // kWh
  yesterday: number;    // kWh
  today: number;        // kWh
  power: number;        // W
  apparentPower: number;
  reactivePower: number;
  factor: number;
  voltage: number;      // V
  current: number;      // A
}

// Discovery Options
interface DiscoveryOptions {
  network?: string;           // e.g., '192.168.1.0'
  startIp?: number;           // Default: 1
  endIp?: number;             // Default: 254
  ipAddresses?: string[];     // Specific IPs to scan
  timeout?: number;           // Per-device timeout
  concurrency?: number;       // Max concurrent scans (default: 50)
}

// Error Types
type TasmotaErrorType = 
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'DEVICE_NOT_FOUND'
  | 'INVALID_RESPONSE'
  | 'COMMAND_FAILED'
  | 'VALIDATION_ERROR';
```

## 🔧 Configuration

### Operation Options

All device operations accept optional configuration:

```typescript
interface DeviceOperationOptions {
  timeout?: number;     // Request timeout in ms
  retries?: number;     // Number of retry attempts
  retryDelay?: number;  // Delay between retries in ms
}

// Example usage
await device.turnOn(1, {
  timeout: 10000,
  retries: 5,
  retryDelay: 2000,
});
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🏗️ Building

```bash
# Build the project
npm run build

# Clean build
npm run build:clean

# Lint code
npm run lint

# Format code
npm run format
```

## 📖 Tasmota Commands Reference

This SDK implements the [Tasmota Commands API](https://tasmota.github.io/docs/Commands/). Common commands include:

| Command | Description |
|---------|-------------|
| `Power` | Get/set power state for relay 1 |
| `Power<n>` | Get/set power state for relay n |
| `Power0` | Control all relays (0=off, 1=on) |
| `Status` | Get device status |
| `Status 0` | Get full device status |
| `Status 8` | Get energy sensor data |
| `Backlog` | Execute multiple commands |
| `Restart 1` | Restart device |
| `DeviceName` | Set device name |
| `FriendlyName` | Set friendly name |

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- [Tasmota](https://tasmota.github.io/docs/) - The amazing open-source firmware
- [TypeScript](https://www.typescriptlang.org/) - For excellent type safety
- [Zod](https://zod.dev/) - For runtime type validation
- [Axios](https://axios-http.com/) - For HTTP client functionality

---

**Made with ❤️ for the Tasmota community**
