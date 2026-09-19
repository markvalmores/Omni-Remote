import React from 'react';
import { 
  Cpu, 
  Zap, 
  Activity, 
  Radio, 
  CheckCircle, 
  ShieldCheck, 
  X, 
  Gamepad, 
  Sliders, 
  Clock, 
  Signal, 
  Layers
} from 'lucide-react';
import { PollingRateHz, TelemetryStats, ClientDeviceSpecs } from '../types';

interface LatencyHUDProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry: TelemetryStats;
  onSetPollingRate: (rate: PollingRateHz) => void;
  clientSpecs: ClientDeviceSpecs | null;
  hapticEnabled: boolean;
  onToggleHaptic: () => void;
}

const POLLING_OPTIONS: { rate: PollingRateHz; label: string; desc: string; latencyStr: string }[] = [
  { rate: 60, label: '60 Hz (Standard)', desc: 'Lowest CPU & battery consumption, ideal for smart TV media navigation.', latencyStr: '16.6 ms' },
  { rate: 125, label: '125 Hz (Fast)', desc: 'Standard HID USB/Bluetooth keyboard & mouse response rate.', latencyStr: '8.0 ms' },
  { rate: 250, label: '250 Hz (High Speed)', desc: 'Smooth trackpad and swift interactive menu scrolling.', latencyStr: '4.0 ms' },
  { rate: 500, label: '500 Hz (Pro Gaming)', desc: 'Tournament standard for responsive analog sticks and precision action.', latencyStr: '2.0 ms' },
  { rate: 1000, label: '1000 Hz (Zero-Lag eSports)', desc: 'Ultra-low 1ms latency packet dispatching for twitch gaming & cloud stream.', latencyStr: '1.0 ms' },
];

export const LatencyHUD: React.FC<LatencyHUDProps> = ({
  isOpen,
  onClose,
  telemetry,
  onSetPollingRate,
  clientSpecs,
  hapticEnabled,
  onToggleHaptic,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-md">
      <div className="bg-[#0f172a] border border-cyan-500/40 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl shadow-cyan-950/50 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900/90 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400">
              <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Ultra-Low Latency &amp; Polling HUD
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                  Active
                </span>
              </h2>
              <p className="text-xs text-slate-400">Adjust hardware dispatch polling rates and inspect transmission telemetry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Live Telemetry Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
              <div className="text-[11px] font-medium text-slate-400 flex items-center justify-center gap-1">
                <Clock className="w-3 h-3 text-cyan-400" />
                Response Ping
              </div>
              <div className="text-xl font-mono font-bold text-cyan-300 mt-1">
                {telemetry.pingMs.toFixed(1)} <span className="text-xs text-slate-500">ms</span>
              </div>
              <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">Jitter: ±{telemetry.jitterMs.toFixed(1)}ms</div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
              <div className="text-[11px] font-medium text-slate-400 flex items-center justify-center gap-1">
                <Cpu className="w-3 h-3 text-cyan-400" />
                Polling Rate
              </div>
              <div className="text-xl font-mono font-bold text-cyan-300 mt-1">
                {telemetry.pollingRate} <span className="text-xs text-slate-500">Hz</span>
              </div>
              <div className="text-[10px] text-cyan-400 font-semibold mt-0.5">~{telemetry.actualIntervalMs.toFixed(1)}ms Loop</div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
              <div className="text-[11px] font-medium text-slate-400 flex items-center justify-center gap-1">
                <Activity className="w-3 h-3 text-cyan-400" />
                Packets Sent
              </div>
              <div className="text-xl font-mono font-bold text-slate-200 mt-1">
                {telemetry.packetsSent.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">0 Dropped (100%)</div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
              <div className="text-[11px] font-medium text-slate-400 flex items-center justify-center gap-1">
                <Signal className="w-3 h-3 text-cyan-400" />
                Buffer Health
              </div>
              <div className="text-xl font-mono font-bold text-emerald-400 mt-1">
                99.9%
              </div>
              <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">Zero Congestion</div>
            </div>
          </div>

          {/* Polling Rate Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                Hardware Polling Rate Target
              </label>
              <span className="text-[11px] text-cyan-400 font-mono">Current: {telemetry.pollingRate} Hz</span>
            </div>

            <div className="space-y-2">
              {POLLING_OPTIONS.map((opt) => (
                <button
                  key={opt.rate}
                  onClick={() => onSetPollingRate(opt.rate)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    telemetry.pollingRate === opt.rate
                      ? 'bg-cyan-950/50 border-cyan-400 shadow-md shadow-cyan-950/50 text-white'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-100">{opt.label}</span>
                      <span className="font-mono text-xs text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/40">
                        {opt.latencyStr}
                      </span>
                      {opt.rate === 1000 && (
                        <span className="text-[10px] font-bold text-amber-300 px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-700/50">
                          eSports
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{opt.desc}</p>
                  </div>
                  {telemetry.pollingRate === opt.rate && (
                    <CheckCircle className="w-5 h-5 text-cyan-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Connected Gamepads & Haptics */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gamepad className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-semibold text-slate-200">Physical Gamepad Pass-Through</span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {clientSpecs?.connectedGamepadsCount || 0} Connected
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Plug in or pair any Bluetooth / USB gamepad (Xbox Series X, DualSense, 8BitDo, Switch Pro). OmniRemote intercepts Gamepad API triggers at {telemetry.pollingRate}Hz.
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
              <div>
                <div className="text-xs font-medium text-slate-200">Tactile Vibration &amp; Haptics</div>
                <div className="text-[11px] text-slate-400">Micro-pulse on button presses for physical feedback</div>
              </div>
              <button
                onClick={onToggleHaptic}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  hapticEnabled ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    hapticEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-900/90 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors"
          >
            Apply &amp; Close
          </button>
        </div>

      </div>
    </div>
  );
};
