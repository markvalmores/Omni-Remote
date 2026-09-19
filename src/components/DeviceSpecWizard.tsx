import React from 'react';
import { 
  Laptop, 
  Smartphone, 
  Tablet, 
  Gamepad2, 
  Sparkles, 
  Gauge, 
  Battery, 
  Wifi, 
  CheckCircle2, 
  X, 
  Monitor, 
  Layers, 
  RotateCcw,
  Zap
} from 'lucide-react';
import { ClientDeviceSpecs, PollingRateHz, ControlMode } from '../types';

interface DeviceSpecWizardProps {
  isOpen: boolean;
  onClose: () => void;
  specs: ClientDeviceSpecs | null;
  onApplyPreset: (mode: ControlMode, rate: PollingRateHz) => void;
}

export const DeviceSpecWizard: React.FC<DeviceSpecWizardProps> = ({
  isOpen,
  onClose,
  specs,
  onApplyPreset,
}) => {
  if (!isOpen || !specs) return null;

  const getDeviceIcon = () => {
    switch (specs.formFactor) {
      case 'mobile':
        return <Smartphone className="w-8 h-8 text-emerald-400" />;
      case 'tablet':
        return <Tablet className="w-8 h-8 text-purple-400" />;
      case 'handheld':
        return <Gamepad2 className="w-8 h-8 text-amber-400" />;
      default:
        return <Laptop className="w-8 h-8 text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md">
      <div className="bg-[#0e1626] border border-cyan-500/40 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl shadow-cyan-950/60 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-cyan-950/70 via-slate-900 to-slate-950 border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 shadow-inner">
              {getDeviceIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Client Hardware Auto-Calibration</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/50">
                  Boot Detection
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Detected: <span className="text-cyan-300 font-semibold">{specs.os}</span> • Form Factor: <span className="text-cyan-300 font-semibold uppercase">{specs.formFactor}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Specifications Matrix */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          
          <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed">
              OmniRemote has tuned internal timers, touch buffers, and touch hitboxes specifically for your <span className="font-semibold text-white">{specs.os} {specs.formFactor}</span>. You can switch control modes or manually tweak polling rates at any time.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            {/* Display & Refresh Rate */}
            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                  Screen &amp; Refresh Rate
                </span>
                <span className="font-mono text-cyan-400 font-bold">{specs.refreshRateHz} Hz</span>
              </div>
              <div className="font-mono text-slate-200">
                {specs.screenWidth} × {specs.screenHeight} px (DPR: {specs.dpr}x)
              </div>
            </div>

            {/* Input & Touch Capabilities */}
            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  Touch Interface
                </span>
                <span className={`font-semibold ${specs.hasTouch ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {specs.hasTouch ? `Active (${specs.maxTouchPoints} pts)` : 'Mouse / Trackpad'}
                </span>
              </div>
              <div className="text-slate-300">
                {specs.hasTouch ? 'Multi-touch gesture engine enabled' : 'Desktop cursor pass-through active'}
              </div>
            </div>

            {/* Physical Gamepad Support */}
            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Gamepad2 className="w-3.5 h-3.5 text-purple-400" />
                  Gamepad API Support
                </span>
                <span className="font-semibold text-purple-400">
                  {specs.gamepadSupported ? 'Supported' : 'Unavailable'}
                </span>
              </div>
              <div className="text-slate-300">
                {specs.connectedGamepadsCount > 0 
                  ? `${specs.connectedGamepadsCount} physical controller(s) detected` 
                  : 'Ready for Bluetooth/USB controller pairing'}
              </div>
            </div>

            {/* Network Latency RTT */}
            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                  Network &amp; RTT
                </span>
                <span className="font-mono text-cyan-400 font-bold">{specs.rttMs} ms</span>
              </div>
              <div className="text-slate-300">
                Type: {specs.effectiveNetworkType}
              </div>
            </div>

            {/* GPU Renderer */}
            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1 col-span-1 sm:col-span-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  GPU Graphics Acceleration
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">Zero Frame Lag</span>
              </div>
              <div className="text-slate-300 font-mono text-[11px] truncate">
                {specs.gpuRenderer}
              </div>
            </div>
          </div>

          {/* Quick Profile Recommendations */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Select Device Experience Preset
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => {
                  onApplyPreset('remote', 125);
                  onClose();
                }}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-400/60 text-left transition-all group"
              >
                <div className="text-xs font-bold text-slate-100 group-hover:text-cyan-300">
                  Touch TV Remote
                </div>
                <div className="text-[10px] text-slate-400 mt-1">125Hz • D-Pad • Quick Apps • Haptics</div>
              </button>

              <button
                onClick={() => {
                  onApplyPreset('gamepad', 1000);
                  onClose();
                }}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-400/60 text-left transition-all group"
              >
                <div className="text-xs font-bold text-slate-100 group-hover:text-cyan-300">
                  Low-Latency Gamepad
                </div>
                <div className="text-[10px] text-slate-400 mt-1">1000Hz • Dual Analog • Triggers • Turbo</div>
              </button>

              <button
                onClick={() => {
                  onApplyPreset('trackpad', 500);
                  onClose();
                }}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-400/60 text-left transition-all group"
              >
                <div className="text-xs font-bold text-slate-100 group-hover:text-cyan-300">
                  PC / Trackpad &amp; Keys
                </div>
                <div className="text-[10px] text-slate-400 mt-1">500Hz • Precision Cursor • F1-F12 • Numpad</div>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Calibrated on first launch • Stored locally
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-md shadow-cyan-400/20"
          >
            Confirm &amp; Proceed
          </button>
        </div>

      </div>
    </div>
  );
};
