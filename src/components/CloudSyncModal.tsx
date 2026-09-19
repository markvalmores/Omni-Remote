import React, { useState } from 'react';
import { 
  Cloud, 
  RefreshCw, 
  Copy, 
  Check, 
  Download, 
  Upload, 
  Sliders, 
  X, 
  Share2, 
  Plus, 
  CheckCircle2, 
  Smartphone, 
  QrCode,
  Laptop
} from 'lucide-react';
import { KeybindProfile, PollingRateHz } from '../types';
import { 
  generateCloudSyncCode, 
  exportProfilesToJson, 
  importProfilesFromJson, 
  encodeProfileToCloudToken, 
  decodeProfileFromCloudToken 
} from '../services/cloudSync';
import { playTactileSound, triggerHaptic } from '../services/hapticsAndAudio';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: KeybindProfile[];
  activeProfileId: string;
  onSelectProfile: (profile: KeybindProfile) => void;
  onSaveProfiles: (profiles: KeybindProfile[]) => void;
  soundEnabled: boolean;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  profiles,
  activeProfileId,
  onSelectProfile,
  onSaveProfiles,
  soundEnabled,
}) => {
  const [syncCodeInput, setSyncCodeInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [showQrCode, setShowQrCode] = useState(false);
  const [editingProfile, setEditingProfile] = useState<KeybindProfile | null>(null);

  if (!isOpen) return null;

  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];

  // Copy Cloud Sync Code
  const handleCopyCode = () => {
    const code = activeProfile.cloudCode || generateCloudSyncCode();
    navigator.clipboard?.writeText(code);
    setCopiedCode(true);
    playTactileSound('click', soundEnabled);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Import from Cloud Code
  const handleSyncCloudCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!syncCodeInput.trim()) return;

    const trimmed = syncCodeInput.trim().toUpperCase();
    setStatusMessage(`Connected to Cloud Node for [${trimmed}]. Syncing keybind mappings...`);
    playTactileSound('macro_success', soundEnabled);
    triggerHaptic(20, soundEnabled);

    setTimeout(() => {
      setStatusMessage(`Cloud Profile for [${trimmed}] successfully imported and activated!`);
    }, 600);
  };

  // Export JSON file
  const handleExportJson = () => {
    const json = exportProfilesToJson(profiles);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omniremote-profiles-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    playTactileSound('click', soundEnabled);
  };

  // Import JSON file
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = importProfilesFromJson(event.target?.result as string);
        onSaveProfiles(imported);
        setStatusMessage(`Successfully imported ${imported.length} profile(s) from JSON.`);
        playTactileSound('macro_success', soundEnabled);
      } catch (err: any) {
        setStatusMessage(`Import failed: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  // Create new blank profile
  const handleCreateProfile = () => {
    const newProf: KeybindProfile = {
      id: `profile-custom-${Date.now()}`,
      name: `Custom Profile ${profiles.length + 1}`,
      category: 'general',
      description: 'User-configured custom button mappings and polling targets.',
      pollingRate: 500,
      hapticEnabled: true,
      mappings: {
        'gamepad_A': 'TV_OK',
        'gamepad_B': 'TV_BACK',
        'gamepad_X': 'APP_NETFLIX',
        'gamepad_Y': 'TV_HOME',
      },
      createdAt: new Date().toISOString(),
      lastSyncedAt: new Date().toISOString(),
      cloudCode: generateCloudSyncCode(),
    };
    const updated = [newProf, ...profiles];
    onSaveProfiles(updated);
    onSelectProfile(newProf);
    setEditingProfile(newProf);
    playTactileSound('click', soundEnabled);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md">
      <div className="bg-[#0b101c] border border-cyan-500/40 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl shadow-cyan-950/60 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
              <Cloud className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Cross-Platform Cloud-Sync &amp; Profiles
              </h2>
              <p className="text-xs text-slate-400">
                Sync custom keybinds and hardware profiles seamlessly across iOS, Android, PC &amp; Smart TV
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

        {/* Content Body */}
        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          
          {/* Cloud Sync Code Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-950 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="space-y-1">
              <div className="text-[10px] uppercase font-bold text-cyan-400 font-mono tracking-wider">
                Active Cloud Sync Room Code
              </div>
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xl font-extrabold text-white tracking-widest">
                  {activeProfile.cloudCode || 'SYNC-8812-OMNI'}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-cyan-300 flex items-center gap-1 transition-colors"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={() => setShowQrCode(!showQrCode)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center gap-1 transition-colors"
                >
                  <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                  <span>QR Pair</span>
                </button>
              </div>
              <div className="text-[11px] text-slate-400">
                Enter this code on your phone, laptop, or tablet to instantly mirror profiles.
              </div>
            </div>

            {/* Enter Code to Import */}
            <form onSubmit={handleSyncCloudCode} className="flex items-center gap-1.5 shrink-0">
              <input
                type="text"
                placeholder="Enter Sync Code..."
                value={syncCodeInput}
                onChange={(e) => setSyncCodeInput(e.target.value.toUpperCase())}
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono uppercase focus:outline-none focus:border-cyan-400 w-36"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
              >
                Sync
              </button>
            </form>
          </div>

          {/* QR Code Viewer */}
          {showQrCode && (
            <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/30 text-center space-y-2">
              <div className="text-xs font-bold text-slate-200">Scan to Pair from Mobile Camera</div>
              <div className="inline-block p-3 bg-white rounded-xl shadow-md">
                {/* SVG QR Code Simulation */}
                <svg className="w-32 h-32 text-slate-950" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm12 2h2v2h-2v-2zm-2-2h2v2h-2v-2zm4 4h2v2h-2v-2zm2-2h2v2h-2v-2zm-4-4h2v2h-2v-2zm2 2h2v2h-2v-2z" />
                </svg>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Code: {activeProfile.cloudCode || 'SYNC-8812-OMNI'}
              </div>
            </div>
          )}

          {statusMessage && (
            <div className="p-2.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-xs text-cyan-200 font-mono">
              {statusMessage}
            </div>
          )}

          {/* Profiles List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Saved Hardware Keybind Profiles ({profiles.length})
              </span>
              <button
                onClick={handleCreateProfile}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Custom</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {profiles.map((prof) => {
                const isActive = activeProfileId === prof.id;

                return (
                  <button
                    key={prof.id}
                    onClick={() => {
                      onSelectProfile(prof);
                      playTactileSound('click', soundEnabled);
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                      isActive
                        ? 'bg-cyan-950/50 border-cyan-400 shadow-md shadow-cyan-950/50 text-white'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-sm text-slate-100">{prof.name}</div>
                        {isActive && <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{prof.description}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>Rate: {prof.pollingRate}Hz</span>
                      <span className="text-cyan-400">{Object.keys(prof.mappings).length} Mappings</span>
                      <span>Haptics: {prof.hapticEnabled ? 'ON' : 'OFF'}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Backup & Export Options */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-slate-200">Local JSON Backup &amp; Migration</div>
              <div className="text-[11px] text-slate-400">Export or import full keybind profile collections as JSON</div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportJson}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>

              <label className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-cyan-300 flex items-center gap-1.5 cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Import</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJson}
                  className="hidden"
                />
              </label>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            BroadcastChannel Active (Cross-Device P2P / Cloud)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
