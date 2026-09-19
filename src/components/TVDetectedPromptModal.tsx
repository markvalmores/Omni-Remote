import React, { useState, useEffect } from 'react';
import { 
  Tv, 
  Wifi, 
  Check, 
  X, 
  ShieldCheck, 
  Radio, 
  Sparkles, 
  AlertCircle,
  Monitor,
  KeyRound,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { DiscoveredDevice, ClientDeviceSpecs } from '../types';
import { playTactileSound, triggerHaptic } from '../services/hapticsAndAudio';

interface TVDetectedPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  detectedTV: DiscoveredDevice | null;
  onConnectAccepted: (device: DiscoveredDevice) => void;
  soundEnabled: boolean;
  clientSpecs: ClientDeviceSpecs | null;
}

export const TVDetectedPromptModal: React.FC<TVDetectedPromptModalProps> = ({
  isOpen,
  onClose,
  detectedTV,
  onConnectAccepted,
  soundEnabled,
  clientSpecs,
}) => {
  // Phase 1: 'user_prompt' ("Would you like to connect? Yes / No")
  // Phase 2: 'tv_prompt' ("TV prompts to connect as well on TV screen")
  // Phase 3: 'connected_success' | 'tv_denied'
  const [promptPhase, setPromptPhase] = useState<'user_prompt' | 'tv_prompt' | 'connected_success' | 'tv_denied'>('user_prompt');
  const [autoAcceptCountdown, setAutoAcceptCountdown] = useState<number>(10);
  const [isAutoAccepting, setIsAutoAccepting] = useState<boolean>(true);
  const [pairingPin, setPairingPin] = useState<string>('7492');

  // Reset states when a new TV is detected and modal opens
  useEffect(() => {
    if (isOpen && detectedTV) {
      setPromptPhase('user_prompt');
      setAutoAcceptCountdown(10);
      setIsAutoAccepting(true);
      // Generate realistic 4-digit PIN for TV pairing
      const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
      setPairingPin(randomPin);
      playTactileSound('tv_request', soundEnabled);
      triggerHaptic(20, soundEnabled);
    }
  }, [isOpen, detectedTV]);

  // Handle countdown on the TV screen prompt
  useEffect(() => {
    let timer: any;
    if (promptPhase === 'tv_prompt' && isAutoAccepting && autoAcceptCountdown > 0) {
      timer = setInterval(() => {
        setAutoAcceptCountdown((prev) => {
          if (prev <= 1) {
            handleTVApprove();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [promptPhase, isAutoAccepting, autoAcceptCountdown]);

  if (!isOpen || !detectedTV) return null;

  // Remote User answers "YES" to connect
  const handleUserConfirmYes = () => {
    playTactileSound('click', soundEnabled);
    triggerHaptic(15, soundEnabled);
    // Transition to Phase 2: TV prompts to connect as well!
    setPromptPhase('tv_prompt');
    playTactileSound('tv_request', soundEnabled);
  };

  // Remote User answers "NO" to connect
  const handleUserDeclineNo = () => {
    playTactileSound('click', soundEnabled);
    triggerHaptic(10, soundEnabled);
    onClose();
  };

  // TV Screen prompt: user or TV viewer presses "Allow"
  const handleTVApprove = () => {
    playTactileSound('tv_chime', soundEnabled);
    triggerHaptic(30, soundEnabled);
    setPromptPhase('connected_success');

    setTimeout(() => {
      onConnectAccepted(detectedTV);
      onClose();
    }, 1800);
  };

  // TV Screen prompt: user or TV viewer presses "Deny"
  const handleTVDeny = () => {
    playTactileSound('alert', soundEnabled);
    triggerHaptic(25, soundEnabled);
    setPromptPhase('tv_denied');

    setTimeout(() => {
      onClose();
    }, 2000);
  };

  // Get styling tailored to TV brand
  const getBrandAccent = (brand: string) => {
    switch (brand) {
      case 'samsung':
        return {
          badge: 'bg-blue-600/30 text-blue-300 border-blue-500/50',
          glow: 'shadow-blue-500/20',
          title: 'Samsung Tizen OS 7.0',
          osName: 'SAMSUNG SMART TV',
        };
      case 'lg':
        return {
          badge: 'bg-rose-600/30 text-rose-300 border-rose-500/50',
          glow: 'shadow-rose-500/20',
          title: 'LG webOS 23 Smart Platform',
          osName: 'LG webOS TV',
        };
      case 'sony':
      case 'android_tv':
        return {
          badge: 'bg-amber-600/30 text-amber-300 border-amber-500/50',
          glow: 'shadow-amber-500/20',
          title: 'Sony Bravia Google TV',
          osName: 'SONY BRAVIA',
        };
      case 'roku':
        return {
          badge: 'bg-purple-600/30 text-purple-300 border-purple-500/50',
          glow: 'shadow-purple-500/20',
          title: 'Roku OS 12.5',
          osName: 'ROKU TV',
        };
      case 'apple':
        return {
          badge: 'bg-slate-600/30 text-slate-200 border-slate-400/50',
          glow: 'shadow-slate-400/20',
          title: 'Apple tvOS 17',
          osName: 'Apple TV 4K',
        };
      default:
        return {
          badge: 'bg-cyan-600/30 text-cyan-300 border-cyan-500/50',
          glow: 'shadow-cyan-500/20',
          title: 'Smart TV Display',
          osName: 'SMART TV',
        };
    }
  };

  const brandInfo = getBrandAccent(detectedTV.brand);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md transition-all">
      <div className="bg-[#0b111e] border border-cyan-500/50 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl shadow-cyan-950/70 animate-in fade-in zoom-in-95 duration-200">
        
        {/* PHASE 1: Detection Prompt on User's Remote App */}
        {promptPhase === 'user_prompt' && (
          <div>
            {/* Header */}
            <div className="px-5 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative p-2.5 rounded-xl bg-cyan-950 border border-cyan-500/50 text-cyan-400">
                  <Radio className="w-5 h-5 animate-pulse" />
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    Smart TV Detected Nearby
                  </h2>
                  <p className="text-xs text-slate-400">
                    Discovered via local Wi-Fi broadcast / mDNS beacon
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

            {/* Body */}
            <div className="p-5 space-y-4">
              
              {/* Device Card */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/80 flex items-start gap-3.5 shadow-md">
                <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/40 text-cyan-400 shrink-0 mt-0.5">
                  <Tv className="w-6 h-6" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-white">
                      {detectedTV.name}
                    </h3>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${brandInfo.badge}`}>
                      {detectedTV.brand}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">
                    {detectedTV.manufacturer} • {brandInfo.title}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 font-mono pt-1">
                    <span className="flex items-center gap-1">
                      <Wifi className="w-3 h-3 text-cyan-400" />
                      <span>{detectedTV.ipAddress}:{detectedTV.port}</span>
                    </span>
                    <span>•</span>
                    <span>MAC: {detectedTV.macAddress}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-bold">{detectedTV.latencyMs}ms Ping</span>
                  </div>
                </div>
              </div>

              {/* Explicit User Prompt Message */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-slate-900/40 border border-cyan-500/30 text-center space-y-2">
                <div className="inline-flex p-2 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 mb-1">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-sm font-bold text-slate-100">
                  Would you like to connect to this TV?
                </div>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Confirming <strong className="text-cyan-300">Yes</strong> will transmit a secure connection request. The TV screen will display an authorization prompt to approve the pairing.
                </p>
              </div>

              {/* Yes or No Prompt Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleUserDeclineNo}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all"
                >
                  <X className="w-4 h-4 text-slate-400" />
                  <span>No, Ignore</span>
                </button>

                <button
                  onClick={handleUserConfirmYes}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-emerald-500/25 transition-all transform active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>Yes, Connect</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* PHASE 2: TV Prompts to Connect as Well (TV Screen On-Screen Display) */}
        {promptPhase === 'tv_prompt' && (
          <div>
            {/* Header: Simulation Notice */}
            <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Monitor className="w-4 h-4 text-amber-400 animate-pulse" />
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    TV Screen On-Screen Display (OSD)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Connection requested. The TV is prompting to allow or deny this controller.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-amber-300 font-mono bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded">
                <Clock className="w-3 h-3" />
                <span>{autoAcceptCountdown}s</span>
              </div>
            </div>

            {/* TV Screen Display Mockup */}
            <div className="p-4 sm:p-5 bg-black">
              
              {/* Simulated TV Frame */}
              <div className="relative rounded-2xl p-1 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 shadow-2xl border border-slate-600">
                
                {/* TV Screen Bezel & Panel */}
                <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-slate-950 via-[#0a0f1d] to-[#05070e] border border-slate-800 p-4 sm:p-6 text-slate-100 min-h-[260px] flex flex-col justify-between">
                  
                  {/* Subtle TV Brand watermark top right */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono border-b border-slate-800/60 pb-2">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      <span>INCOMING ACCESS REQUEST</span>
                    </span>
                    <span className="font-bold tracking-widest text-slate-400">
                      {brandInfo.osName}
                    </span>
                  </div>

                  {/* Native TV Pairing Dialog Box */}
                  <div className="my-auto py-3 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-300 shrink-0">
                        <Tv className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                          Device Connection Request
                        </h4>
                        <p className="text-xs text-slate-300 mt-0.5">
                          Allow <span className="text-cyan-300 font-semibold">OmniRemote ({clientSpecs?.os || 'Client'})</span> to connect and control this TV?
                        </p>
                      </div>
                    </div>

                    {/* TV Prompt Details & PIN */}
                    <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-700 text-xs font-mono space-y-1 text-slate-300">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-400">Requesting Client:</span>
                        <span className="text-cyan-300">OmniRemote Universal App</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-400">Protocol Handshake:</span>
                        <span className="text-slate-200">{detectedTV.protocol}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] pt-1 border-t border-slate-800">
                        <span className="text-slate-400 flex items-center gap-1">
                          <KeyRound className="w-3 h-3 text-amber-400" />
                          <span>TV Security Code:</span>
                        </span>
                        <span className="text-amber-300 font-bold tracking-widest text-xs">
                          {pairingPin}
                        </span>
                      </div>
                    </div>

                    {/* Interactive TV Remote Buttons */}
                    <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                      <button
                        onClick={handleTVApprove}
                        className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition-all cursor-pointer transform active:scale-95"
                      >
                        <Check className="w-4 h-4" />
                        <span>Allow (TV Screen)</span>
                      </button>

                      <button
                        onClick={handleTVDeny}
                        className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-rose-950 hover:border-rose-600/50 border border-slate-700 text-slate-300 hover:text-rose-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                        <span>Deny (TV Screen)</span>
                      </button>
                    </div>

                    {/* Auto accept toggle */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>Simulated TV viewer action:</span>
                      <button
                        onClick={() => setIsAutoAccepting(!isAutoAccepting)}
                        className="text-cyan-400 hover:underline"
                      >
                        {isAutoAccepting ? `Auto-approving (${autoAcceptCountdown}s)` : 'Paused (Manual Click)'}
                      </button>
                    </div>

                  </div>

                  {/* TV Standby LED Indicator Bar */}
                  <div className="flex items-center justify-center pt-2">
                    <div className="w-8 h-1 rounded-full bg-cyan-400/80 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>
                  </div>

                </div>

                {/* Bottom TV Stand / Bezel Brand label */}
                <div className="text-center py-1 text-[10px] text-slate-400 font-bold tracking-widest uppercase">
                  {detectedTV.manufacturer}
                </div>
              </div>

            </div>

            {/* Footer helper */}
            <div className="px-5 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Two-way mutual device handshake</span>
              </span>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white text-xs underline"
              >
                Cancel Pairing
              </button>
            </div>
          </div>
        )}

        {/* PHASE 3A: Successfully Connected */}
        {promptPhase === 'connected_success' && (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-8 h-8 animate-bounce" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                TV Connection Authorized!
              </h3>
              <p className="text-xs text-slate-300 max-w-sm mx-auto mt-1">
                The TV approved the pairing request. <strong className="text-emerald-400">{detectedTV.name}</strong> is now linked as your active remote target.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300 max-w-xs mx-auto">
              Session established • Latency: {detectedTV.latencyMs}ms
            </div>
          </div>
        )}

        {/* PHASE 3B: TV Denied Connection */}
        {promptPhase === 'tv_denied' && (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-950/80 border border-rose-500/60 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/30">
              <XCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Connection Denied by TV
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                The pairing request was declined on the TV display. You can trigger detection again or pair manually via MAC address.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
