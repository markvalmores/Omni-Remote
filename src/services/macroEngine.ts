import { Macro, MacroAction, DiscoveredDevice } from '../types';
import { playTactileSound, triggerHaptic } from './hapticsAndAudio';

export const DEFAULT_MACROS: Macro[] = [
  {
    id: 'macro-cinema-night',
    name: 'Cinema Night Experience',
    description: 'Powers on 65" TV, dims living room Hue lights to 20%, switches to HDMI 1 eARC, and launches Netflix.',
    iconName: 'Film',
    isPreset: true,
    steps: [
      {
        id: 'step-1',
        type: 'power_toggle',
        payload: { key: 'POWER_ON' },
        delayAfterMs: 800,
      },
      {
        id: 'step-2',
        type: 'iot_light',
        payload: { brightness: 20, color: '#f59e0b' },
        delayAfterMs: 400,
      },
      {
        id: 'step-3',
        type: 'input_switch',
        payload: { input: 'HDMI 1 (eARC)' },
        delayAfterMs: 600,
      },
      {
        id: 'step-4',
        type: 'volume_set',
        payload: { volume: 26 },
        delayAfterMs: 300,
      },
      {
        id: 'step-5',
        type: 'app_launch',
        payload: { appId: 'Netflix' },
        delayAfterMs: 200,
      },
    ],
  },
  {
    id: 'macro-esports-mode',
    name: '120Hz Ultra Gaming Rig',
    description: 'Switches TV to Game Mode HDMI 2, activates 1000Hz polling rate, sets Hue bias lighting to cyan, soundbar surround.',
    iconName: 'Gamepad2',
    isPreset: true,
    steps: [
      {
        id: 'step-g1',
        type: 'power_toggle',
        payload: { key: 'POWER_ON' },
        delayAfterMs: 500,
      },
      {
        id: 'step-g2',
        type: 'input_switch',
        payload: { input: 'HDMI 2 (120Hz VRR)' },
        delayAfterMs: 500,
      },
      {
        id: 'step-g3',
        type: 'iot_light',
        payload: { brightness: 60, color: '#06b6d4' },
        delayAfterMs: 300,
      },
      {
        id: 'step-g4',
        type: 'gamepad_combo',
        payload: { combo: ['L1', 'R1', 'START'] },
        delayAfterMs: 200,
      },
    ],
  },
  {
    id: 'macro-late-night-quiet',
    name: 'Late Night Quiet Mode',
    description: 'Ramps TV volume down to 8, engages night EQ on soundbar, sets Hue lights to warm amber 10%.',
    iconName: 'Moon',
    isPreset: true,
    steps: [
      {
        id: 'step-q1',
        type: 'volume_set',
        payload: { volume: 8 },
        delayAfterMs: 400,
      },
      {
        id: 'step-q2',
        type: 'iot_light',
        payload: { brightness: 10, color: '#ea580c' },
        delayAfterMs: 300,
      },
    ],
  },
  {
    id: 'macro-all-off-eco',
    name: 'Eco Master Shutdown',
    description: 'Powers down all connected Smart TVs, soundbar, and IoT smart plugs in synchronized sequence.',
    iconName: 'PowerOff',
    isPreset: true,
    steps: [
      {
        id: 'step-e1',
        type: 'power_toggle',
        payload: { key: 'POWER_OFF' },
        delayAfterMs: 600,
      },
      {
        id: 'step-e2',
        type: 'iot_light',
        payload: { brightness: 0 },
        delayAfterMs: 300,
      },
    ],
  },
];

const MACROS_STORAGE_KEY = 'omniremote_custom_macros_v1';

export function loadSavedMacros(): Macro[] {
  if (typeof window === 'undefined') return DEFAULT_MACROS;
  try {
    const raw = localStorage.getItem(MACROS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(MACROS_STORAGE_KEY, JSON.stringify(DEFAULT_MACROS));
      return DEFAULT_MACROS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.warn('Failed to load custom macros:', e);
  }
  return DEFAULT_MACROS;
}

export function saveMacros(macros: Macro[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MACROS_STORAGE_KEY, JSON.stringify(macros));
  } catch (e) {
    console.error('Failed to save macros:', e);
  }
}

export async function executeMacro(
  macro: Macro,
  devices: DiscoveredDevice[],
  activeDevice: DiscoveredDevice | null,
  onStepProgress: (stepIndex: number, currentStep: MacroAction) => void,
  onComplete: () => void,
  soundEnabled: boolean = true
): Promise<void> {
  for (let i = 0; i < macro.steps.length; i++) {
    const step = macro.steps[i];
    onStepProgress(i, step);
    playTactileSound('click', soundEnabled);
    triggerHaptic(12, soundEnabled);

    // Perform the action on target device or active device
    applyMacroAction(step, devices, activeDevice);

    if (step.delayAfterMs > 0) {
      await new Promise(res => setTimeout(res, step.delayAfterMs));
    }
  }
  playTactileSound('macro_success', soundEnabled);
  triggerHaptic(30, soundEnabled);
  onComplete();
}

function applyMacroAction(
  step: MacroAction,
  devices: DiscoveredDevice[],
  activeDevice: DiscoveredDevice | null
) {
  const target = step.targetDeviceId 
    ? devices.find(d => d.id === step.targetDeviceId) || activeDevice
    : activeDevice;

  if (!target) return;

  if (step.type === 'power_toggle') {
    if (step.payload.key === 'POWER_ON') {
      target.state.power = true;
    } else if (step.payload.key === 'POWER_OFF') {
      target.state.power = false;
    } else {
      target.state.power = !target.state.power;
    }
  } else if (step.type === 'volume_set' && typeof step.payload.volume === 'number') {
    target.state.volume = step.payload.volume;
    target.state.muted = false;
  } else if (step.type === 'input_switch' && step.payload.input) {
    target.state.inputSource = step.payload.input;
  } else if (step.type === 'app_launch' && step.payload.appId) {
    target.state.currentApp = step.payload.appId;
  } else if (step.type === 'iot_light') {
    const light = devices.find(d => d.type === 'iot_lighting') || target;
    if (typeof step.payload.brightness === 'number') {
      light.state.brightness = step.payload.brightness;
      light.state.power = step.payload.brightness > 0;
    }
  }
}
