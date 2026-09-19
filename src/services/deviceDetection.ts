import { ClientDeviceSpecs, PollingRateHz, ControlMode } from '../types';

export async function detectClientSpecifications(): Promise<ClientDeviceSpecs> {
  const ua = navigator.userAgent || '';
  
  // OS Detection
  let os: ClientDeviceSpecs['os'] = 'Unknown';
  if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
    os = 'iOS';
  } else if (/Android/.test(ua)) {
    os = 'Android';
  } else if (/Win/.test(ua)) {
    os = 'Windows';
  } else if (/Mac/.test(ua)) {
    os = 'macOS';
  } else if (/CrOS/.test(ua)) {
    os = 'ChromeOS';
  } else if (/Linux/.test(ua)) {
    os = 'Linux';
  }

  // Form Factor
  const width = window.innerWidth;
  const height = window.innerHeight;
  const maxTouchPoints = navigator.maxTouchPoints || 0;
  const isTouch = maxTouchPoints > 0 || 'ontouchstart' in window;

  let formFactor: ClientDeviceSpecs['formFactor'] = 'desktop';
  if (/Mobi|Android|iPhone/.test(ua) && width <= 640) {
    formFactor = 'mobile';
  } else if ((width > 640 && width <= 1024 && isTouch) || /iPad|Tablet/.test(ua)) {
    formFactor = 'tablet';
  } else if (/Steam Deck|Odin|ROG Ally|Ayaneo/.test(ua)) {
    formFactor = 'handheld';
  } else if (isTouch && width < 768) {
    formFactor = 'mobile';
  } else {
    formFactor = 'desktop';
  }

  // Refresh Rate Detection (estimate using rAF)
  const refreshRateHz = await estimateScreenRefreshRate();

  // GPU Renderer
  let gpuRenderer = 'Hardware Accelerated';
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl && 'getExtension' in gl) {
      const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        gpuRenderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'Hardware Accelerated';
      }
    }
  } catch (e) {
    gpuRenderer = 'Integrated Graphics Engine';
  }

  // Battery Status
  let batteryLevel: number | null = null;
  let batteryCharging: boolean | null = null;
  try {
    if ('getBattery' in navigator) {
      const battery: any = await (navigator as any).getBattery();
      batteryLevel = battery.level;
      batteryCharging = battery.charging;
    }
  } catch (e) {
    // Battery API not supported or permissions blocked
  }

  // Network Information
  let rttMs = 12;
  let effectiveNetworkType = '4g / 5GHz Wi-Fi';
  try {
    const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (conn) {
      rttMs = conn.rtt || 12;
      effectiveNetworkType = conn.effectiveType || (conn.type ? conn.type : 'Wi-Fi');
    }
  } catch (e) {
    // Network Information API fallback
  }

  // Gamepads
  const gamepadSupported = 'getGamepads' in navigator;
  let connectedGamepadsCount = 0;
  if (gamepadSupported) {
    try {
      const pads = navigator.getGamepads();
      connectedGamepadsCount = pads ? Array.from(pads).filter(p => p !== null).length : 0;
    } catch (e) {
      connectedGamepadsCount = 0;
    }
  }

  return {
    os,
    formFactor,
    screenWidth: width,
    screenHeight: height,
    dpr: window.devicePixelRatio || 1,
    refreshRateHz,
    hasTouch: isTouch,
    maxTouchPoints,
    batteryLevel,
    batteryCharging,
    gamepadSupported,
    connectedGamepadsCount,
    gpuRenderer,
    rttMs,
    effectiveNetworkType,
    userAgent: ua,
  };
}

function estimateScreenRefreshRate(): Promise<number> {
  return new Promise((resolve) => {
    let frameTimes: number[] = [];
    let prevTime = performance.now();
    let frameCount = 0;
    const maxFrames = 30;

    function step(timestamp: number) {
      const delta = timestamp - prevTime;
      prevTime = timestamp;
      if (delta > 0 && delta < 100) {
        frameTimes.push(delta);
      }
      frameCount++;
      if (frameCount < maxFrames) {
        requestAnimationFrame(step);
      } else {
        if (frameTimes.length === 0) {
          resolve(60);
          return;
        }
        // Calculate average frame duration
        const avgDelta = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
        const fps = Math.round(1000 / avgDelta);
        if (fps >= 200) resolve(240);
        else if (fps >= 130) resolve(144);
        else if (fps >= 110) resolve(120);
        else if (fps >= 80) resolve(90);
        else resolve(60);
      }
    }

    requestAnimationFrame(step);
  });
}

export function getRecommendedDefaults(specs: ClientDeviceSpecs): {
  recommendedMode: ControlMode;
  recommendedPollingRate: PollingRateHz;
  hapticEnabled: boolean;
} {
  if (specs.formFactor === 'mobile') {
    return {
      recommendedMode: 'remote',
      recommendedPollingRate: 125,
      hapticEnabled: true,
    };
  } else if (specs.formFactor === 'tablet') {
    return {
      recommendedMode: 'remote',
      recommendedPollingRate: 250,
      hapticEnabled: true,
    };
  } else if (specs.connectedGamepadsCount > 0 || specs.formFactor === 'handheld') {
    return {
      recommendedMode: 'gamepad',
      recommendedPollingRate: 500,
      hapticEnabled: true,
    };
  } else {
    // Desktop / Laptop
    return {
      recommendedMode: 'trackpad',
      recommendedPollingRate: 500,
      hapticEnabled: false,
    };
  }
}
