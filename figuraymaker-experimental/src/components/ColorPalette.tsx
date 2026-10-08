import React, { useState } from 'react';
import { Palette, Plus, Trash2, Pipette } from 'lucide-react';
import { DEFAULT_PALETTES } from '../constants/retroDev';
import { CollapsibleSection } from './CollapsibleSection';

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
    <CollapsibleSection
      id="palette"
      title="Color Palette"
      icon={<Palette className="w-3.5 h-3.5" style={{ color: 'var(--text-accent)' }} />}
      defaultOpen={true}
      headerActions={
        <select
          value={selectedPaletteId}
          onChange={(e) => setSelectedPaletteId(e.target.value)}
          className="retro-chrome-btn text-[11px] text-primary-theme rounded px-2 py-0.5 outline-none cursor-pointer"
        >
          {DEFAULT_PALETTES.map(p => (
            <option key={p.id} value={p.id} className="bg-surface-theme text-primary-theme">{p.name}</option>
          ))}
          <option value="custom" className="bg-surface-theme text-primary-theme font-bold">My Custom Palette</option>
        </select>
      }
    >
      <div className="p-3 space-y-3">
        {/* Main Color Picker Box & Inputs */}
        <div className="flex items-center gap-3">
          {/* Native HTML Color Input preview trigger */}
          <div className="relative w-10 h-10 rounded-lg overflow-hidden border-2 border-ui-theme shadow-inner shrink-0 group">
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
              <span className="text-[11px] text-secondary-theme font-mono font-medium">HEX</span>
              <input
                type="text"
                value={hexInput}
                onChange={handleHexChange}
                placeholder="#RRGGBB"
                maxLength={7}
                className="bg-surface-raised-theme border border-ui-theme rounded px-2 py-1 text-xs font-mono text-primary-theme uppercase w-24 outline-none focus:border-[var(--text-accent)]"
              />
              {/* Native Eyedropper API button if supported */}
              {typeof window !== 'undefined' && 'EyeDropper' in window && (
                <button
                  type="button"
                  onClick={onPickWithNativeEyedropper}
                  className="retro-chrome-btn p-1.5 rounded cursor-pointer text-primary-theme"
                  title="Sample any color from screen"
                >
                  <Pipette className="w-3.5 h-3.5" style={{ color: 'var(--text-accent)' }} />
                </button>
              )}

              <button
                type="button"
                onClick={() => onAddCustomColor(currentColor)}
                className="retro-chrome-btn p-1.5 rounded ml-auto flex items-center gap-1 text-[11px] cursor-pointer text-primary-theme font-medium"
                title="Add current color to custom palette"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>

            {/* Quick Palette Shortcuts */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-secondary-theme uppercase font-mono font-semibold">Quick:</span>
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
                  className={`w-4 h-4 rounded-sm border transition-transform hover:scale-110 cursor-pointer ${
                    currentColor.toUpperCase() === item.color.toUpperCase()
                      ? 'border-white ring-2 ring-[var(--text-accent)]'
                      : 'border-ui-theme'
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
          <div className="flex items-center justify-between text-[11px] text-secondary-theme">
            <span className="font-semibold text-primary-theme">
              {selectedPaletteId === 'custom' ? 'Custom Swatches' : activePalette.name}
            </span>
            <span className="text-[10px] font-mono">
              {selectedPaletteId === 'custom' ? customColors.length : activePalette.colors.length} colors
            </span>
          </div>

          <div className="grid grid-cols-8 gap-1 max-h-32 overflow-y-auto p-1.5 retro-inset-well rounded-lg">
            {selectedPaletteId === 'custom' ? (
              customColors.length > 0 ? (
                customColors.map((color, idx) => (
                  <div key={idx} className="relative group">
                    <button
                      onClick={() => handleColorPick(color)}
                      className={`w-6 h-6 rounded border transition-all cursor-pointer ${
                        currentColor.toUpperCase() === color.toUpperCase()
                          ? 'ring-2 ring-[var(--text-accent)] scale-105 z-10 border-white'
                          : 'border-ui-theme hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveCustomColor(color);
                      }}
                      className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 hover:scale-110 transition-opacity shadow-md cursor-pointer"
                      title="Remove from custom"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-8 py-3 text-center text-xs text-secondary-theme italic">
                  Click "+ Save" above to add colors here
                </div>
              )
            ) : (
              activePalette.colors.map((color, idx) => (
                <button
                  key={idx}
                  onClick={() => handleColorPick(color)}
                  className={`w-6 h-6 rounded border transition-all cursor-pointer ${
                    currentColor.toUpperCase() === color.toUpperCase()
                      ? 'ring-2 ring-[var(--text-accent)] scale-105 z-10 border-white'
                      : 'border-ui-theme hover:scale-105'
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
            <div className="text-[10px] text-secondary-theme font-mono uppercase font-semibold">Recent History</div>
            <div className="flex items-center gap-1 overflow-x-auto py-1">
              {colorHistory.slice(0, 12).map((color, idx) => (
                <button
                  key={idx}
                  onClick={() => handleColorPick(color)}
                  className={`w-5 h-5 rounded-sm border shrink-0 transition-transform hover:scale-110 cursor-pointer ${
                    currentColor.toUpperCase() === color.toUpperCase()
                      ? 'border-white ring-2 ring-[var(--text-accent)]'
                      : 'border-ui-theme'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
};
