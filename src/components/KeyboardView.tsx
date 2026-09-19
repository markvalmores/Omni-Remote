import React, { useState } from 'react';
import { 
  Keyboard as KeyboardIcon, 
  Send, 
  Delete, 
  CornerDownLeft, 
  Grid3X3, 
  Sliders, 
  Zap, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight 
} from 'lucide-react';
import { playTactileSound, triggerHaptic } from '../services/hapticsAndAudio';

interface KeyboardViewProps {
  onSendKey: (key: string) => void;
  onSendString: (text: string) => void;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  pollingRateHz: number;
}

const FUNCTION_KEYS = ['ESC', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'PRTSC', 'DEL'];

const ROW_1 = ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'BACKSPACE'];
const ROW_2 = ['TAB', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'];
const ROW_3 = ['CAPS', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'ENTER'];
const ROW_4 = ['SHIFT', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'SHIFT'];

export const KeyboardView: React.FC<KeyboardViewProps> = ({
  onSendKey,
  onSendString,
  soundEnabled,
  hapticEnabled,
  pollingRateHz,
}) => {
  const [textInput, setTextInput] = useState('');
  const [capsActive, setCapsActive] = useState(false);
  const [shiftActive, setShiftActive] = useState(false);
  const [ctrlActive, setCtrlActive] = useState(false);
  const [altActive, setAltActive] = useState(false);
  const [showAttachedNumpad, setShowAttachedNumpad] = useState(true);

  const handleKeyPress = (key: string) => {
    playTactileSound('click', soundEnabled);
    triggerHaptic(10, hapticEnabled);

    if (key === 'CAPS') {
      setCapsActive(!capsActive);
      return;
    }
    if (key === 'SHIFT') {
      setShiftActive(!shiftActive);
      return;
    }
    if (key === 'CTRL') {
      setCtrlActive(!ctrlActive);
      return;
    }
    if (key === 'ALT') {
      setAltActive(!altActive);
      return;
    }

    let modifiedKey = key;
    if (ctrlActive) modifiedKey = `CTRL+${modifiedKey}`;
    if (altActive) modifiedKey = `ALT+${modifiedKey}`;

    onSendKey(modifiedKey);

    // If shift was one-shot, release it
    if (shiftActive) setShiftActive(false);
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput) return;
    onSendString(textInput);
    playTactileSound('macro_success', soundEnabled);
    triggerHaptic(20, hapticEnabled);
    setTextInput('');
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-2 px-2 sm:px-4 flex flex-col items-center select-none">
      
      {/* Keyboard Header with Direct Text Transmitter */}
      <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-3 mb-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
            <KeyboardIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100 flex items-center gap-2">
              Full F1-F12 Keyboard &amp; Text Transmitter
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/50">
                {pollingRateHz} Hz
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              Low-latency key stroke dispatching • Send full search strings directly
            </div>
          </div>
        </div>

        {/* Text Input to TV Search Box */}
        <form onSubmit={handleSendText} className="flex items-center gap-2 flex-1 max-w-md">
          <input
            type="text"
            placeholder="Type search text or URL to send to TV..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>

      {/* Main Keyboard Chassis */}
      <div className="w-full bg-[#0b101c] border-2 border-slate-800 rounded-3xl p-3 sm:p-5 shadow-2xl flex flex-col lg:flex-row gap-4">
        
        {/* Left Section: QWERTY + Function Keys */}
        <div className="flex-1 flex flex-col gap-2 overflow-x-auto pb-1">
          
          {/* FUNCTION KEYS ROW (F1 to F12) */}
          <div className="flex items-center gap-1 sm:gap-1.5 min-w-[580px]">
            {FUNCTION_KEYS.map((k) => (
              <button
                key={k}
                onClick={() => handleKeyPress(k)}
                className={`py-2 px-1 rounded-lg border font-mono font-bold text-[10px] sm:text-xs text-center flex-1 transition-all active:scale-95 ${
                  k.startsWith('F')
                    ? 'bg-slate-900 border-cyan-500/30 text-cyan-300 hover:bg-cyan-950/60 hover:border-cyan-400'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {k}
              </button>
            ))}
          </div>

          {/* ROW 1: Numbers & Symbols */}
          <div className="flex items-center gap-1 sm:gap-1.5 min-w-[580px]">
            {ROW_1.map((k) => (
              <button
                key={k}
                onClick={() => handleKeyPress(k)}
                className={`py-2.5 rounded-lg border font-mono font-semibold text-xs text-center transition-all active:scale-95 ${
                  k === 'BACKSPACE'
                    ? 'flex-[1.8] bg-slate-800 border-slate-700 text-rose-300 hover:bg-slate-700 text-[11px]'
                    : 'flex-1 bg-slate-900/90 border-slate-800 text-slate-200 hover:bg-slate-800'
                }`}
              >
                {k}
              </button>
            ))}
          </div>

          {/* ROW 2: QWERTY */}
          <div className="flex items-center gap-1 sm:gap-1.5 min-w-[580px]">
            {ROW_2.map((k) => (
              <button
                key={k}
                onClick={() => handleKeyPress(k)}
                className={`py-2.5 rounded-lg border font-mono font-semibold text-xs text-center transition-all active:scale-95 ${
                  k === 'TAB'
                    ? 'flex-[1.4] bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 text-[11px]'
                    : 'flex-1 bg-slate-900/90 border-slate-800 text-slate-200 hover:bg-slate-800'
                }`}
              >
                {capsActive || shiftActive ? k.toUpperCase() : k.toLowerCase()}
              </button>
            ))}
          </div>

          {/* ROW 3: Home Row */}
          <div className="flex items-center gap-1 sm:gap-1.5 min-w-[580px]">
            {ROW_3.map((k) => (
              <button
                key={k}
                onClick={() => handleKeyPress(k)}
                className={`py-2.5 rounded-lg border font-mono font-semibold text-xs text-center transition-all active:scale-95 ${
                  k === 'CAPS'
                    ? `flex-[1.6] border-slate-700 text-[11px] ${capsActive ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400' : 'bg-slate-800 text-slate-400'}`
                    : k === 'ENTER'
                    ? 'flex-[1.8] bg-cyan-600 hover:bg-cyan-500 border-cyan-500 text-slate-950 font-bold text-[11px]'
                    : 'flex-1 bg-slate-900/90 border-slate-800 text-slate-200 hover:bg-slate-800'
                }`}
              >
                {k === 'CAPS' || k === 'ENTER' ? k : (capsActive || shiftActive ? k.toUpperCase() : k.toLowerCase())}
              </button>
            ))}
          </div>

          {/* ROW 4: Shift & Bottom Row */}
          <div className="flex items-center gap-1 sm:gap-1.5 min-w-[580px]">
            {ROW_4.map((k, idx) => (
              <button
                key={`${k}-${idx}`}
                onClick={() => handleKeyPress(k)}
                className={`py-2.5 rounded-lg border font-mono font-semibold text-xs text-center transition-all active:scale-95 ${
                  k === 'SHIFT'
                    ? `flex-[1.9] border-slate-700 text-[11px] ${shiftActive ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400' : 'bg-slate-800 text-slate-400'}`
                    : 'flex-1 bg-slate-900/90 border-slate-800 text-slate-200 hover:bg-slate-800'
                }`}
              >
                {k === 'SHIFT' ? k : (capsActive || shiftActive ? k.toUpperCase() : k.toLowerCase())}
              </button>
            ))}
          </div>

          {/* ROW 5: Modifiers, Space & Arrow Keys */}
          <div className="flex items-center gap-1 sm:gap-1.5 min-w-[580px]">
            <button
              onClick={() => handleKeyPress('CTRL')}
              className={`px-3 py-2.5 rounded-lg border font-mono text-xs font-bold transition-colors ${
                ctrlActive ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              Ctrl
            </button>

            <button
              onClick={() => handleKeyPress('WIN')}
              className="px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 font-mono text-xs hover:bg-slate-700"
            >
              Win/Cmd
            </button>

            <button
              onClick={() => handleKeyPress('ALT')}
              className={`px-3 py-2.5 rounded-lg border font-mono text-xs font-bold transition-colors ${
                altActive ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              Alt
            </button>

            <button
              onClick={() => handleKeyPress('SPACE')}
              className="flex-[4] py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 font-mono text-xs hover:bg-slate-800 active:scale-98"
            >
              SPACEBAR
            </button>

            {/* Arrows */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleKeyPress('ARROW_LEFT')}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => handleKeyPress('ARROW_UP')}
                  className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 active:scale-95"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleKeyPress('ARROW_DOWN')}
                  className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 active:scale-95"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
              </div>
              <button
                onClick={() => handleKeyPress('ARROW_RIGHT')}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 active:scale-95"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* Right Section: Attached Dedicated Numpad */}
        <div className="lg:w-60 border-t lg:border-t-0 lg:border-l border-slate-800 pt-3 lg:pt-0 lg:pl-4 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase font-mono px-1">
            <span className="flex items-center gap-1.5">
              <Grid3X3 className="w-3.5 h-3.5 text-cyan-400" />
              Numpad
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">NumLock ON</span>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            <button
              onClick={() => handleKeyPress('NUM_LOCK')}
              className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-mono font-bold text-xs"
            >
              Num
            </button>
            <button
              onClick={() => handleKeyPress('/')}
              className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 font-mono font-bold text-xs hover:bg-slate-800"
            >
              /
            </button>
            <button
              onClick={() => handleKeyPress('*')}
              className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 font-mono font-bold text-xs hover:bg-slate-800"
            >
              *
            </button>
            <button
              onClick={() => handleKeyPress('-')}
              className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 font-mono font-bold text-xs hover:bg-slate-800"
            >
              -
            </button>

            <button
              onClick={() => handleKeyPress('7')}
              className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-100 font-mono font-bold text-sm hover:bg-slate-800"
            >
              7
            </button>
            <button
              onClick={() => handleKeyPress('8')}
              className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-100 font-mono font-bold text-sm hover:bg-slate-800"
            >
              8
            </button>
            <button
              onClick={() => handleKeyPress('9')}
              className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-100 font-mono font-bold text-sm hover:bg-slate-800"
            >
              9
            </button>
            <button
              onClick={() => handleKeyPress('+')}
              className="row-span-2 p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 font-mono font-bold text-sm flex items-center justify-center hover:bg-slate-800"
            >
              +
            </button>

            <button
              onClick={() => handleKeyPress('4')}
              className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-100 font-mono font-bold text-sm hover:bg-slate-800"
            >
              4
            </button>
            <button
              onClick={() => handleKeyPress('5')}
              className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-100 font-mono font-bold text-sm hover:bg-slate-800"
            >
              5
            </button>
            <button
              onClick={() => handleKeyPress('6')}
              className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-100 font-mono font-bold text-sm hover:bg-slate-800"
            >
              6
            </button>

            <button
              onClick={() => handleKeyPress('1')}
              className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-100 font-mono font-bold text-sm hover:bg-slate-800"
            >
              1
            </button>
            <button
              onClick={() => handleKeyPress('2')}
              className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-100 font-mono font-bold text-sm hover:bg-slate-800"
            >
              2
            </button>
            <button
              onClick={() => handleKeyPress('3')}
              className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-100 font-mono font-bold text-sm hover:bg-slate-800"
            >
              3
            </button>
            <button
              onClick={() => handleKeyPress('ENTER')}
              className="row-span-2 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 border border-cyan-400 text-slate-950 font-mono font-extrabold text-xs flex items-center justify-center shadow-md shadow-cyan-500/20"
            >
              ↵
            </button>

            <button
              onClick={() => handleKeyPress('0')}
              className="col-span-2 p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-100 font-mono font-bold text-sm hover:bg-slate-800"
            >
              0
            </button>
            <button
              onClick={() => handleKeyPress('.')}
              className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-100 font-mono font-bold text-sm hover:bg-slate-800"
            >
              .
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
