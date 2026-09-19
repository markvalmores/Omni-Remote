import React, { useState, useRef, useEffect } from 'react';
import { 
  MousePointer, 
  Sliders, 
  Move, 
  Lock, 
  Unlock, 
  ArrowUp, 
  ArrowDown, 
  Zap 
} from 'lucide-react';
import { playTactileSound, triggerHaptic } from '../services/hapticsAndAudio';

interface TrackpadViewProps {
  onSendPointerMove: (dx: number, dy: number) => void;
  onSendClick: (button: 'left' | 'right' | 'middle', type: 'click' | 'down' | 'up') => void;
  onSendScroll: (deltaY: number) => void;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  pollingRateHz: number;
}

export const TrackpadView: React.FC<TrackpadViewProps> = ({
  onSendPointerMove,
  onSendClick,
  onSendScroll,
  soundEnabled,
  hapticEnabled,
  pollingRateHz,
}) => {
  const [sensitivity, setSensitivity] = useState(3.5);
  const [tapToClick, setTapToClick] = useState(true);
  const [dragLock, setDragLock] = useState(false);
  const [isLeftDown, setIsLeftDown] = useState(false);

  // Virtual cursor position for on-screen preview (0 to 100 percentage)
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 });
  const [isPointerActive, setIsPointerActive] = useState(false);

  const padRef = useRef<HTMLDivElement>(null);
  const lastTouchRef = useRef<{ x: number; y: number } | null>(null);
  const touchStartRef = useRef<{ time: number; x: number; y: number } | null>(null);

  const handlePointerDown = (clientX: number, clientY: number) => {
    lastTouchRef.current = { x: clientX, y: clientY };
    touchStartRef.current = { time: Date.now(), x: clientX, y: clientY };
    setIsPointerActive(true);
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!lastTouchRef.current) return;
    const dx = (clientX - lastTouchRef.current.x) * sensitivity;
    const dy = (clientY - lastTouchRef.current.y) * sensitivity;

    lastTouchRef.current = { x: clientX, y: clientY };

    // Update virtual cursor visualization
    setCursorPos((prev) => ({
      x: Math.max(0, Math.min(100, prev.x + (dx / 5))),
      y: Math.max(0, Math.min(100, prev.y + (dy / 5))),
    }));

    onSendPointerMove(dx, dy);
  };

  const handlePointerUp = () => {
    if (touchStartRef.current && tapToClick) {
      const duration = Date.now() - touchStartRef.current.time;
      const moved = Math.hypot(
        (lastTouchRef.current?.x || 0) - touchStartRef.current.x,
        (lastTouchRef.current?.y || 0) - touchStartRef.current.y
      );

      // Quick tap without significant movement => trigger left click
      if (duration < 250 && moved < 8) {
        onSendClick('left', 'click');
        playTactileSound('tap', soundEnabled);
        triggerHaptic(10, hapticEnabled);
      }
    }

    lastTouchRef.current = null;
    touchStartRef.current = null;
    setIsPointerActive(false);
  };

  // Scroll wheel
  const handleScrollStep = (delta: number) => {
    onSendScroll(delta);
    playTactileSound('tap', soundEnabled);
    triggerHaptic(8, hapticEnabled);
  };

  // Mouse Buttons Click Handlers
  const handleMouseButton = (btn: 'left' | 'right' | 'middle') => {
    playTactileSound('click', soundEnabled);
    triggerHaptic(12, hapticEnabled);
    onSendClick(btn, 'click');
  };

  const toggleDragLock = () => {
    const next = !dragLock;
    setDragLock(next);
    setIsLeftDown(next);
    onSendClick('left', next ? 'down' : 'up');
    playTactileSound('trigger', soundEnabled);
    triggerHaptic(20, hapticEnabled);
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-2 px-2 sm:px-4 flex flex-col items-center select-none touch-none">
      
      {/* Control Strip */}
      <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-3 mb-3 flex flex-wrap items-center justify-between gap-2 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
            <MousePointer className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100 flex items-center gap-2">
              High-Precision Laser Trackpad
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/50">
                {pollingRateHz} Hz
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              X: {cursorPos.x.toFixed(1)}% • Y: {cursorPos.y.toFixed(1)}% {isLeftDown && '• DRAG LOCKED'}
            </div>
          </div>
        </div>

        {/* Quick Toggles */}
        <div className="flex items-center gap-2">
          {/* Drag Lock */}
          <button
            onClick={toggleDragLock}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              dragLock
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Lock Left Mouse Down to Drag Windows or Select Text"
          >
            {dragLock ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>Drag Lock</span>
          </button>

          {/* Tap to Click */}
          <button
            onClick={() => setTapToClick(!tapToClick)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
              tapToClick
                ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            Tap: {tapToClick ? 'ON' : 'OFF'}
          </button>

          {/* Sensitivity Slider */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs">
            <Sliders className="w-3 h-3 text-cyan-400" />
            <input
              type="range"
              min="1"
              max="8"
              step="0.5"
              value={sensitivity}
              onChange={(e) => setSensitivity(parseFloat(e.target.value))}
              className="w-16 accent-cyan-400 cursor-pointer"
            />
            <span className="font-mono text-[10px] text-cyan-300">{sensitivity}x</span>
          </div>
        </div>
      </div>

      {/* Main Trackpad Touch Surface */}
      <div className="w-full bg-[#0b101c] border-2 border-slate-800 rounded-3xl p-4 shadow-2xl flex flex-col gap-3">
        
        <div
          ref={padRef}
          onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
          onMouseMove={(e) => {
            if (lastTouchRef.current) handlePointerMove(e.clientX, e.clientY);
          }}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={(e) => {
            const touch = e.touches[0];
            handlePointerDown(touch.clientX, touch.clientY);
          }}
          onTouchMove={(e) => {
            const touch = e.touches[0];
            handlePointerMove(touch.clientX, touch.clientY);
          }}
          onTouchEnd={handlePointerUp}
          className="relative w-full h-80 sm:h-96 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/80 cursor-crosshair overflow-hidden shadow-inner flex items-center justify-center"
        >
          {/* Subtle grid lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

          {/* Virtual Target Cursor Pointer */}
          <div
            className="absolute pointer-events-none transition-all duration-75"
            style={{
              left: `${cursorPos.x}%`,
              top: `${cursorPos.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="relative">
              <div className="w-5 h-5 rounded-full bg-cyan-400/20 border-2 border-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-400/50">
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              </div>
              {isPointerActive && (
                <div className="absolute -inset-1 rounded-full border border-cyan-300 animate-ping"></div>
              )}
            </div>
          </div>

          {/* Center Trackpad Watermark / Guide */}
          <div className="pointer-events-none flex flex-col items-center gap-1.5 text-slate-600/70 select-none">
            <Move className="w-8 h-8 stroke-1" />
            <span className="text-xs font-mono font-semibold uppercase tracking-widest">
              Fluid Glide Surface
            </span>
            <span className="text-[10px] text-slate-600">
              Drag to guide cursor • Tap to click • 2-finger gesture scroll
            </span>
          </div>

          {/* Vertical Scroll Strip on Right Edge */}
          <div className="absolute right-2 top-4 bottom-4 w-10 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col items-center justify-between p-1 z-10">
            <button
              onClick={() => handleScrollStep(-100)}
              className="w-full py-2 rounded-lg bg-slate-800/60 hover:bg-cyan-500 hover:text-slate-950 text-slate-400 text-xs flex items-center justify-center transition-colors active:scale-95"
              title="Scroll Up"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <div className="text-[9px] font-mono uppercase text-slate-400 -rotate-90">
              SCROLL
            </div>
            <button
              onClick={() => handleScrollStep(100)}
              className="w-full py-2 rounded-lg bg-slate-800/60 hover:bg-cyan-500 hover:text-slate-950 text-slate-400 text-xs flex items-center justify-center transition-colors active:scale-95"
              title="Scroll Down"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tactile Mouse Physical Buttons */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          <button
            onClick={() => handleMouseButton('left')}
            className={`py-3.5 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
              isLeftDown
                ? 'bg-cyan-500 border-cyan-400 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
            }`}
          >
            Left Click (Primary)
          </button>

          <button
            onClick={() => handleMouseButton('middle')}
            className="py-3.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-all active:scale-95"
          >
            Wheel / Middle Click
          </button>

          <button
            onClick={() => handleMouseButton('right')}
            className="py-3.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-all active:scale-95"
          >
            Right Click (Context)
          </button>
        </div>

      </div>
    </div>
  );
};
