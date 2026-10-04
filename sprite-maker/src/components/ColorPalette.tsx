import React, { useState } from 'react';
import { Palette, Plus, Trash2, Pipette, Sparkles } from 'lucide-react';
import { Palette as PaletteType } from '../types/sprite';
import { DEFAULT_PALETTES } from '../constants/retroDev';

interface ColorPaletteProps {
  currentColor: string;
  onSelectColor: (color: string) => void;
  colorHistory: string[];
  customColors: string[];
  onAddCustomColor: (color: string) => void;
  onRemoveCustomColor: (color: string) => void;
  onPickWithNativeEyedropper?: () => void;
}

export const ColorPalette: React.FC<ColorPaletteProps> = ({
  currentColor,
  onSelectColor,
  colorHistory,
  customColors,
  onAddCustomColor,
  onRemoveCustomColor,
  onPickWithNativeEyedropper,
}) => {
  const [selectedPaletteId, setSelectedPaletteId] = useState<string>('retro-dev-classic');
  const [hexInput, setHexInput] = useState<string>(currentColor);

  const activePalette = DEFAULT_PALETTES.find(p => p.id === selectedPaletteId) || DEFAULT_PALETTES[0];

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    setHexInput(val);
    if (!val.startsWith('#')) val = '#' + val;
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      onSelectColor(val.toUpperCase());
    }
  };

  const handleColorPick = (color: string) => {
    onSelectColor(color);
    setHexInput(color);
  };

  return (
    <div className="flex flex-col bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl text-neutral-200 w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-800 bg-neutral-950/60">
        <div className="flex items-center gap-1.5 font-medium text-xs text-neutral-300">
          <Palette className="w-3.5 h-3.5 text-amber-400" />
          <span>Color Palette</span>
        </div>

        <select
          value={selectedPaletteId}
          onChange={(e) => setSelectedPaletteId(e.target.value)}
          className="bg-neutral-800 text-[11px] text-neutral-200 border border-neutral-700 rounded px-1.5 py-0.5 outline-none hover:border-amber-500/50"
        >
          {DEFAULT_PALETTES.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
          <option value="custom">My Custom Palette</option>
        </select>
      </div>

      <div className="p-3 space-y-3">
        {/* Main Color Picker Box & Inputs */}
        <div className="flex items-center gap-3">
          {/* Native HTML Color Input preview trigger */}
          <div className="relative w-10 h-10 rounded-lg overflow-hidden border-2 border-neutral-700 shadow-inner shrink-0 group">
            <input
              type="color"
              value={currentColor.slice(0, 7)}
              onChange={(e) => handleColorPick(e.target.value.toUpperCase())}
              className="absolute -inset-2 w-14 h-14 cursor-pointer opacity-0"
              title="Click to open color spectrum"
            />
            <div 
              className="w-full h-full" 
              style={{ backgroundColor: currentColor }} 
            />
          </div>

          <div className="flex-1 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-neutral-400 font-mono">HEX</span>
              <input
                type="text"
                value={hexInput}
                onChange={handleHexChange}
                placeholder="#RRGGBB"
                maxLength={7}
                className="bg-neutral-950 border border-neutral-700 rounded px-2 py-1 text-xs font-mono text-neutral-100 uppercase w-24 outline-none focus:border-amber-500"
              />
              {/* Native Eyedropper API button if supported */}
              {typeof window !== 'undefined' && 'EyeDropper' in window && (
                <button
                  type="button"
                  onClick={onPickWithNativeEyedropper}
                  className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded border border-neutral-700 transition-colors"
                  title="Sample any color from screen"
                >
                  <Pipette className="w-3.5 h-3.5 text-amber-400" />
                </button>
              )}

              <button
                type="button"
                onClick={() => onAddCustomColor(currentColor)}
                className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-amber-400 rounded border border-neutral-700 transition-colors ml-auto flex items-center gap-1 text-[11px]"
                title="Add current color to custom palette"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>

            {/* Quick Noob Palette Shortcuts */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-neutral-500 uppercase font-mono">Quick:</span>
              {[
                { name: 'Head/Arms', color: '#F5CD2F' },
                { name: 'Torso', color: '#0D69AC' },
                { name: 'Legs', color: '#287F46' },
                { name: 'Seam', color: '#1C5831' },
                { name: 'Black', color: '#1B2A34' },
                { name: 'White', color: '#FFFFFF' },
              ].map(item => (
                <button
                  key={item.name}
                  onClick={() => handleColorPick(item.color)}
                  className={`w-4 h-4 rounded-sm border transition-transform hover:scale-110 ${
                    currentColor.toUpperCase() === item.color.toUpperCase()
                      ? 'border-white ring-1 ring-amber-400'
                      : 'border-neutral-700'
                  }`}
                  style={{ backgroundColor: item.color }}
                  title={`${item.name} (${item.color})`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Selected Palette Swatches Grid */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-neutral-400">
            <span className="font-medium">
              {selectedPaletteId === 'custom' ? 'Custom Swatches' : activePalette.name}
            </span>
            <span className="text-[10px] text-neutral-500 font-mono">
              {selectedPaletteId === 'custom' ? customColors.length : activePalette.colors.length} colors
            </span>
          </div>

          <div className="grid grid-cols-8 gap-1 max-h-32 overflow-y-auto p-1 bg-neutral-950/60 rounded-lg border border-neutral-800/80">
            {selectedPaletteId === 'custom' ? (
              customColors.length > 0 ? (
                customColors.map((color, idx) => (
                  <div key={idx} className="relative group">
                    <button
                      onClick={() => handleColorPick(color)}
                      className={`w-6 h-6 rounded border transition-all ${
                        currentColor.toUpperCase() === color.toUpperCase()
                          ? 'border-amber-400 ring-2 ring-amber-400/50 scale-105 z-10'
                          : 'border-neutral-700/80 hover:border-neutral-400'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveCustomColor(color);
                      }}
                      className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 hover:scale-110 transition-opacity shadow-md"
                      title="Remove from custom"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-8 py-3 text-center text-xs text-neutral-500 italic">
                  Click "+ Save" above to add colors here
                </div>
              )
            ) : (
              activePalette.colors.map((color, idx) => (
                <button
                  key={idx}
                  onClick={() => handleColorPick(color)}
                  className={`w-6 h-6 rounded border transition-all ${
                    currentColor.toUpperCase() === color.toUpperCase()
                      ? 'border-amber-400 ring-2 ring-amber-400/50 scale-105 z-10'
                      : 'border-neutral-700/80 hover:border-neutral-400'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))
            )}
          </div>
        </div>

        {/* Recently Used Color History */}
        {colorHistory.length > 0 && (
          <div className="space-y-1">
            <div className="text-[10px] text-neutral-500 font-mono uppercase">Recent History</div>
            <div className="flex items-center gap-1 overflow-x-auto py-1">
              {colorHistory.slice(0, 12).map((color, idx) => (
                <button
                  key={idx}
                  onClick={() => handleColorPick(color)}
                  className={`w-5 h-5 rounded-sm border shrink-0 transition-transform hover:scale-110 ${
                    currentColor.toUpperCase() === color.toUpperCase()
                      ? 'border-amber-400 ring-1 ring-amber-400'
                      : 'border-neutral-700'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
