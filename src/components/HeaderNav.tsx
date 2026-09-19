import React from 'react';
import { 
  Tv, 
  Wifi, 
  Bluetooth, 
  Cpu, 
  Gamepad2, 
  MousePointer, 
  Keyboard, 
  Grid3X3, 
  Workflow, 
  Cloud, 
  Volume2, 
  VolumeX, 
  Radio, 
  Settings2,
  Smartphone,
  Tablet,
  Laptop,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { 
  DiscoveredDevice, 
  ClientDeviceSpecs, 
  ControlMode, 
  PollingRateHz, 
  TelemetryStats 
} from '../types';

interface HeaderNavProps {
  devices: DiscoveredDevice[];
  activeDevice: DiscoveredDevice | null;
  onSelectDevice: (device: DiscoveredDevice) => void;
  clientSpecs: ClientDeviceSpecs | null;
  controlMode: ControlMode;
  onSelectControlMode: (mode: ControlMode) => void;
  telemetry: TelemetryStats;
  onOpenScanner: () => void;
  onOpenSpecs: () => void;
  onOpenCloudSync: () => void;
  onOpenLatencyHUD: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onDetectTV?: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  devices,
  activeDevice,
  onSelectDevice,
  clientSpecs,
  controlMode,
  onSelectControlMode,
  telemetry,
  onOpenScanner,
  onOpenSpecs,
  onOpenCloudSync,
  onOpenLatencyHUD,
  soundEnabled,
  onToggleSound,
  onDetectTV,
}) => {
  const [deviceDropdownOpen, setDeviceDropdownOpen] = React.useState(false);

  const getFormFactorIcon = () => {
    if (!clientSpecs) return <Laptop className="w-4 h-4 text-cyan-400" />;
    switch (clientSpecs.formFactor) {
      case 'mobile':
        return <Smartphone className="w-4 h-4 text-emerald-400" />;
      case 'tablet':
        return <Tablet className="w-4 h-4 text-purple-400" />;
      case 'handheld':
        return <Gamepad2 className="w-4 h-4 text-amber-400" />;
      default:
        return <Laptop className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <header className="w-full bg-[#0b101c]/95 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40 px-3 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
        
        {/* Left: Branding & Active Target Device Dropdown */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 shadow-md shadow-cyan-500/20 text-white font-bold text-lg">
              <Radio className="w-5 h-5 animate-pulse text-white" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#0b101c]"></span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-white text-base sm:text-lg">
                  Omni<span className="text-cyan-400">Remote</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-700/40">
                  Universal IoT
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="text-emerald-400 font-medium">Synced</span>
                </span>
                <span>•</span>
                <button
                  onClick={onOpenSpecs}
                  className="hover:text-cyan-300 transition-colors flex items-center gap-1"
                  title="View detected client device hardware specifications"
                >
                  {getFormFactorIcon()}
                  <span>{clientSpecs?.os || 'System'} ({clientSpecs?.formFactor || 'Client'})</span>
                </button>
              </div>
            </div>
          </div>

          {/* Active Target Device Selector */}
          <div className="relative">
            <button
              onClick={() => setDeviceDropdownOpen(!deviceDropdownOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/60 hover:border-cyan-500/50 transition-all text-xs font-medium text-slate-200"
            >
              <Tv className="w-3.5 h-3.5 text-cyan-400" />
              <div className="max-w-[130px] sm:max-w-[180px] truncate text-left">
                {activeDevice ? activeDevice.name : 'No Target Device'}
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${deviceDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {deviceDropdownOpen && (
              <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 p-2 text-xs">
                <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex justify-between items-center">
                  <span>Connected Targets</span>
                  <span className="text-[10px] text-cyan-400">{devices.length} Online</span>
                </div>
                <div className="max-h-56 overflow-y-auto space-y-1 my-1">
                  {devices.map((dev) => (
                    <button
                      key={dev.id}
                      onClick={() => {
                        onSelectDevice(dev);
                        setDeviceDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors ${
                        activeDevice?.id === dev.id 
                          ? 'bg-cyan-950/60 border border-cyan-500/40 text-cyan-200' 
                          : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="font-medium truncate">{dev.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {dev.ipAddress} • {dev.protocol.replace('_', ' ').toUpperCase()}
                        </div>
                      </div>
                      {activeDevice?.id === dev.id && (
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="border-t border-slate-800 pt-1.5 mt-1 space-y-1">
                  {onDetectTV && (
                    <button
                      onClick={() => {
                        setDeviceDropdownOpen(false);
                        onDetectTV();
                      }}
                      className="w-full py-1.5 text-center text-emerald-400 hover:text-emerald-300 font-medium hover:bg-emerald-950/40 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                      Auto-Detect Nearby TV &amp; Prompt
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setDeviceDropdownOpen(false);
                      onOpenScanner();
                    }}
                    className="w-full py-1.5 text-center text-cyan-400 hover:text-cyan-300 font-medium hover:bg-cyan-950/30 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Wifi className="w-3.5 h-3.5" />
                    Scan / Add Hardware (Direct MAC)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Control Modes Tab Selector */}
        <div className="flex items-center justify-center overflow-x-auto py-1 scrollbar-none">
          <nav className="flex items-center p-1 bg-slate-950/80 rounded-xl border border-slate-800/80 gap-1">
            <button
              onClick={() => onSelectControlMode('remote')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                controlMode === 'remote'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Remote</span>
            </button>

            <button
              onClick={() => onSelectControlMode('gamepad')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                controlMode === 'gamepad'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Gamepad</span>
            </button>

            <button
              onClick={() => onSelectControlMode('trackpad')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                controlMode === 'trackpad'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <MousePointer className="w-3.5 h-3.5" />
              <span>Trackpad</span>
            </button>

            <button
              onClick={() => onSelectControlMode('keyboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                controlMode === 'keyboard'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>Keys (F1-F12)</span>
            </button>

            <button
              onClick={() => onSelectControlMode('numpad')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                controlMode === 'numpad'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>Numpad</span>
            </button>

            <button
              onClick={() => onSelectControlMode('macros')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                controlMode === 'macros'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Workflow className="w-3.5 h-3.5" />
              <span>Macros</span>
            </button>
          </nav>
        </div>

        {/* Right: Telemetry & Actions */}
        <div className="flex items-center justify-end gap-2 text-xs">
          {/* Latency & Polling Rate Pill */}
          <button
            onClick={onOpenLatencyHUD}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-cyan-500/30 hover:border-cyan-400/70 transition-all group"
            title="Adjust Polling Rate & View Low-Latency Telemetry"
          >
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-cyan-300">
              <Cpu className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-45 transition-transform" />
              <span className="font-bold">{telemetry.pollingRate}Hz</span>
            </div>
            <div className="h-3 w-px bg-slate-700"></div>
            <div className="font-mono text-[11px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>{telemetry.pingMs.toFixed(1)}ms</span>
            </div>
          </button>

          {/* Detect TV Prompt Button */}
          {onDetectTV && (
            <button
              onClick={onDetectTV}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 hover:bg-emerald-900/90 text-emerald-300 hover:text-emerald-200 text-xs font-bold transition-all shadow-sm shadow-emerald-950"
              title="Detect Nearby Smart TV and test mutual prompt handshake"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">Detect TV</span>
            </button>
          )}

          {/* Cloud Sync Button */}
          <button
            onClick={onOpenCloudSync}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 transition-colors"
            title="Cloud-Sync Saved Keybind Profiles"
          >
            <Cloud className="w-4 h-4" />
          </button>

          {/* Device Scanner Button */}
          <button
            onClick={onOpenScanner}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 transition-colors"
            title="Wi-Fi, Bluetooth & Direct MAC Scanner"
          >
            <Wifi className="w-4 h-4" />
          </button>

          {/* Tactile Audio & Haptics Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-1.5 rounded-lg border transition-colors ${
              soundEnabled
                ? 'bg-slate-900 border-cyan-500/40 text-cyan-400'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title={soundEnabled ? 'Tactile Audio & Haptics ON' : 'Tactile Audio Muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

      </div>
    </header>
  );
};
