export type DeviceType = 
  | 'smart_tv' 
  | 'streaming_box' 
  | 'iot_lighting' 
  | 'iot_plug' 
  | 'soundbar' 
  | 'game_console' 
  | 'pc_laptop';

export type BrandType = 
  | 'samsung' 
  | 'lg' 
  | 'sony' 
  | 'apple' 
  | 'roku' 
  | 'firetv' 
  | 'android_tv' 
  | 'philips_hue' 
  | 'generic';

export type ProtocolType = 
  | 'tizen_ws' 
  | 'webos_ws' 
  | 'roku_ecp' 
  | 'androidtv_remote' 
  | 'ble_hid' 
  | 'rest_api' 
  | 'wol'
  | 'direct_mac_arp';

export interface DiscoveredDevice {
  id: string;
  name: string;
  type: DeviceType;
  brand: BrandType;
  ipAddress: string;
  macAddress: string;
  wifiMac?: string;
  port: number;
  rssi?: number; // dBm for Bluetooth/Wi-Fi signal
  connected: boolean;
  latencyMs: number;
  protocol: ProtocolType;
  manufacturer: string;
  isCustomManual?: boolean;
  state: {
    power: boolean;
    volume: number;
    muted: boolean;
    currentApp?: string;
    inputSource?: string;
    brightness?: number;
  };
}

export interface ClientDeviceSpecs {
  os: 'iOS' | 'Android' | 'Windows' | 'macOS' | 'Linux' | 'ChromeOS' | 'Unknown';
  formFactor: 'mobile' | 'tablet' | 'desktop' | 'handheld';
  screenWidth: number;
  screenHeight: number;
  dpr: number;
  refreshRateHz: number;
  hasTouch: boolean;
  maxTouchPoints: number;
  batteryLevel: number | null; // 0.0 - 1.0
  batteryCharging: boolean | null;
  gamepadSupported: boolean;
  connectedGamepadsCount: number;
  gpuRenderer: string;
  rttMs: number;
  effectiveNetworkType: string;
  userAgent: string;
}

export type PollingRateHz = 60 | 125 | 250 | 500 | 1000;

export type ControlMode = 'remote' | 'gamepad' | 'trackpad' | 'keyboard' | 'numpad' | 'macros';

export interface MacroAction {
  id: string;
  type: 
    | 'power_toggle' 
    | 'key_press' 
    | 'volume_set' 
    | 'input_switch' 
    | 'app_launch' 
    | 'iot_light' 
    | 'gamepad_combo' 
    | 'delay';
  targetDeviceId?: string;
  payload: {
    key?: string;
    volume?: number;
    input?: string;
    appId?: string;
    color?: string;
    brightness?: number;
    delayMs?: number;
    combo?: string[];
  };
  delayAfterMs: number;
}

export interface Macro {
  id: string;
  name: string;
  description: string;
  iconName: string;
  steps: MacroAction[];
  triggerShortcut?: string;
  isPreset?: boolean;
}

export interface KeybindProfile {
  id: string;
  name: string;
  category: 'gaming' | 'streaming' | 'productivity' | 'general';
  description: string;
  pollingRate: PollingRateHz;
  hapticEnabled: boolean;
  mappings: Record<string, string>; // e.g. "gamepad_A": "TV_OK", "key_f5": "TV_REFRESH"
  createdAt: string;
  lastSyncedAt: string;
  cloudCode?: string;
}

export interface TelemetryStats {
  pollingRate: PollingRateHz;
  actualIntervalMs: number;
  pingMs: number;
  jitterMs: number;
  packetsSent: number;
  packetsReceived: number;
  droppedFrames: number;
  quality: 'optimal' | 'good' | 'fair' | 'laggy';
}

export interface TrackpadState {
  x: number;
  y: number;
  isDown: boolean;
  sensitivity: number; // 1 to 10
  scrollSensitivity: number; // 1 to 10
  tapToClick: boolean;
  dragLock: boolean;
}
