import React, { useEffect, useCallback, useState } from 'react';
import { Delete, CornerDownLeft } from 'lucide-react';

interface NumberPadProps {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export const NumberPad: React.FC<NumberPadProps> = ({
  onDigit,
  onBackspace,
  onClear,
  onSubmit,
  disabled = false,
}) => {
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  // Physical keyboard listener
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (disabled) return;

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        onDigit(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        onBackspace();
      } else if (e.key === 'Delete' || e.key === 'Escape' || e.key.toLowerCase() === 'c') {
        e.preventDefault();
        onClear();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSubmit();
      }
    },
    [disabled, onDigit, onBackspace, onClear, onSubmit]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const handlePointerDown = (keyId: string, action: () => void) => (e: React.PointerEvent) => {
    e.preventDefault();
    if (disabled) return;
    setPressedKey(keyId);
    action();
    setTimeout(() => {
      setPressedKey(null);
    }, 120);
  };

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="w-full h-full grid grid-cols-3 grid-rows-4 gap-1 sm:gap-2 select-none touch-none">
      {digits.map((digit) => (
        <button
          key={digit}
          type="button"
          disabled={disabled}
          onPointerDown={handlePointerDown(digit, () => onDigit(digit))}
          className={`w-full h-full flex items-center justify-center font-mono text-3xl sm:text-4xl font-bold border transition-colors cursor-pointer select-none touch-none ${
            pressedKey === digit
              ? 'bg-neutral-700 border-neutral-400 text-white'
              : 'bg-neutral-900 border-neutral-800 text-white active:bg-neutral-700 active:border-neutral-500'
          } disabled:opacity-40 disabled:pointer-events-none`}
        >
          {digit}
        </button>
      ))}

      {/* Backspace */}
      <button
        type="button"
        disabled={disabled}
        onPointerDown={handlePointerDown('backspace', onBackspace)}
        className={`w-full h-full flex items-center justify-center font-mono border transition-colors cursor-pointer select-none touch-none ${
          pressedKey === 'backspace'
            ? 'bg-neutral-700 border-neutral-400 text-white'
            : 'bg-neutral-900 border-neutral-800 text-neutral-400 active:bg-neutral-700 active:text-white'
        } disabled:opacity-40 disabled:pointer-events-none`}
        title="Backspace"
        aria-label="Backspace"
      >
        <Delete className="w-7 h-7 sm:w-8 sm:h-8" />
      </button>

      {/* Zero */}
      <button
        type="button"
        disabled={disabled}
        onPointerDown={handlePointerDown('0', () => onDigit('0'))}
        className={`w-full h-full flex items-center justify-center font-mono text-3xl sm:text-4xl font-bold border transition-colors cursor-pointer select-none touch-none ${
          pressedKey === '0'
            ? 'bg-neutral-700 border-neutral-400 text-white'
            : 'bg-neutral-900 border-neutral-800 text-white active:bg-neutral-700 active:border-neutral-500'
        } disabled:opacity-40 disabled:pointer-events-none`}
      >
        0
      </button>

      {/* Submit */}
      <button
        type="button"
        disabled={disabled}
        onPointerDown={handlePointerDown('submit', onSubmit)}
        className={`w-full h-full flex items-center justify-center font-mono border transition-colors cursor-pointer select-none touch-none ${
          pressedKey === 'submit'
            ? 'bg-neutral-600 border-white text-white'
            : 'bg-neutral-800 border-neutral-700 text-white active:bg-neutral-600'
        } disabled:opacity-40 disabled:pointer-events-none`}
        title="Submit"
        aria-label="Submit"
      >
        <CornerDownLeft className="w-7 h-7 sm:w-8 sm:h-8" />
      </button>
    </div>
  );
};
