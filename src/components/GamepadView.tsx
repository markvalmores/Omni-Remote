import React, { useState, useEffect, useRef } from 'react';
import { 
  Gamepad2, 
  Zap, 
  Flame, 
  Repeat, 
  Sliders, 
  ShieldCheck, 
  Radio, 
  Compass, 
  Activity 
} from 'lucide-react';
import { playTactileSound, triggerHaptic } from '../services/hapticsAndAudio';

interface GamepadViewProps {
  onSendButton: (buttonName: string, state: 'down' | 'up') => void;
  onSendStick: (stick: 'left' | 'right', x: number, y: number) => void;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  pollingRateHz: number;
}

export const GamepadView: React.FC<GamepadViewProps> = ({
  onSendButton,
  onSendStick,
  soundEnabled,
  hapticEnabled,
  pollingRateHz,
}) => {
  const [buttonGlyphs, setButtonGlyphs] = useState<'xbox' | 'playstation'>('xbox');
  const [turboEnabled, setTurboEnabled] = useState(false);
  const [activePhysicalGamepad, setActivePhysicalGamepad] = useState<string | null>(null);

  // Analog stick positions (-1.0 to 1.0)
  const [leftStick, setLeftStick] = useState({ x: 0, y: 0 });
  const [rightStick, setRightStick] = useState({ x: 0, y: 0 });

  // Trigger depths (0 to 100)
  const [l2Depth, setL2Depth] = useState(0);
  const [r2Depth, setR2Depth] = useState(0);

  // Active buttons for visual feedback
  const [pressedButtons, setPressedButtons] = useState<Record<string, boolean>>({});

  const leftStickRef = useRef<HTMLDivElement>(null);
  const rightStickRef = useRef<HTMLDivElement>(null);
  const isDraggingLeft = useRef(false);
  const isDraggingRight = useRef(false);

  // Gamepad API physical controller polling loop
  useEffect(() => {
    let animFrame: number;
    const pollPhysicalGamepad = () => {
      if (typeof navigator !== 'undefined' && 'getGamepads' in navigator) {
        const gamepads = navigator.getGamepads();
        const pad = gamepads ? Array.from(gamepads).find(p => p !== null) : null;

        if (pad) {
          setActivePhysicalGamepad(pad.id);

          // Map physical buttons to active UI feedback
          const newPressed: Record<string, boolean> = {};
          pad.buttons.forEach((btn, idx) => {
            if (btn.pressed) {
              // Standard mapping
              if (idx === 0) newPressed['A'] = true;
              else if (idx === 1) newPressed['B'] = true;
              else if (idx === 2) newPressed['X'] = true;
              else if (idx === 3) newPressed['Y'] = true;
              else if (idx === 4) newPressed['L1'] = true;
              else if (idx === 5) newPressed['R1'] = true;
              else if (idx === 6) setL2Depth(Math.round(btn.value * 100));
              else if (idx === 7) setR2Depth(Math.round(btn.value * 100));
              else if (idx === 8) newPressed['SELECT'] = true;
              else if (idx === 9) newPressed['START'] = true;
              else if (idx === 10) newPressed['L3'] = true;
              else if (idx === 11) newPressed['R3'] = true;
              else if (idx === 12) newPressed['DPAD_UP'] = true;
              else if (idx === 13) newPressed['DPAD_DOWN'] = true;
              else if (idx === 14) newPressed['DPAD_LEFT'] = true;
              else if (idx === 15) newPressed['DPAD_RIGHT'] = true;
            }
          });
          setPressedButtons(newPressed);

          // Map physical axes
          if (pad.axes.length >= 2) {
            setLeftStick({ x: pad.axes[0], y: pad.axes[1] });
          }
          if (pad.axes.length >= 4) {
            setRightStick({ x: pad.axes[2], y: pad.axes[3] });
          }
        } else {
          setActivePhysicalGamepad(null);
        }
      }
      animFrame = requestAnimationFrame(pollPhysicalGamepad);
    };

    animFrame = requestAnimationFrame(pollPhysicalGamepad);
    return () => cancelAnimationFrame(animFrame);
  }, []);

  // Generic Button Handlers
  const handleButtonDown = (btn: string) => {
    setPressedButtons((p) => ({ ...p, [btn]: true }));
    playTactileSound(btn.startsWith('L') || btn.startsWith('R') ? 'trigger' : 'click', soundEnabled);
    triggerHaptic(14, hapticEnabled);
    onSendButton(btn, 'down');
  };

  const handleButtonUp = (btn: string) => {
    setPressedButtons((p) => ({ ...p, [btn]: false }));
    onSendButton(btn, 'up');
  };

  // Touch Analog Stick Calculation
  const handleTouchStick = (
    e: React.TouchEvent | React.MouseEvent,
    ref: React.RefObject<HTMLDivElement | null>,
    isLeft: boolean
  ) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const maxRadius = rect.width / 2 - 12;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    let normalizedX = dx / maxRadius;
    let normalizedY = dy / maxRadius;

    if (dist > maxRadius) {
      normalizedX = (dx / dist);
      normalizedY = (dy / dist);
    }

    // Clamp between -1 and 1
    normalizedX = Math.max(-1, Math.min(1, normalizedX));
    normalizedY = Math.max(-1, Math.min(1, normalizedY));

    if (isLeft) {
      setLeftStick({ x: normalizedX, y: normalizedY });
      onSendStick('left', normalizedX, normalizedY);
    } else {
      setRightStick({ x: normalizedX, y: normalizedY });
      onSendStick('right', normalizedX, normalizedY);
    }
  };

  const handleStickRelease = (isLeft: boolean) => {
    if (isLeft) {
      isDraggingLeft.current = false;
      setLeftStick({ x: 0, y: 0 });
      onSendStick('left', 0, 0);
    } else {
      isDraggingRight.current = false;
      setRightStick({ x: 0, y: 0 });
      onSendStick('right', 0, 0);
    }
    triggerHaptic(8, hapticEnabled);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-2 px-2 sm:px-4 flex flex-col items-center select-none touch-none">
      
      {/* Gamepad Header & Status Bar */}
      <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-3 mb-3 flex flex-wrap items-center justify-between gap-2 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-400">
            <Gamepad2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100 flex items-center gap-2">
              Virtual &amp; Hardware Dual-Analog Gamepad
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-700/50">
                {pollingRateHz} Hz Low Latency
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              {activePhysicalGamepad ? (
                <span className="text-emerald-400 font-semibold">
                  ✓ Physical: {activePhysicalGamepad.split('(')[0]}
                </span>
              ) : (
                'Touch screen virtual pad active • Connect BT Gamepad anytime'
              )}
            </div>
          </div>
        </div>

        {/* Action Toggles */}
        <div className="flex items-center gap-2">
          {/* Turbo Toggle */}
          <button
            onClick={() => {
              setTurboEnabled(!turboEnabled);
              triggerHaptic(15, hapticEnabled);
              playTactileSound('click', soundEnabled);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              turboEnabled
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>TURBO {turboEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* Button Style Switcher (Xbox vs PS) */}
          <button
            onClick={() => setButtonGlyphs(buttonGlyphs === 'xbox' ? 'playstation' : 'xbox')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold transition-colors"
          >
            {buttonGlyphs === 'xbox' ? 'ABXY (Xbox)' : '△○✕□ (PS)'}
          </button>
        </div>
      </div>

      {/* Main Gamepad Shell */}
      <div className="w-full bg-[#0d1322] border-2 border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl shadow-cyan-950/30 flex flex-col gap-5">
        
        {/* Top Shoulder Bumpers & Analog Triggers */}
        <div className="w-full grid grid-cols-2 gap-4 sm:gap-12">
          
          {/* Left Shoulder (L1 & L2) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 font-mono px-1">
              <span>TRIGGER L2</span>
              <span className="text-cyan-400">{l2Depth}%</span>
            </div>
            <button
              onMouseDown={() => {
                handleButtonDown('L2');
                setL2Depth(100);
              }}
              onMouseUp={() => {
                handleButtonUp('L2');
                setL2Depth(0);
              }}
              onTouchStart={() => {
                handleButtonDown('L2');
                setL2Depth(100);
              }}
              onTouchEnd={() => {
                handleButtonUp('L2');
                setL2Depth(0);
              }}
              className={`w-full py-3 rounded-2xl border-2 font-mono font-extrabold text-xs transition-all relative overflow-hidden ${
                pressedButtons['L2'] || l2Depth > 0
                  ? 'bg-cyan-600 border-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/40'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
              }`}
            >
              <div 
                className="absolute inset-y-0 left-0 bg-cyan-500/30 pointer-events-none transition-all"
                style={{ width: `${l2Depth}%` }}
              />
              <span className="relative z-10">L2 / LT TRIGGER</span>
            </button>

            <button
              onMouseDown={() => handleButtonDown('L1')}
              onMouseUp={() => handleButtonUp('L1')}
              onTouchStart={() => handleButtonDown('L1')}
              onTouchEnd={() => handleButtonUp('L1')}
              className={`w-full py-2.5 rounded-xl border font-bold text-xs transition-all ${
                pressedButtons['L1']
                  ? 'bg-cyan-500 border-cyan-400 text-slate-950 shadow-md shadow-cyan-500/30'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              L1 / LB BUMPER
            </button>
          </div>

          {/* Right Shoulder (R1 & R2) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 font-mono px-1">
              <span>TRIGGER R2</span>
              <span className="text-cyan-400">{r2Depth}%</span>
            </div>
            <button
              onMouseDown={() => {
                handleButtonDown('R2');
                setR2Depth(100);
              }}
              onMouseUp={() => {
                handleButtonUp('R2');
                setR2Depth(0);
              }}
              onTouchStart={() => {
                handleButtonDown('R2');
                setR2Depth(100);
              }}
              onTouchEnd={() => {
                handleButtonUp('R2');
                setR2Depth(0);
              }}
              className={`w-full py-3 rounded-2xl border-2 font-mono font-extrabold text-xs transition-all relative overflow-hidden ${
                pressedButtons['R2'] || r2Depth > 0
                  ? 'bg-cyan-600 border-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/40'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
              }`}
            >
              <div 
                className="absolute inset-y-0 right-0 bg-cyan-500/30 pointer-events-none transition-all"
                style={{ width: `${r2Depth}%` }}
              />
              <span className="relative z-10">R2 / RT TRIGGER</span>
            </button>

            <button
              onMouseDown={() => handleButtonDown('R1')}
              onMouseUp={() => handleButtonUp('R1')}
              onTouchStart={() => handleButtonDown('R1')}
              onTouchEnd={() => handleButtonUp('R1')}
              className={`w-full py-2.5 rounded-xl border font-bold text-xs transition-all ${
                pressedButtons['R1']
                  ? 'bg-cyan-500 border-cyan-400 text-slate-950 shadow-md shadow-cyan-500/30'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              R1 / RB BUMPER
            </button>
          </div>

        </div>

        {/* Center Guide / Share / Options Controls */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 py-1">
          <button
            onMouseDown={() => handleButtonDown('SELECT')}
            onMouseUp={() => handleButtonUp('SELECT')}
            onTouchStart={() => handleButtonDown('SELECT')}
            onTouchEnd={() => handleButtonUp('SELECT')}
            className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold font-mono transition-all ${
              pressedButtons['SELECT']
                ? 'bg-cyan-500 border-cyan-400 text-slate-950'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            VIEW / SHARE
          </button>

          <button
            onMouseDown={() => handleButtonDown('HOME')}
            onMouseUp={() => handleButtonUp('HOME')}
            onTouchStart={() => handleButtonDown('HOME')}
            onTouchEnd={() => handleButtonUp('HOME')}
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 border border-cyan-400/60 shadow-lg shadow-cyan-500/30 text-white font-extrabold text-xs flex items-center justify-center active:scale-90 transition-transform"
            title="Home Guide"
          >
            <Radio className="w-5 h-5" />
          </button>

          <button
            onMouseDown={() => handleButtonDown('START')}
            onMouseUp={() => handleButtonUp('START')}
            onTouchStart={() => handleButtonDown('START')}
            onTouchEnd={() => handleButtonUp('START')}
            className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold font-mono transition-all ${
              pressedButtons['START']
                ? 'bg-cyan-500 border-cyan-400 text-slate-950'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            MENU / START
          </button>
        </div>

        {/* Bottom Core: D-Pad, Dual Analog Sticks & ABXY Face Buttons */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          {/* Left Wing: Tactile D-PAD & L3 */}
          <div className="flex flex-col items-center gap-3">
            <div className="text-[11px] font-bold text-slate-400 uppercase font-mono tracking-wider">
              Directional Pad
            </div>
            
            {/* Cross D-PAD */}
            <div className="relative w-36 h-36 bg-slate-950 rounded-2xl border border-slate-800 p-2 shadow-inner flex items-center justify-center">
              {/* UP */}
              <button
                onMouseDown={() => handleButtonDown('DPAD_UP')}
                onMouseUp={() => handleButtonUp('DPAD_UP')}
                onTouchStart={() => handleButtonDown('DPAD_UP')}
                onTouchEnd={() => handleButtonUp('DPAD_UP')}
                className={`absolute top-2 w-10 h-11 rounded-t-lg flex items-center justify-center font-bold text-xs transition-colors ${
                  pressedButtons['DPAD_UP'] ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                ▲
              </button>

              {/* DOWN */}
              <button
                onMouseDown={() => handleButtonDown('DPAD_DOWN')}
                onMouseUp={() => handleButtonUp('DPAD_DOWN')}
                onTouchStart={() => handleButtonDown('DPAD_DOWN')}
                onTouchEnd={() => handleButtonUp('DPAD_DOWN')}
                className={`absolute bottom-2 w-10 h-11 rounded-b-lg flex items-center justify-center font-bold text-xs transition-colors ${
                  pressedButtons['DPAD_DOWN'] ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                ▼
              </button>

              {/* LEFT */}
              <button
                onMouseDown={() => handleButtonDown('DPAD_LEFT')}
                onMouseUp={() => handleButtonUp('DPAD_LEFT')}
                onTouchStart={() => handleButtonDown('DPAD_LEFT')}
                onTouchEnd={() => handleButtonUp('DPAD_LEFT')}
                className={`absolute left-2 w-11 h-10 rounded-l-lg flex items-center justify-center font-bold text-xs transition-colors ${
                  pressedButtons['DPAD_LEFT'] ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                ◀
              </button>

              {/* RIGHT */}
              <button
                onMouseDown={() => handleButtonDown('DPAD_RIGHT')}
                onMouseUp={() => handleButtonUp('DPAD_RIGHT')}
                onTouchStart={() => handleButtonDown('DPAD_RIGHT')}
                onTouchEnd={() => handleButtonUp('DPAD_RIGHT')}
                className={`absolute right-2 w-11 h-10 rounded-r-lg flex items-center justify-center font-bold text-xs transition-colors ${
                  pressedButtons['DPAD_RIGHT'] ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                ▶
              </button>

              {/* Center D-Pad Hub */}
              <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700"></div>
            </div>

            {/* Left Stick Click (L3) */}
            <button
              onMouseDown={() => handleButtonDown('L3')}
              onMouseUp={() => handleButtonUp('L3')}
              onTouchStart={() => handleButtonDown('L3')}
              onTouchEnd={() => handleButtonUp('L3')}
              className={`px-4 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all ${
                pressedButtons['L3'] ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              L3 (CLICK)
            </button>
          </div>

          {/* Center Column: Dual 360° Analog Thumbsticks */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            
            {/* Left Analog Stick */}
            <div className="flex flex-col items-center gap-2">
              <div className="text-[11px] font-bold text-slate-400 font-mono">
                L-Stick ({leftStick.x.toFixed(2)}, {leftStick.y.toFixed(2)})
              </div>
              <div
                ref={leftStickRef}
                onMouseDown={(e) => {
                  isDraggingLeft.current = true;
                  handleTouchStick(e, leftStickRef, true);
                }}
                onMouseMove={(e) => {
                  if (isDraggingLeft.current) handleTouchStick(e, leftStickRef, true);
                }}
                onMouseUp={() => handleStickRelease(true)}
                onMouseLeave={() => {
                  if (isDraggingLeft.current) handleStickRelease(true);
                }}
                onTouchStart={(e) => {
                  isDraggingLeft.current = true;
                  handleTouchStick(e, leftStickRef, true);
                }}
                onTouchMove={(e) => {
                  if (isDraggingLeft.current) handleTouchStick(e, leftStickRef, true);
                }}
                onTouchEnd={() => handleStickRelease(true)}
                className="relative w-32 h-32 rounded-full bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-slate-700 shadow-inner flex items-center justify-center cursor-grab active:cursor-grabbing"
              >
                {/* Visual Guides */}
                <div className="absolute inset-4 rounded-full border border-dashed border-slate-800 pointer-events-none"></div>
                <div className="absolute w-full h-px bg-slate-800 pointer-events-none"></div>
                <div className="absolute h-full w-px bg-slate-800 pointer-events-none"></div>
                
                {/* Movable Thumb Knob */}
                <div
                  className="w-14 h-14 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 border-2 border-cyan-500/60 shadow-lg shadow-cyan-950/80 flex items-center justify-center pointer-events-none transition-transform duration-75"
                  style={{
                    transform: `translate(${leftStick.x * 38}px, ${leftStick.y * 38}px)`,
                  }}
                >
                  <div className="w-4 h-4 rounded-full bg-cyan-400/80"></div>
                </div>
              </div>
            </div>

            {/* Right Analog Stick */}
            <div className="flex flex-col items-center gap-2">
              <div className="text-[11px] font-bold text-slate-400 font-mono">
                R-Stick ({rightStick.x.toFixed(2)}, {rightStick.y.toFixed(2)})
              </div>
              <div
                ref={rightStickRef}
                onMouseDown={(e) => {
                  isDraggingRight.current = true;
                  handleTouchStick(e, rightStickRef, false);
                }}
                onMouseMove={(e) => {
                  if (isDraggingRight.current) handleTouchStick(e, rightStickRef, false);
                }}
                onMouseUp={() => handleStickRelease(false)}
                onMouseLeave={() => {
                  if (isDraggingRight.current) handleStickRelease(false);
                }}
                onTouchStart={(e) => {
                  isDraggingRight.current = true;
                  handleTouchStick(e, rightStickRef, false);
                }}
                onTouchMove={(e) => {
                  if (isDraggingRight.current) handleTouchStick(e, rightStickRef, false);
                }}
                onTouchEnd={() => handleStickRelease(false)}
                className="relative w-32 h-32 rounded-full bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-slate-700 shadow-inner flex items-center justify-center cursor-grab active:cursor-grabbing"
              >
                {/* Visual Guides */}
                <div className="absolute inset-4 rounded-full border border-dashed border-slate-800 pointer-events-none"></div>
                <div className="absolute w-full h-px bg-slate-800 pointer-events-none"></div>
                <div className="absolute h-full w-px bg-slate-800 pointer-events-none"></div>
                
                {/* Movable Thumb Knob */}
                <div
                  className="w-14 h-14 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 border-2 border-purple-500/60 shadow-lg shadow-purple-950/80 flex items-center justify-center pointer-events-none transition-transform duration-75"
                  style={{
                    transform: `translate(${rightStick.x * 38}px, ${rightStick.y * 38}px)`,
                  }}
                >
                  <div className="w-4 h-4 rounded-full bg-purple-400/80"></div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Wing: Action Face Buttons & R3 */}
          <div className="flex flex-col items-center gap-3">
            <div className="text-[11px] font-bold text-slate-400 uppercase font-mono tracking-wider">
              Action Face Buttons
            </div>

            {/* ABXY Diamond Cluster */}
            <div className="relative w-36 h-36 bg-slate-950 rounded-2xl border border-slate-800 p-2 shadow-inner flex items-center justify-center">
              {/* Y Button (North) */}
              <button
                onMouseDown={() => handleButtonDown('Y')}
                onMouseUp={() => handleButtonUp('Y')}
                onTouchStart={() => handleButtonDown('Y')}
                onTouchEnd={() => handleButtonUp('Y')}
                className={`absolute top-2 w-11 h-11 rounded-full border-2 font-extrabold text-sm flex items-center justify-center active:scale-90 transition-all ${
                  pressedButtons['Y']
                    ? 'bg-amber-400 border-amber-300 text-slate-950 shadow-lg shadow-amber-400/50'
                    : 'bg-slate-900 border-amber-500/50 text-amber-400 hover:bg-slate-800'
                }`}
              >
                {buttonGlyphs === 'xbox' ? 'Y' : '△'}
              </button>

              {/* A Button (South) */}
              <button
                onMouseDown={() => handleButtonDown('A')}
                onMouseUp={() => handleButtonUp('A')}
                onTouchStart={() => handleButtonDown('A')}
                onTouchEnd={() => handleButtonUp('A')}
                className={`absolute bottom-2 w-11 h-11 rounded-full border-2 font-extrabold text-sm flex items-center justify-center active:scale-90 transition-all ${
                  pressedButtons['A']
                    ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/50'
                    : 'bg-slate-900 border-emerald-500/50 text-emerald-400 hover:bg-slate-800'
                }`}
              >
                {buttonGlyphs === 'xbox' ? 'A' : '✕'}
              </button>

              {/* X Button (West) */}
              <button
                onMouseDown={() => handleButtonDown('X')}
                onMouseUp={() => handleButtonUp('X')}
                onTouchStart={() => handleButtonDown('X')}
                onTouchEnd={() => handleButtonUp('X')}
                className={`absolute left-2 w-11 h-11 rounded-full border-2 font-extrabold text-sm flex items-center justify-center active:scale-90 transition-all ${
                  pressedButtons['X']
                    ? 'bg-blue-500 border-blue-400 text-slate-950 shadow-lg shadow-blue-500/50'
                    : 'bg-slate-900 border-blue-500/50 text-blue-400 hover:bg-slate-800'
                }`}
              >
                {buttonGlyphs === 'xbox' ? 'X' : '□'}
              </button>

              {/* B Button (East) */}
              <button
                onMouseDown={() => handleButtonDown('B')}
                onMouseUp={() => handleButtonUp('B')}
                onTouchStart={() => handleButtonDown('B')}
                onTouchEnd={() => handleButtonUp('B')}
                className={`absolute right-2 w-11 h-11 rounded-full border-2 font-extrabold text-sm flex items-center justify-center active:scale-90 transition-all ${
                  pressedButtons['B']
                    ? 'bg-red-500 border-red-400 text-slate-950 shadow-lg shadow-red-500/50'
                    : 'bg-slate-900 border-red-500/50 text-red-400 hover:bg-slate-800'
                }`}
              >
                {buttonGlyphs === 'xbox' ? 'B' : '○'}
              </button>
            </div>

            {/* Right Stick Click (R3) */}
            <button
              onMouseDown={() => handleButtonDown('R3')}
              onMouseUp={() => handleButtonUp('R3')}
              onTouchStart={() => handleButtonDown('R3')}
              onTouchEnd={() => handleButtonUp('R3')}
              className={`px-4 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all ${
                pressedButtons['R3'] ? 'bg-purple-500 text-slate-950' : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              R3 (CLICK)
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
