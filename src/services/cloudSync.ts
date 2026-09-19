import { KeybindProfile } from '../types';

export const PRESET_PROFILES: KeybindProfile[] = [
  {
    id: 'preset-gaming-esports',
    name: 'Pro Gaming & Low-Latency 1000Hz',
    category: 'gaming',
    description: '1ms polling rate with hair-trigger shoulder buttons, turbo action mapping, and instant d-pad response.',
    pollingRate: 1000,
    hapticEnabled: true,
    mappings: {
      'gamepad_A': 'GAME_JUMP',
      'gamepad_B': 'GAME_CROUCH',
      'gamepad_X': 'GAME_RELOAD',
      'gamepad_Y': 'GAME_SWITCH_WEAPON',
      'gamepad_L1': 'GAME_AIM',
      'gamepad_R1': 'GAME_FIRE',
      'gamepad_L2': 'GAME_SPRINT',
      'gamepad_R2': 'GAME_MELEE',
      'key_f1': 'QUICK_SAVE',
      'key_f5': 'SCREENSHOT',
      'numpad_0': 'TURBO_FIRE',
    },
    createdAt: '2026-09-01T12:00:00Z',
    lastSyncedAt: '2026-09-19T14:00:00Z',
    cloudCode: 'SYNC-9421-GAME',
  },
  {
    id: 'preset-livingroom-cinema',
    name: 'Smart TV Living Room Cinema',
    category: 'streaming',
    description: 'Optimized 125Hz battery-saving remote with instant Netflix, Disney+, Plex launch and ambient dimming.',
    pollingRate: 125,
    hapticEnabled: true,
    mappings: {
      'btn_home': 'TV_DASHBOARD',
      'btn_back': 'TV_BACK',
      'btn_vol_up': 'VOL_UP_STEP_2',
      'btn_vol_down': 'VOL_DOWN_STEP_2',
      'key_f4': 'APP_NETFLIX',
      'key_f8': 'APP_YOUTUBE',
      'numpad_enter': 'INPUT_HDMI1',
    },
    createdAt: '2026-09-05T10:00:00Z',
    lastSyncedAt: '2026-09-19T14:15:00Z',
    cloudCode: 'SYNC-3188-CINEMA',
  },
  {
    id: 'preset-pc-desktop-presentation',
    name: 'PC / Laptop Desktop & Numpad Navigator',
    category: 'productivity',
    description: 'High-precision trackpad gestures, full F1-F12 presentation keys, Alt-Tab switcher and full numpad calculator entries.',
    pollingRate: 250,
    hapticEnabled: false,
    mappings: {
      'key_f5': 'SLIDE_PRESENT_START',
      'key_esc': 'SLIDE_EXIT',
      'numpad_plus': 'ZOOM_IN',
      'numpad_minus': 'ZOOM_OUT',
      'numpad_enter': 'CONFIRM_SELECTION',
      'trackpad_tap': 'MOUSE_LEFT_CLICK',
    },
    createdAt: '2026-09-10T14:30:00Z',
    lastSyncedAt: '2026-09-19T14:20:00Z',
    cloudCode: 'SYNC-8812-PROD',
  },
  {
    id: 'preset-retro-arcade',
    name: 'Retro Arcade & Emulator',
    category: 'gaming',
    description: 'Classic arcade 6-button layout, rapid auto-fire toggle, fast save state rewind keys.',
    pollingRate: 500,
    hapticEnabled: true,
    mappings: {
      'gamepad_A': 'ARCADE_BUTTON_1',
      'gamepad_B': 'ARCADE_BUTTON_2',
      'gamepad_X': 'ARCADE_BUTTON_3',
      'gamepad_Y': 'ARCADE_BUTTON_4',
      'gamepad_L1': 'COIN_INSERT',
      'gamepad_R1': 'PLAYER_1_START',
      'key_f2': 'LOAD_STATE',
      'key_f4': 'SAVE_STATE',
    },
    createdAt: '2026-09-12T08:00:00Z',
    lastSyncedAt: '2026-09-19T14:25:00Z',
    cloudCode: 'SYNC-5540-RETRO',
  },
];

const LOCAL_STORAGE_KEY = 'omniremote_profiles_v1';
const ACTIVE_PROFILE_KEY = 'omniremote_active_profile_id';

let syncChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    syncChannel = new BroadcastChannel('omniremote_cloud_sync_bus');
  }
} catch (e) {
  // BroadcastChannel unavailable in some sandbox contexts
}

export function loadSavedProfiles(): KeybindProfile[] {
  if (typeof window === 'undefined') return PRESET_PROFILES;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(PRESET_PROFILES));
      return PRESET_PROFILES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse saved profiles from localStorage:', e);
  }
  return PRESET_PROFILES;
}

export function saveProfilesToStorage(profiles: KeybindProfile[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(profiles));
    if (syncChannel) {
      syncChannel.postMessage({ type: 'PROFILES_UPDATED', profiles });
    }
  } catch (e) {
    console.error('Failed to save profiles:', e);
  }
}

export function generateCloudSyncCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomPart = '';
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SYNC-${randomPart}-OMNI`;
}

export function exportProfilesToJson(profiles: KeybindProfile[]): string {
  return JSON.stringify({
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    profiles,
  }, null, 2);
}

export function importProfilesFromJson(jsonStr: string): KeybindProfile[] {
  const parsed = JSON.parse(jsonStr);
  if (parsed && Array.isArray(parsed.profiles)) {
    return parsed.profiles;
  } else if (Array.isArray(parsed)) {
    return parsed;
  }
  throw new Error('Invalid keybind profile configuration JSON');
}

export function encodeProfileToCloudToken(profile: KeybindProfile): string {
  try {
    const minified = JSON.stringify({
      n: profile.name,
      c: profile.category,
      p: profile.pollingRate,
      h: profile.hapticEnabled,
      m: profile.mappings,
    });
    return btoa(minified);
  } catch (e) {
    return '';
  }
}

export function decodeProfileFromCloudToken(token: string): Partial<KeybindProfile> | null {
  try {
    const decoded = atob(token);
    const parsed = JSON.parse(decoded);
    return {
      name: parsed.n,
      category: parsed.c,
      pollingRate: parsed.p,
      hapticEnabled: parsed.h,
      mappings: parsed.m,
    };
  } catch (e) {
    return null;
  }
}

export function subscribeToCrossDeviceSync(onUpdate: (profiles: KeybindProfile[]) => void): () => void {
  if (!syncChannel) return () => {};
  const handler = (event: MessageEvent) => {
    if (event.data?.type === 'PROFILES_UPDATED' && Array.isArray(event.data?.profiles)) {
      onUpdate(event.data.profiles);
    }
  };
  syncChannel.addEventListener('message', handler);
  return () => {
    syncChannel?.removeEventListener('message', handler);
  };
}
