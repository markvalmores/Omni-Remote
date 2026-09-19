import { DiscoveredDevice, DeviceType, BrandType, ProtocolType } from '../types';

export const OUI_VENDOR_DATABASE: Record<string, { vendor: string; brand: BrandType; type: DeviceType }> = {
  '00:1E:E2': { vendor: 'Samsung Electronics', brand: 'samsung', type: 'smart_tv' },
  '50:14:79': { vendor: 'Samsung Electronics', brand: 'samsung', type: 'smart_tv' },
  '48:44:F7': { vendor: 'Samsung Visual Display', brand: 'samsung', type: 'smart_tv' },
  '00:1C:62': { vendor: 'LG Electronics', brand: 'lg', type: 'smart_tv' },
  'A8:23:FE': { vendor: 'LG Electronics (webOS)', brand: 'lg', type: 'smart_tv' },
  'E4:5D:51': { vendor: 'LG Innotek Display', brand: 'lg', type: 'smart_tv' },
  '00:01:4A': { vendor: 'Sony Corporation', brand: 'sony', type: 'smart_tv' },
  'F0:BF:97': { vendor: 'Sony Bravia Video', brand: 'sony', type: 'smart_tv' },
  'AC:3B:77': { vendor: 'Roku Inc.', brand: 'roku', type: 'streaming_box' },
  'B8:3E:59': { vendor: 'Roku Streaming Player', brand: 'roku', type: 'streaming_box' },
  'F0:18:98': { vendor: 'Apple Inc. (Apple TV 4K)', brand: 'apple', type: 'streaming_box' },
  '70:EE:50': { vendor: 'Apple Inc.', brand: 'apple', type: 'streaming_box' },
  'EC:B5:FA': { vendor: 'Amazon Technologies (Fire TV)', brand: 'firetv', type: 'streaming_box' },
  '00:17:88': { vendor: 'Signify Netherlands (Philips Hue)', brand: 'philips_hue', type: 'iot_lighting' },
  'B8:27:EB': { vendor: 'Raspberry Pi / Home Assistant', brand: 'generic', type: 'iot_plug' },
  '00:0E:58': { vendor: 'Sonos Inc. (Soundbar Arc)', brand: 'generic', type: 'soundbar' },
  '70:2C:1F': { vendor: 'Google Nest / Chromecast', brand: 'android_tv', type: 'streaming_box' },
};

export const DEFAULT_DEVICES: DiscoveredDevice[] = [
  {
    id: 'samsung-qled-livingroom',
    name: 'Samsung 65" QLED 4K (Tizen)',
    type: 'smart_tv',
    brand: 'samsung',
    ipAddress: '192.168.1.105',
    macAddress: '50:14:79:A2:4B:91',
    wifiMac: '50:14:79:A2:4B:92',
    port: 8002,
    rssi: -48,
    connected: true,
    latencyMs: 1.8,
    protocol: 'tizen_ws',
    manufacturer: 'Samsung Electronics',
    state: {
      power: true,
      volume: 24,
      muted: false,
      currentApp: 'Netflix',
      inputSource: 'HDMI 1 (eARC)',
    },
  },
  {
    id: 'lg-oled-bedroom',
    name: 'LG C3 OLED 55" (webOS 23)',
    type: 'smart_tv',
    brand: 'lg',
    ipAddress: '192.168.1.112',
    macAddress: 'A8:23:FE:19:D8:33',
    wifiMac: 'A8:23:FE:19:D8:34',
    port: 3001,
    rssi: -58,
    connected: false,
    latencyMs: 2.4,
    protocol: 'webos_ws',
    manufacturer: 'LG Electronics',
    state: {
      power: true,
      volume: 18,
      muted: false,
      currentApp: 'YouTube',
      inputSource: 'HDMI 2',
    },
  },
  {
    id: 'sony-bravia-den',
    name: 'Sony Bravia XR Google TV',
    type: 'smart_tv',
    brand: 'sony',
    ipAddress: '192.168.1.118',
    macAddress: 'F0:BF:97:5C:21:8A',
    wifiMac: 'F0:BF:97:5C:21:8B',
    port: 6466,
    rssi: -62,
    connected: false,
    latencyMs: 3.1,
    protocol: 'androidtv_remote',
    manufacturer: 'Sony Corporation',
    state: {
      power: false,
      volume: 30,
      muted: false,
      currentApp: 'Disney+',
      inputSource: 'HDMI 3',
    },
  },
  {
    id: 'roku-ultra-office',
    name: 'Roku Ultra 4K HDR',
    type: 'streaming_box',
    brand: 'roku',
    ipAddress: '192.168.1.140',
    macAddress: 'AC:3B:77:88:12:EF',
    wifiMac: 'AC:3B:77:88:12:F0',
    port: 8060,
    rssi: -45,
    connected: false,
    latencyMs: 1.5,
    protocol: 'roku_ecp',
    manufacturer: 'Roku Inc.',
    state: {
      power: true,
      volume: 50,
      muted: false,
      currentApp: 'Prime Video',
      inputSource: 'Streaming',
    },
  },
  {
    id: 'apple-tv-livingroom',
    name: 'Apple TV 4K (Gen 3)',
    type: 'streaming_box',
    brand: 'apple',
    ipAddress: '192.168.1.155',
    macAddress: 'F0:18:98:C3:7A:40',
    wifiMac: 'F0:18:98:C3:7A:41',
    port: 7000,
    rssi: -50,
    connected: false,
    latencyMs: 1.2,
    protocol: 'ble_hid',
    manufacturer: 'Apple Inc.',
    state: {
      power: true,
      volume: 20,
      muted: false,
      currentApp: 'Apple TV+',
      inputSource: 'AirPlay',
    },
  },
  {
    id: 'philips-hue-bridge',
    name: 'Philips Hue Smart Lights (Living Room)',
    type: 'iot_lighting',
    brand: 'philips_hue',
    ipAddress: '192.168.1.80',
    macAddress: '00:17:88:6A:B2:11',
    port: 80,
    rssi: -55,
    connected: true,
    latencyMs: 2.0,
    protocol: 'rest_api',
    manufacturer: 'Signify Netherlands',
    state: {
      power: true,
      volume: 0,
      muted: false,
      brightness: 75,
    },
  },
  {
    id: 'sonos-arc-soundbar',
    name: 'Sonos Arc Dolby Atmos Soundbar',
    type: 'soundbar',
    brand: 'generic',
    ipAddress: '192.168.1.160',
    macAddress: '00:0E:58:3D:20:9C',
    port: 1400,
    rssi: -52,
    connected: false,
    latencyMs: 1.9,
    protocol: 'rest_api',
    manufacturer: 'Sonos Inc.',
    state: {
      power: true,
      volume: 32,
      muted: false,
    },
  },
];

export function lookupOuiVendor(mac: string): { vendor: string; brand: BrandType; type: DeviceType } | null {
  const normalized = mac.toUpperCase().replace(/[:-]/g, ':');
  const prefix = normalized.slice(0, 8); // e.g. "00:1E:E2"
  if (OUI_VENDOR_DATABASE[prefix]) {
    return OUI_VENDOR_DATABASE[prefix];
  }
  return null;
}

export function generateWakeOnLanPacket(macAddress: string): { hex: string; byteCount: number } {
  const cleanMac = macAddress.replace(/[^0-9A-Fa-f]/g, '');
  if (cleanMac.length !== 12) {
    throw new Error('Invalid MAC address for WoL packet. Requires 12 hex digits.');
  }
  // WoL Magic Packet: 6 bytes of 0xFF followed by 16 repetitions of target MAC (total 102 bytes)
  const header = 'FFFFFFFFFFFF';
  const repeated = cleanMac.repeat(16);
  const fullPacket = header + repeated;
  return {
    hex: fullPacket.toUpperCase().match(/.{1,2}/g)?.join(':') || fullPacket,
    byteCount: 102,
  };
}

export async function scanWebBluetooth(): Promise<{ success: boolean; device?: any; message: string }> {
  if (typeof navigator !== 'undefined' && 'bluetooth' in navigator) {
    try {
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service', 'human_interface_device', 'generic_access'],
      });
      return {
        success: true,
        device,
        message: `Paired Bluetooth peripheral: ${device.name || 'Unknown BLE Device'} (ID: ${device.id})`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Bluetooth scan cancelled or permission denied.',
      };
    }
  }
  return {
    success: false,
    message: 'Web Bluetooth API not available in current browser context. Use Wi-Fi discovery or Direct MAC address pairing.',
  };
}
