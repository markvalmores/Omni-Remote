import React, { useState } from 'react';
import { 
  Workflow, 
  Play, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Tv, 
  Sun, 
  Volume2, 
  Film, 
  Gamepad2, 
  PowerOff, 
  Layers, 
  Moon, 
  X,
  Sliders
} from 'lucide-react';
import { Macro, MacroAction, DiscoveredDevice } from '../types';
import { executeMacro } from '../services/macroEngine';
import { playTactileSound, triggerHaptic } from '../services/hapticsAndAudio';

interface MacroAutomationViewProps {
  macros: Macro[];
  onSaveMacros: (macros: Macro[]) => void;
  devices: DiscoveredDevice[];
  activeDevice: DiscoveredDevice | null;
  soundEnabled: boolean;
}

export const MacroAutomationView: React.FC<MacroAutomationViewProps> = ({
  macros,
  onSaveMacros,
  devices,
  activeDevice,
  soundEnabled,
}) => {
  const [runningMacroId, setRunningMacroId] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [isCreatingModal, setIsCreatingModal] = useState(false);

  // New Macro Form State
  const [newMacroName, setNewMacroName] = useState('');
  const [newMacroDesc, setNewMacroDesc] = useState('');
  const [newMacroSteps, setNewMacroSteps] = useState<MacroAction[]>([
    {
      id: 'step-1',
      type: 'power_toggle',
      payload: { key: 'POWER_ON' },
      delayAfterMs: 600,
    },
    {
      id: 'step-2',
      type: 'input_switch',
      payload: { input: 'HDMI 1 (eARC)' },
      delayAfterMs: 500,
    },
  ]);

  const handleRunMacro = async (macro: Macro) => {
    if (runningMacroId) return;
    setRunningMacroId(macro.id);
    setCurrentStepIndex(0);

    await executeMacro(
      macro,
      devices,
      activeDevice,
      (idx) => {
        setCurrentStepIndex(idx);
      },
      () => {
        setRunningMacroId(null);
        setCurrentStepIndex(-1);
      },
      soundEnabled
    );
  };

  const handleAddStepToNewMacro = (type: MacroAction['type']) => {
    const newStep: MacroAction = {
      id: `step-${Date.now()}`,
      type,
      payload: 
        type === 'power_toggle' ? { key: 'POWER_ON' } :
        type === 'volume_set' ? { volume: 22 } :
        type === 'input_switch' ? { input: 'HDMI 1' } :
        type === 'app_launch' ? { appId: 'Netflix' } :
        type === 'iot_light' ? { brightness: 50, color: '#06b6d4' } :
        type === 'delay' ? { delayMs: 1000 } : {},
      delayAfterMs: 500,
    };
    setNewMacroSteps([...newMacroSteps, newStep]);
    playTactileSound('tap', soundEnabled);
  };

  const handleSaveNewMacro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMacroName.trim()) return;

    const createdMacro: Macro = {
      id: `custom-macro-${Date.now()}`,
      name: newMacroName.trim(),
      description: newMacroDesc.trim() || 'Custom IoT cross-device sequence',
      iconName: 'Workflow',
      steps: newMacroSteps,
      isPreset: false,
    };

    const updated = [createdMacro, ...macros];
    onSaveMacros(updated);
    setIsCreatingModal(false);
    setNewMacroName('');
    setNewMacroDesc('');
    playTactileSound('macro_success', soundEnabled);
    triggerHaptic(25, soundEnabled);
  };

  const handleDeleteMacro = (id: string) => {
    const filtered = macros.filter((m) => m.id !== id);
    onSaveMacros(filtered);
    playTactileSound('click', soundEnabled);
  };

  const getStepIcon = (type: MacroAction['type']) => {
    switch (type) {
      case 'power_toggle':
        return <Tv className="w-3.5 h-3.5 text-cyan-400" />;
      case 'input_switch':
        return <Layers className="w-3.5 h-3.5 text-blue-400" />;
      case 'volume_set':
        return <Volume2 className="w-3.5 h-3.5 text-amber-400" />;
      case 'app_launch':
        return <Film className="w-3.5 h-3.5 text-rose-400" />;
      case 'iot_light':
        return <Sun className="w-3.5 h-3.5 text-yellow-400" />;
      case 'gamepad_combo':
        return <Gamepad2 className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getStepDescription = (step: MacroAction) => {
    switch (step.type) {
      case 'power_toggle':
        return `Power ${step.payload.key?.replace('POWER_', '') || 'Toggle'}`;
      case 'input_switch':
        return `Switch Input: ${step.payload.input || 'HDMI'}`;
      case 'volume_set':
        return `Set Volume to ${step.payload.volume}`;
      case 'app_launch':
        return `Launch ${step.payload.appId}`;
      case 'iot_light':
        return `IoT Lights: ${step.payload.brightness}% Brightness`;
      case 'gamepad_combo':
        return `Gamepad Combo: ${step.payload.combo?.join(' + ') || 'Turbo'}`;
      case 'delay':
        return `Wait ${step.payload.delayMs || step.delayAfterMs}ms`;
      default:
        return 'Device Command';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-2 px-2 sm:px-4 flex flex-col items-center select-none">
      
      {/* Header Bar */}
      <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-3 mb-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
            <Workflow className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100 flex items-center gap-2">
              Cross-Platform Macro Automation Engine
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                {macros.length} Loaded
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              Chained sequences for Smart TVs, IoT lighting, soundbars, and gamepads
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsCreatingModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors shadow-md shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Macro</span>
        </button>
      </div>

      {/* Macros Grid */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {macros.map((macro) => {
          const isRunning = runningMacroId === macro.id;

          return (
            <div
              key={macro.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                isRunning
                  ? 'bg-cyan-950/40 border-cyan-400 shadow-xl shadow-cyan-950/60 ring-1 ring-cyan-400'
                  : 'bg-[#0d1424] border-slate-800/90 hover:border-slate-700'
              }`}
            >
              {/* Macro Info */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-700/80 text-cyan-400">
                      {macro.iconName === 'Film' ? <Film className="w-4 h-4" /> :
                       macro.iconName === 'Gamepad2' ? <Gamepad2 className="w-4 h-4" /> :
                       macro.iconName === 'Moon' ? <Moon className="w-4 h-4" /> :
                       macro.iconName === 'PowerOff' ? <PowerOff className="w-4 h-4" /> :
                       <Workflow className="w-4 h-4" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-100">{macro.name}</h3>
                      {macro.isPreset && (
                        <span className="text-[9px] uppercase font-mono px-1 rounded bg-slate-800 text-slate-400">
                          Preset
                        </span>
                      )}
                    </div>
                  </div>

                  {!macro.isPreset && (
                    <button
                      onClick={() => handleDeleteMacro(macro.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                      title="Delete Macro"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {macro.description}
                </p>

                {/* Steps Timeline Visualizer */}
                <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                  <div className="text-[10px] uppercase font-bold text-slate-500 font-mono flex items-center justify-between">
                    <span>{macro.steps.length} Sequence Steps</span>
                    {isRunning && (
                      <span className="text-cyan-400 animate-pulse font-semibold">
                        Executing Step {currentStepIndex + 1}/{macro.steps.length}...
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {macro.steps.map((s, idx) => {
                      const isStepActive = isRunning && currentStepIndex === idx;
                      const isStepDone = isRunning && currentStepIndex > idx;

                      return (
                        <div
                          key={s.id}
                          className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono border transition-all ${
                            isStepActive
                              ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 animate-bounce'
                              : isStepDone
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50'
                              : 'bg-slate-900 border-slate-800 text-slate-300'
                          }`}
                        >
                          {getStepIcon(s.type)}
                          <span className="truncate max-w-[120px]">{getStepDescription(s)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Runner Button */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">
                  Est. Duration: {macro.steps.reduce((acc, cur) => acc + cur.delayAfterMs, 0)}ms
                </span>

                <button
                  onClick={() => handleRunMacro(macro)}
                  disabled={isRunning}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    isRunning
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 cursor-wait'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 active:scale-95'
                  }`}
                >
                  <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : 'fill-slate-950'}`} />
                  <span>{isRunning ? 'Running Sequence...' : 'Execute Macro'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create New Macro Modal */}
      {isCreatingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0b111e] border border-cyan-500/40 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            
            <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Workflow className="w-4 h-4 text-cyan-400" />
                <span>Create Cross-Device Macro Sequence</span>
              </h2>
              <button
                onClick={() => setIsCreatingModal(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewMacro} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Macro Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Living Room Movie Mode"
                  value={newMacroName}
                  onChange={(e) => setNewMacroName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Turn TV on, set input HDMI 1, and dim lights to 20%"
                  value={newMacroDesc}
                  onChange={(e) => setNewMacroDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Steps Builder */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase font-mono">
                    Sequence Actions ({newMacroSteps.length})
                  </label>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400">Add Action:</span>
                    <button
                      type="button"
                      onClick={() => handleAddStepToNewMacro('power_toggle')}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-cyan-300"
                    >
                      + Power
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddStepToNewMacro('input_switch')}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-cyan-300"
                    >
                      + Input
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddStepToNewMacro('iot_light')}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-cyan-300"
                    >
                      + Light
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddStepToNewMacro('volume_set')}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-cyan-300"
                    >
                      + Vol
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {newMacroSteps.map((step, idx) => (
                    <div
                      key={step.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-500 font-bold">{idx + 1}.</span>
                        {getStepIcon(step.type)}
                        <span className="font-medium text-slate-200">{getStepDescription(step)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 font-mono">
                          +{step.delayAfterMs}ms delay
                        </span>
                        <button
                          type="button"
                          onClick={() => setNewMacroSteps(newMacroSteps.filter((s) => s.id !== step.id))}
                          className="text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreatingModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold transition-colors shadow-md shadow-cyan-400/20"
                >
                  Save Macro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
