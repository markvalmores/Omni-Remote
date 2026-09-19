import React, { useState } from 'react';
import { 
  Grid3X3, 
  CornerDownLeft, 
  Delete, 
  Plus, 
  Minus, 
  Hash, 
  Tv, 
  Radio, 
  Zap,
  Check
} from 'lucide-react';
import { playTactileSound, triggerHaptic } from '../services/hapticsAndAudio';

interface NumpadViewProps {
  onSendKey: (key: string) => void;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  pollingRateHz: number;
}

export const NumpadView: React.FC<NumpadViewProps> = ({
  onSendKey,
  soundEnabled,
  hapticEnabled,
  pollingRateHz,
}) => {
  const [currentBuffer, setCurrentBuffer] = useState('');
  const [numLock, setNumLock] = useState(true);

  const handleKey = (key: string) => {
    playTactileSound('click', soundEnabled);
    triggerHaptic(12, hapticEnabled);

    if (key === 'CLEAR') {
      setCurrentBuffer('');
      return;
    }

    if (key === 'BACKSPACE') {
      setCurrentBuffer((prev) => prev.slice(0, -1));
      onSendKey('BACKSPACE');
      return;
    }

    if (key === 'ENTER') {
      onSendKey(currentBuffer ? `PIN_${currentBuffer}` : 'ENTER');
      playTactileSound('macro_success', soundEnabled);
      setCurrentBuffer('');
      return;
    }

    if (key === 'NUMLOCK') {
      setNumLock(!numLock);
      return;
    }

    setCurrentBuffer((prev) => (prev.length < 12 ? prev + key : prev));
    onSendKey(key);
  };

  return (
    <div className="w-full max-w-sm mx-auto py-2 px-3 sm:px-4 flex flex-col items-center select-none">
      
      {/* Header / Buffer Display */}
      <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 mb-3 flex flex-col gap-2 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400">
              <Grid3X3 className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-100">Direct TV Channel &amp; PIN Entry</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/40">
            {pollingRateHz} Hz
          </span>
        </div>

        {/* Real-time Entered Buffer Display */}
        <div className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 flex items-center justify-between font-mono text-lg text-cyan-300">
          <span className="text-xs text-slate-500 font-sans">Input:</span>
          <span className="font-bold tracking-widest">{currentBuffer || '—'}</span>
        </div>
      </div>

      {/* Main Tactile Numpad Chassis */}
      <div className="w-full bg-[#0c1220] border-2 border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-3">
        
        {/* Top Function Strip: NumLock, Divide, Multiply, Subtract */}
        <div className="grid grid-cols-4 gap-2.5">
          <button
            onClick={() => handleKey('NUMLOCK')}
            className={`py-3 rounded-xl border text-xs font-mono font-bold transition-all active:scale-95 ${
              numLock
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 shadow-sm shadow-emerald-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            NumLk
          </button>

          <button
            onClick={() => handleKey('/')}
            className="py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-cyan-300 font-mono font-bold text-base transition-all active:scale-95"
          >
            /
          </button>

          <button
            onClick={() => handleKey('*')}
            className="py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-cyan-300 font-mono font-bold text-base transition-all active:scale-95"
          >
            *
          </button>

          <button
            onClick={() => handleKey('-')}
            className="py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-cyan-300 font-mono font-bold text-base transition-all active:scale-95"
          >
            -
          </button>
        </div>

        {/* 7, 8, 9, PLUS */}
        <div className="grid grid-cols-4 gap-2.5">
          <button
            onClick={() => handleKey('7')}
            className="py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-100 font-mono font-extrabold text-xl transition-all active:scale-95"
          >
            7
          </button>

          <button
            onClick={() => handleKey('8')}
            className="py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-100 font-mono font-extrabold text-xl transition-all active:scale-95"
          >
            8
          </button>

          <button
            onClick={() => handleKey('9')}
            className="py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-100 font-mono font-extrabold text-xl transition-all active:scale-95"
          >
            9
          </button>

          <button
            onClick={() => handleKey('+')}
            className="row-span-2 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-cyan-300 font-mono font-extrabold text-xl flex items-center justify-center transition-all active:scale-95"
          >
            +
          </button>

          {/* 4, 5, 6 */}
          <button
            onClick={() => handleKey('4')}
            className="py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-100 font-mono font-extrabold text-xl transition-all active:scale-95"
          >
            4
          </button>

          <button
            onClick={() => handleKey('5')}
            className="py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-100 font-mono font-extrabold text-xl transition-all active:scale-95 ring-1 ring-cyan-500/30"
          >
            5
          </button>

          <button
            onClick={() => handleKey('6')}
            className="py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-100 font-mono font-extrabold text-xl transition-all active:scale-95"
          >
            6
          </button>
        </div>

        {/* 1, 2, 3, ENTER */}
        <div className="grid grid-cols-4 gap-2.5">
          <button
            onClick={() => handleKey('1')}
            className="py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-100 font-mono font-extrabold text-xl transition-all active:scale-95"
          >
            1
          </button>

          <button
            onClick={() => handleKey('2')}
            className="py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-100 font-mono font-extrabold text-xl transition-all active:scale-95"
          >
            2
          </button>

          <button
            onClick={() => handleKey('3')}
            className="py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-100 font-mono font-extrabold text-xl transition-all active:scale-95"
          >
            3
          </button>

          <button
            onClick={() => handleKey('ENTER')}
            className="row-span-2 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 border border-cyan-400 text-slate-950 font-mono font-extrabold text-sm flex flex-col items-center justify-center gap-1 shadow-lg shadow-cyan-500/30 transition-all active:scale-95"
          >
            <CornerDownLeft className="w-5 h-5" />
            <span>ENTER</span>
          </button>

          {/* 0 and Dot */}
          <button
            onClick={() => handleKey('0')}
            className="col-span-2 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-100 font-mono font-extrabold text-xl transition-all active:scale-95"
          >
            0
          </button>

          <button
            onClick={() => handleKey('.')}
            className="py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-100 font-mono font-extrabold text-xl transition-all active:scale-95"
          >
            .
          </button>
        </div>

        {/* Quick Action Footer: Clear and Backspace */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={() => handleKey('CLEAR')}
            className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold font-mono transition-colors"
          >
            CLEAR ALL
          </button>
          <button
            onClick={() => handleKey('BACKSPACE')}
            className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-rose-300 text-xs font-semibold font-mono flex items-center justify-center gap-1.5 transition-colors"
          >
            <Delete className="w-4 h-4" />
            <span>BACKSPACE</span>
          </button>
        </div>

      </div>
    </div>
  );
};
