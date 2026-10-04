import React, { useState } from 'react';
import { X, Maximize2, Move, ArrowUpLeft, AlignCenter, ArrowDown } from 'lucide-react';

interface CustomCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWidth: number;
  currentHeight: number;
  onApply: (width: number, height: number, anchor: 'center' | 'top-left' | 'bottom-center', autoCenterGuide: boolean) => void;
}

export const CustomCanvasModal: React.FC<CustomCanvasModalProps> = ({
  isOpen,
  onClose,
  currentWidth,
  currentHeight,
  onApply,
}) => {
  const [width, setWidth] = useState<number>(currentWidth);
  const [height, setHeight] = useState<number>(currentHeight);
  const [anchor, setAnchor] = useState<'center' | 'top-left' | 'bottom-center'>('center');
  const [autoCenterGuide, setAutoCenterGuide] = useState<boolean>(true);

  if (!isOpen) return null;

  const quickPresets = [
    { label: '21 × 28', w: 21, h: 28, desc: 'Retro Dev Classic Wiki Body' },
    { label: '25 × 32', w: 25, h: 32, desc: 'Recommended: Hats & Limbs Room' },
    { label: '32 × 32', w: 32, h: 32, desc: 'Standard Square Game Engine' },
    { label: '36 × 36', w: 36, h: 36, desc: 'Capes, Wings & Swords' },
    { label: '48 × 48', w: 48, h: 48, desc: 'Large Boss / High Detail' },
    { label: '64 × 64', w: 64, h: 64, desc: 'Scene / Full Diorama' },
  ];

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const clampedW = Math.max(8, Math.min(256, Math.round(width)));
    const clampedH = Math.max(8, Math.min(256, Math.round(height)));
    onApply(clampedW, clampedH, anchor, autoCenterGuide);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Maximize2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-white text-sm">Custom Canvas Size</h2>
              <p className="text-[11px] text-neutral-400">Set width and height for your sprite artwork</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleApply} className="p-5 space-y-4">
          {/* Dimension Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
              <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">
                Width (Pixels)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={8}
                  max={256}
                  value={width}
                  onChange={(e) => setWidth(Math.max(8, Math.min(256, parseInt(e.target.value) || 8)))}
                  className="w-full bg-neutral-900 text-white font-mono text-base font-bold px-3 py-1.5 rounded-lg border border-neutral-700 outline-none focus:border-amber-400"
                />
                <span className="text-xs text-neutral-500 font-mono">px</span>
              </div>
            </div>

            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
              <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">
                Height (Pixels)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={8}
                  max={256}
                  value={height}
                  onChange={(e) => setHeight(Math.max(8, Math.min(256, parseInt(e.target.value) || 8)))}
                  className="w-full bg-neutral-900 text-white font-mono text-base font-bold px-3 py-1.5 rounded-lg border border-neutral-700 outline-none focus:border-amber-400"
                />
                <span className="text-xs text-neutral-500 font-mono">px</span>
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
              Common Presets
            </label>
            <div className="grid grid-cols-3 gap-2">
              {quickPresets.map(preset => (
                <button
                  type="button"
                  key={preset.label}
                  onClick={() => {
                    setWidth(preset.w);
                    setHeight(preset.h);
                  }}
                  className={`px-2.5 py-2 rounded-lg text-left border transition-all ${
                    width === preset.w && height === preset.h
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                      : 'bg-neutral-950/80 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white'
                  }`}
                >
                  <div className="font-mono font-bold text-xs">{preset.label}</div>
                  <div className="text-[10px] text-neutral-400 truncate">{preset.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Existing Content Anchor */}
          <div>
            <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
              Align Existing Artwork
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAnchor('center')}
                className={`flex items-center gap-1.5 justify-center py-2 px-2 rounded-lg border text-xs font-medium transition-all ${
                  anchor === 'center'
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <AlignCenter className="w-3.5 h-3.5" />
                Center
              </button>

              <button
                type="button"
                onClick={() => setAnchor('top-left')}
                className={`flex items-center gap-1.5 justify-center py-2 px-2 rounded-lg border text-xs font-medium transition-all ${
                  anchor === 'top-left'
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <ArrowUpLeft className="w-3.5 h-3.5" />
                Top-Left
              </button>

              <button
                type="button"
                onClick={() => setAnchor('bottom-center')}
                className={`flex items-center gap-1.5 justify-center py-2 px-2 rounded-lg border text-xs font-medium transition-all ${
                  anchor === 'bottom-center'
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <ArrowDown className="w-3.5 h-3.5" />
                Bottom (Hats)
              </button>
            </div>
          </div>

          {/* Auto center guide toggle */}
          <div className="bg-neutral-950/70 p-3 rounded-xl border border-neutral-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Move className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-xs font-medium text-white block">Auto-Center Body Guide</span>
                <span className="text-[10px] text-neutral-400 block">Position 21×28 guide in middle of new canvas</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={autoCenterGuide}
              onChange={(e) => setAutoCenterGuide(e.target.checked)}
              className="accent-amber-400 w-4 h-4 cursor-pointer"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition-colors shadow-lg shadow-amber-500/20"
            >
              Apply Canvas Size ({width} × {height})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
