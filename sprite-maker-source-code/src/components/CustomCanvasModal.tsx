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
      <div className="bg-surface-theme border border-ui-theme rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-primary-theme">
        {/* Header */}
        <div className="px-5 py-4 border-b border-ui-theme bg-surface-raised-theme flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg retro-inset-well flex items-center justify-center" style={{ color: 'var(--text-accent)' }}>
              <Maximize2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-primary-theme text-sm">Custom Canvas Size</h2>
              <p className="text-[11px] text-secondary-theme">Set width and height for your sprite artwork</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="retro-chrome-btn p-1.5 rounded-lg text-primary-theme cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleApply} className="p-5 space-y-4">
          {/* Dimension Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="retro-inset-well p-3 rounded-xl">
              <label className="text-[11px] font-semibold text-secondary-theme uppercase tracking-wider block mb-1.5">
                Width (Pixels)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={8}
                  max={256}
                  value={width}
                  onChange={(e) => setWidth(Math.max(8, Math.min(256, parseInt(e.target.value) || 8)))}
                  className="w-full bg-surface-raised-theme text-primary-theme font-mono text-base font-bold px-3 py-1.5 rounded-lg border border-ui-theme outline-none focus:border-[var(--text-accent)]"
                />
                <span className="text-xs text-secondary-theme font-mono">px</span>
              </div>
            </div>

            <div className="retro-inset-well p-3 rounded-xl">
              <label className="text-[11px] font-semibold text-secondary-theme uppercase tracking-wider block mb-1.5">
                Height (Pixels)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={8}
                  max={256}
                  value={height}
                  onChange={(e) => setHeight(Math.max(8, Math.min(256, parseInt(e.target.value) || 8)))}
                  className="w-full bg-surface-raised-theme text-primary-theme font-mono text-base font-bold px-3 py-1.5 rounded-lg border border-ui-theme outline-none focus:border-[var(--text-accent)]"
                />
                <span className="text-xs text-secondary-theme font-mono">px</span>
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="text-[11px] font-semibold text-secondary-theme uppercase tracking-wider block mb-2">
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
                  className={`px-2.5 py-2 rounded-lg text-left border transition-all cursor-pointer ${
                    width === preset.w && height === preset.h
                      ? 'bg-surface-raised-theme border-[var(--text-accent)] shadow-sm font-semibold'
                      : 'retro-chrome-btn border-ui-theme'
                  }`}
                  style={width === preset.w && height === preset.h ? { color: 'var(--text-accent)' } : undefined}
                >
                  <div className="font-mono font-bold text-xs">{preset.label}</div>
                  <div className="text-[10px] text-secondary-theme truncate">{preset.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Existing Content Anchor */}
          <div>
            <label className="text-[11px] font-semibold text-secondary-theme uppercase tracking-wider block mb-2">
              Align Existing Artwork
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAnchor('center')}
                className={`flex items-center gap-1.5 justify-center py-2 px-2 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                  anchor === 'center'
                    ? 'bg-surface-raised-theme border-[var(--text-accent)] shadow-sm font-bold'
                    : 'retro-chrome-btn border-ui-theme text-secondary-theme'
                }`}
                style={anchor === 'center' ? { color: 'var(--text-accent)' } : undefined}
              >
                <AlignCenter className="w-3.5 h-3.5" />
                Center
              </button>

              <button
                type="button"
                onClick={() => setAnchor('top-left')}
                className={`flex items-center gap-1.5 justify-center py-2 px-2 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                  anchor === 'top-left'
                    ? 'bg-surface-raised-theme border-[var(--text-accent)] shadow-sm font-bold'
                    : 'retro-chrome-btn border-ui-theme text-secondary-theme'
                }`}
                style={anchor === 'top-left' ? { color: 'var(--text-accent)' } : undefined}
              >
                <ArrowUpLeft className="w-3.5 h-3.5" />
                Top-Left
              </button>

              <button
                type="button"
                onClick={() => setAnchor('bottom-center')}
                className={`flex items-center gap-1.5 justify-center py-2 px-2 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                  anchor === 'bottom-center'
                    ? 'bg-surface-raised-theme border-[var(--text-accent)] shadow-sm font-bold'
                    : 'retro-chrome-btn border-ui-theme text-secondary-theme'
                }`}
                style={anchor === 'bottom-center' ? { color: 'var(--text-accent)' } : undefined}
              >
                <ArrowDown className="w-3.5 h-3.5" />
                Bottom (Hats)
              </button>
            </div>
          </div>

          {/* Auto center guide toggle */}
          <div className="retro-inset-well p-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Move className="w-4 h-4 shrink-0" style={{ color: 'var(--text-accent)' }} />
              <div>
                <span className="text-xs font-medium text-primary-theme block">Auto-Center Body Guide</span>
                <span className="text-[10px] text-secondary-theme block">Position 21×28 guide in middle of new canvas</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={autoCenterGuide}
              onChange={(e) => setAutoCenterGuide(e.target.checked)}
              className="w-4 h-4 cursor-pointer"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="retro-chrome-btn flex-1 py-2 rounded-xl text-primary-theme text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="retro-gold-btn flex-1 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer"
            >
              Apply Canvas Size ({width} × {height})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
