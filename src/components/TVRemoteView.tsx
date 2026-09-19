import React from 'react';
import { 
  Power, 
  Volume2, 
  VolumeX, 
  Volume1, 
  Home, 
  ArrowLeft, 
  Menu, 
  Info, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  FastForward, 
  Rewind, 
  Tv, 
  Sun, 
  Sliders, 
  Film, 
  Music, 
  Compass, 
  Layers
} from 'lucide-react';
import { DiscoveredDevice } from '../types';
import { playTactileSound, triggerHaptic } from '../services/hapticsAndAudio';

interface TVRemoteViewProps {
  device: DiscoveredDevice | null;
  onUpdateDeviceState: (updater: (prev: DiscoveredDevice) => DiscoveredDevice) => void;
  onSendKey: (key: string) => void;
  soundEnabled: boolean;
}

const QUICK_APPS = [
  { name: 'Netflix', color: 'bg-red-600 hover:bg-red-500 text-white', icon: 'N' },
  { name: 'YouTube', color: 'bg-rose-600 hover:bg-rose-500 text-white', icon: '▶' },
  { name: 'Prime', color: 'bg-sky-600 hover:bg-sky-500 text-white', icon: 'P' },
  { name: 'Disney+', color: 'bg-blue-800 hover:bg-blue-700 text-white', icon: 'D+' },
  { name: 'Plex', color: 'bg-amber-600 hover:bg-amber-500 text-white', icon: 'P' },
  { name: 'Spotify', color: 'bg-emerald-600 hover:bg-emerald-500 text-white', icon: '♫' },
];

export const TVRemoteView: React.FC<TVRemoteViewProps> = ({
  device,
  onUpdateDeviceState,
  onSendKey,
  soundEnabled,
}) => {
  const isPowerOn = device?.state.power ?? true;
  const currentVol = device?.state.volume ?? 20;
  const isMuted = device?.state.muted ?? false;

  const handleAction = (key: string, customSound?: any) => {
    playTactileSound(customSound || 'dpad', soundEnabled);
    triggerHaptic(12, soundEnabled);
    onSendKey(key);

    if (key === 'POWER') {
      onUpdateDeviceState((d) => ({
        ...d,
        state: { ...d.state, power: !d.state.power },
      }));
    } else if (key === 'VOL_UP') {
      onUpdateDeviceState((d) => ({
        ...d,
        state: { ...d.state, volume: Math.min(100, d.state.volume + 1), muted: false },
      }));
    } else if (key === 'VOL_DOWN') {
      onUpdateDeviceState((d) => ({
        ...d,
        state: { ...d.state, volume: Math.max(0, d.state.volume - 1) },
      }));
    } else if (key === 'MUTE') {
      onUpdateDeviceState((d) => ({
        ...d,
        state: { ...d.state, muted: !d.state.muted },
      }));
    }
  };

  const handleAppLaunch = (appName: string) => {
    playTactileSound('click', soundEnabled);
    triggerHaptic(15, soundEnabled);
    onSendKey(`LAUNCH_${appName.toUpperCase()}`);
    onUpdateDeviceState((d) => ({
      ...d,
      state: { ...d.state, currentApp: appName },
    }));
  };

  return (
    <div className="w-full max-w-md mx-auto py-2 px-3 sm:px-4 flex flex-col items-center select-none">
      
      {/* Device Status Bar */}
      <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 mb-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl border transition-colors ${
            isPowerOn 
              ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-400 shadow-sm shadow-emerald-500/20' 
              : 'bg-rose-950/80 border-rose-500/40 text-rose-400'
          }`}>
            <Tv className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200">
              {device?.name || 'Smart TV Controller'}
            </div>
            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
              <span>App: {device?.state.currentApp || 'Home'}</span>
              <span>•</span>
              <span>Input: {device?.state.inputSource || 'HDMI 1'}</span>
            </div>
          </div>
        </div>

        {/* Volume badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300">
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
          <span>{isMuted ? 'MUTED' : `VOL ${currentVol}`}</span>
        </div>
      </div>

      {/* Main Remote Shell */}
      <div className="w-full bg-[#0d1424] border border-slate-800/90 rounded-3xl p-5 shadow-2xl shadow-cyan-950/20 flex flex-col items-center gap-5">
        
        {/* Top Control Strip: Power, Source, Mute, Info */}
        <div className="w-full flex items-center justify-between gap-3">
          <button
            onClick={() => handleAction('POWER', 'power')}
            className={`flex-1 py-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
              isPowerOn
                ? 'bg-rose-950/50 hover:bg-rose-900/60 border-rose-600/50 text-rose-300 shadow-md shadow-rose-950/50'
                : 'bg-emerald-950/50 hover:bg-emerald-900/60 border-emerald-600/50 text-emerald-300'
            }`}
            title="Toggle Smart TV Power"
          >
            <Power className="w-4 h-4" />
            <span>{isPowerOn ? 'Power' : 'Turn On'}</span>
          </button>

          <button
            onClick={() => handleAction('INPUT_SOURCE')}
            className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-bold text-slate-200 transition-colors flex items-center justify-center gap-1.5"
            title="Switch Video Input Source"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Source</span>
          </button>

          <button
            onClick={() => handleAction('MUTE')}
            className={`p-2.5 rounded-xl border transition-colors ${
              isMuted
                ? 'bg-rose-950 border-rose-500 text-rose-300'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-slate-300'
            }`}
            title="Mute Audio"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick Streaming Apps Bar */}
        <div className="w-full space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
            Quick Launch Apps
          </div>
          <div className="grid grid-cols-6 gap-1.5">
            {QUICK_APPS.map((app) => (
              <button
                key={app.name}
                onClick={() => handleAppLaunch(app.name)}
                className={`${app.color} py-2 rounded-xl text-[11px] font-extrabold flex flex-col items-center justify-center transition-all shadow-sm active:scale-95`}
                title={`Launch ${app.name}`}
              >
                <span>{app.icon}</span>
                <span className="text-[9px] font-medium leading-none mt-0.5">{app.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tactile Circular D-Pad */}
        <div className="relative w-56 h-56 rounded-full bg-gradient-to-b from-slate-800 to-slate-950 border-2 border-slate-700/80 shadow-2xl flex items-center justify-center p-2">
          
          {/* UP Button */}
          <button
            onClick={() => handleAction('UP')}
            className="absolute top-2 w-16 h-12 flex items-center justify-center text-slate-300 hover:text-cyan-300 active:text-cyan-400 active:scale-95 transition-all"
            title="D-Pad Up"
          >
            <ChevronUp className="w-7 h-7" />
          </button>

          {/* DOWN Button */}
          <button
            onClick={() => handleAction('DOWN')}
            className="absolute bottom-2 w-16 h-12 flex items-center justify-center text-slate-300 hover:text-cyan-300 active:text-cyan-400 active:scale-95 transition-all"
            title="D-Pad Down"
          >
            <ChevronDown className="w-7 h-7" />
          </button>

          {/* LEFT Button */}
          <button
            onClick={() => handleAction('LEFT')}
            className="absolute left-2 w-12 h-16 flex items-center justify-center text-slate-300 hover:text-cyan-300 active:text-cyan-400 active:scale-95 transition-all"
            title="D-Pad Left"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>

          {/* RIGHT Button */}
          <button
            onClick={() => handleAction('RIGHT')}
            className="absolute right-2 w-12 h-16 flex items-center justify-center text-slate-300 hover:text-cyan-300 active:text-cyan-400 active:scale-95 transition-all"
            title="D-Pad Right"
          >
            <ChevronRight className="w-7 h-7" />
          </button>

          {/* Center OK / Select Button */}
          <button
            onClick={() => handleAction('OK', 'click')}
            className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 hover:from-cyan-500 hover:to-blue-400 text-white font-extrabold text-sm shadow-lg shadow-cyan-500/30 flex items-center justify-center active:scale-90 transition-transform ring-4 ring-slate-900"
            title="OK / Select"
          >
            <span>OK</span>
          </button>
        </div>

        {/* Primary Navigation Row: Back, Home, Menu, Exit */}
        <div className="w-full grid grid-cols-4 gap-2">
          <button
            onClick={() => handleAction('BACK')}
            className="py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
            title="Back / Return"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span className="text-[10px]">Back</span>
          </button>

          <button
            onClick={() => handleAction('HOME')}
            className="py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
            title="Smart TV Home Dashboard"
          >
            <Home className="w-4 h-4 text-cyan-400" />
            <span className="text-[10px]">Home</span>
          </button>

          <button
            onClick={() => handleAction('MENU')}
            className="py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
            title="Settings Menu"
          >
            <Menu className="w-4 h-4 text-cyan-400" />
            <span className="text-[10px]">Menu</span>
          </button>

          <button
            onClick={() => handleAction('INFO')}
            className="py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
            title="Display Program Info"
          >
            <Info className="w-4 h-4 text-cyan-400" />
            <span className="text-[10px]">Info</span>
          </button>
        </div>

        {/* Volume & Channel Rockers */}
        <div className="w-full grid grid-cols-2 gap-4">
          {/* Volume Rocker */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2 flex flex-col items-center justify-between h-36">
            <button
              onClick={() => handleAction('VOL_UP')}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-sm flex items-center justify-center active:scale-95 transition-all"
            >
              +
            </button>
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex flex-col items-center">
              <span>VOL</span>
              <span className="font-mono text-cyan-400 text-xs font-bold">{currentVol}</span>
            </div>
            <button
              onClick={() => handleAction('VOL_DOWN')}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-sm flex items-center justify-center active:scale-95 transition-all"
            >
              -
            </button>
          </div>

          {/* Channel Rocker */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2 flex flex-col items-center justify-between h-36">
            <button
              onClick={() => handleAction('CH_UP')}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-sm flex items-center justify-center active:scale-95 transition-all"
            >
              ▲
            </button>
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              CH / PROG
            </div>
            <button
              onClick={() => handleAction('CH_DOWN')}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-sm flex items-center justify-center active:scale-95 transition-all"
            >
              ▼
            </button>
          </div>
        </div>

        {/* Media Playback Controls */}
        <div className="w-full flex items-center justify-between gap-2 p-2 bg-slate-900/80 rounded-2xl border border-slate-800">
          <button
            onClick={() => handleAction('REWIND')}
            className="flex-1 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center active:scale-95 transition-all"
            title="Rewind"
          >
            <Rewind className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleAction('PLAY_PAUSE')}
            className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center justify-center active:scale-95 transition-all shadow-md shadow-cyan-500/20"
            title="Play / Pause"
          >
            <Play className="w-4 h-4 fill-slate-950" />
          </button>
          <button
            onClick={() => handleAction('FAST_FORWARD')}
            className="flex-1 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center active:scale-95 transition-all"
            title="Fast Forward"
          >
            <FastForward className="w-4 h-4" />
          </button>
        </div>

        {/* Color Buttons (Red, Green, Yellow, Blue for TV Teletext / webOS shortcuts) */}
        <div className="w-full grid grid-cols-4 gap-2">
          <button
            onClick={() => handleAction('COLOR_RED')}
            className="h-3 rounded-full bg-red-500 hover:bg-red-400 active:scale-90 transition-all shadow-sm shadow-red-500/40"
            title="Red Function"
          />
          <button
            onClick={() => handleAction('COLOR_GREEN')}
            className="h-3 rounded-full bg-emerald-500 hover:bg-emerald-400 active:scale-90 transition-all shadow-sm shadow-emerald-500/40"
            title="Green Function"
          />
          <button
            onClick={() => handleAction('COLOR_YELLOW')}
            className="h-3 rounded-full bg-amber-400 hover:bg-amber-300 active:scale-90 transition-all shadow-sm shadow-amber-400/40"
            title="Yellow Function"
          />
          <button
            onClick={() => handleAction('COLOR_BLUE')}
            className="h-3 rounded-full bg-blue-500 hover:bg-blue-400 active:scale-90 transition-all shadow-sm shadow-blue-500/40"
            title="Blue Function"
          />
        </div>

      </div>
    </div>
  );
};
