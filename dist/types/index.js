"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandResponse = exports.SDKOptions = exports.TasmotaErrorDetails = exports.TasmotaErrorType = exports.DiscoveryDevice = exports.EnergyData = exports.PowerStatus = exports.DeviceInfo = exports.StatusResponse = exports.StatusSNS = exports.StatusTIM = exports.StatusNET = exports.StatusMEM = exports.StatusLOG = exports.StatusFWR = exports.StatusSTS = exports.TasmotaResponse = exports.DeviceConfig = exports.PowerCommand = exports.PowerState = void 0;
const zod_1 = require("zod");
// Power States
exports.PowerState = zod_1.z.enum(['ON', 'OFF']);
exports.PowerCommand = zod_1.z.enum(['ON', 'OFF', 'TOGGLE']);
// Device Configuration
exports.DeviceConfig = zod_1.z.object({
    host: zod_1.z.string().ip().or(zod_1.z.string().url()),
    port: zod_1.z.number().min(1).max(65535).optional(),
    timeout: zod_1.z.number().min(1000).max(30000).optional(),
    username: zod_1.z.string().optional(),
    password: zod_1.z.string().optional(),
});
// Basic Tasmota Response Schema
exports.TasmotaResponse = zod_1.z.object({
    POWER: exports.PowerState.optional(),
    POWER1: exports.PowerState.optional(),
    POWER2: exports.PowerState.optional(),
    POWER3: exports.PowerState.optional(),
    POWER4: exports.PowerState.optional(),
});
// Status Response Schemas
exports.StatusSTS = zod_1.z.object({
    Time: zod_1.z.string(),
    Uptime: zod_1.z.string(),
    UptimeSec: zod_1.z.number(),
    Heap: zod_1.z.number(),
    SleepMode: zod_1.z.string(),
    Sleep: zod_1.z.number(),
    LoadAvg: zod_1.z.number(),
    MqttCount: zod_1.z.number(),
    POWER: exports.PowerState.optional(),
    POWER1: exports.PowerState.optional(),
    POWER2: exports.PowerState.optional(),
    POWER3: exports.PowerState.optional(),
    POWER4: exports.PowerState.optional(),
    Dimmer: zod_1.z.number().optional(),
    Color: zod_1.z.string().optional(),
    HSBColor: zod_1.z.string().optional(),
    White: zod_1.z.number().optional(),
    CT: zod_1.z.number().optional(),
    Channel: zod_1.z.array(zod_1.z.number()).optional(),
});
exports.StatusFWR = zod_1.z.object({
    Version: zod_1.z.string(),
    BuildDateTime: zod_1.z.string(),
    Boot: zod_1.z.number(),
    Core: zod_1.z.string(),
    SDK: zod_1.z.string(),
    CpuFrequency: zod_1.z.number(),
    Hardware: zod_1.z.string(),
    CR: zod_1.z.string(),
});
exports.StatusLOG = zod_1.z.object({
    SerialLog: zod_1.z.number(),
    WebLog: zod_1.z.number(),
    MqttLog: zod_1.z.number(),
    SysLog: zod_1.z.number(),
    LogHost: zod_1.z.string(),
    LogPort: zod_1.z.number(),
    SSId: zod_1.z.array(zod_1.z.string()),
    TelePeriod: zod_1.z.number(),
    Resolution: zod_1.z.string(),
    SetOption: zod_1.z.array(zod_1.z.string()),
});
exports.StatusMEM = zod_1.z.object({
    ProgramSize: zod_1.z.number(),
    Free: zod_1.z.number(),
    Heap: zod_1.z.number(),
    ProgramFlashSize: zod_1.z.number(),
    FlashSize: zod_1.z.number(),
    FlashChipId: zod_1.z.string(),
    FlashFrequency: zod_1.z.number(),
    FlashMode: zod_1.z.number(),
    Features: zod_1.z.array(zod_1.z.string()),
    Drivers: zod_1.z.string(),
    Sensors: zod_1.z.string(),
});
exports.StatusNET = zod_1.z.object({
    Hostname: zod_1.z.string(),
    IPAddress: zod_1.z.string(),
    Gateway: zod_1.z.string(),
    Subnetmask: zod_1.z.string(),
    DNSServer: zod_1.z.string(),
    Mac: zod_1.z.string(),
    Webserver: zod_1.z.number(),
    WifiConfig: zod_1.z.number(),
    WifiPower: zod_1.z.number(),
});
exports.StatusTIM = zod_1.z.object({
    UTC: zod_1.z.string(),
    Local: zod_1.z.string(),
    StartDST: zod_1.z.string(),
    EndDST: zod_1.z.string(),
    Timezone: zod_1.z.string(),
    Sunrise: zod_1.z.string(),
    Sunset: zod_1.z.string(),
});
exports.StatusSNS = zod_1.z.object({
    Time: zod_1.z.string(),
    ENERGY: zod_1.z.object({
        TotalStartTime: zod_1.z.string(),
        Total: zod_1.z.number(),
        Yesterday: zod_1.z.number(),
        Today: zod_1.z.number(),
        Power: zod_1.z.number(),
        ApparentPower: zod_1.z.number(),
        ReactivePower: zod_1.z.number(),
        Factor: zod_1.z.number(),
        Voltage: zod_1.z.number(),
        Current: zod_1.z.number(),
    }).optional(),
    Temperature: zod_1.z.number().optional(),
    Humidity: zod_1.z.number().optional(),
    Pressure: zod_1.z.number().optional(),
}).passthrough();
// Complete Status Response
exports.StatusResponse = zod_1.z.object({
    Status: zod_1.z.object({
        Module: zod_1.z.number(),
        DeviceName: zod_1.z.string(),
        FriendlyName: zod_1.z.array(zod_1.z.string()),
        Topic: zod_1.z.string(),
        ButtonTopic: zod_1.z.string(),
        Power: zod_1.z.number(),
        PowerOnState: zod_1.z.number(),
        LedState: zod_1.z.number(),
        LedMask: zod_1.z.string(),
        SaveData: zod_1.z.number(),
        SaveState: zod_1.z.number(),
        SwitchTopic: zod_1.z.string(),
        SwitchMode: zod_1.z.array(zod_1.z.number()),
        ButtonRetain: zod_1.z.number(),
        SwitchRetain: zod_1.z.number(),
        SensorRetain: zod_1.z.number(),
        PowerRetain: zod_1.z.number(),
    }),
    StatusPRM: zod_1.z.object({
        Baudrate: zod_1.z.number(),
        SerialConfig: zod_1.z.string(),
        GroupTopic: zod_1.z.string(),
        OtaUrl: zod_1.z.string(),
        RestartReason: zod_1.z.string(),
        Uptime: zod_1.z.string(),
        StartupUTC: zod_1.z.string(),
        Sleep: zod_1.z.number(),
        CfgHolder: zod_1.z.number(),
        BootCount: zod_1.z.number(),
        BCResetTime: zod_1.z.string(),
        SaveCount: zod_1.z.number(),
        SaveAddress: zod_1.z.string(),
    }),
    StatusFWR: exports.StatusFWR,
    StatusLOG: exports.StatusLOG,
    StatusMEM: exports.StatusMEM,
    StatusNET: exports.StatusNET,
    StatusMQT: zod_1.z.object({
        MqttHost: zod_1.z.string(),
        MqttPort: zod_1.z.number(),
        MqttClientMask: zod_1.z.string(),
        MqttClient: zod_1.z.string(),
        MqttUser: zod_1.z.string(),
        MqttCount: zod_1.z.number(),
        MAX_PACKET_SIZE: zod_1.z.number(),
        KEEPALIVE: zod_1.z.number(),
        SOCKET_TIMEOUT: zod_1.z.number(),
    }),
    StatusTIM: exports.StatusTIM,
    StatusSNS: exports.StatusSNS,
    StatusSTS: exports.StatusSTS,
});
// Device Information
exports.DeviceInfo = zod_1.z.object({
    hostname: zod_1.z.string(),
    ipAddress: zod_1.z.string(),
    macAddress: zod_1.z.string(),
    friendlyName: zod_1.z.array(zod_1.z.string()),
    version: zod_1.z.string(),
    buildDateTime: zod_1.z.string(),
    hardware: zod_1.z.string(),
    uptime: zod_1.z.string(),
    uptimeSeconds: zod_1.z.number(),
});
// Power Status
exports.PowerStatus = zod_1.z.object({
    relayCount: zod_1.z.number(),
    relays: zod_1.z.record(zod_1.z.string(), exports.PowerState),
});
// Energy Monitoring
exports.EnergyData = zod_1.z.object({
    totalStartTime: zod_1.z.string(),
    total: zod_1.z.number(),
    yesterday: zod_1.z.number(),
    today: zod_1.z.number(),
    power: zod_1.z.number(),
    apparentPower: zod_1.z.number(),
    reactivePower: zod_1.z.number(),
    factor: zod_1.z.number(),
    voltage: zod_1.z.number(),
    current: zod_1.z.number(),
});
// Discovery Response
exports.DiscoveryDevice = zod_1.z.object({
    hostname: zod_1.z.string(),
    ipAddress: zod_1.z.string(),
    macAddress: zod_1.z.string(),
    friendlyName: zod_1.z.string(),
    version: zod_1.z.string(),
    module: zod_1.z.string(),
    fallbackTopic: zod_1.z.string(),
    fullTopic: zod_1.z.string(),
});
// Error Types
exports.TasmotaErrorType = zod_1.z.enum([
    'NETWORK_ERROR',
    'TIMEOUT_ERROR',
    'AUTHENTICATION_ERROR',
    'DEVICE_NOT_FOUND',
    'INVALID_RESPONSE',
    'COMMAND_FAILED',
    'VALIDATION_ERROR',
]);
exports.TasmotaErrorDetails = zod_1.z.object({
    type: exports.TasmotaErrorType,
    message: zod_1.z.string(),
    originalError: zod_1.z.unknown().optional(),
    deviceHost: zod_1.z.string().optional(),
    command: zod_1.z.string().optional(),
    statusCode: zod_1.z.number().optional(),
});
// SDK Options
exports.SDKOptions = zod_1.z.object({
    defaultTimeout: zod_1.z.number().min(1000).max(60000).optional().default(5000),
    retryAttempts: zod_1.z.number().min(0).max(5).optional().default(3),
    retryDelay: zod_1.z.number().min(100).max(10000).optional().default(1000),
    discoveryTimeout: zod_1.z.number().min(1000).max(30000).optional().default(10000),
    validateResponses: zod_1.z.boolean().optional().default(true),
});
// Command Response Generic
exports.CommandResponse = zod_1.z.object({
    success: zod_1.z.boolean(),
    data: zod_1.z.unknown().optional(),
    error: exports.TasmotaErrorDetails.optional(),
});
//# sourceMappingURL=index.js.map