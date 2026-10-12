/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSpriteContext } from '../context/SpriteContext';
import { DEFAULT_PALETTES } from '../constants/retroDev';

export const ColorPalette: React.FC = () => {
  const {
    currentColor,
    setCurrentColor,
    colorHistory,
    customColors,
    addCustomColor,
    removeCustomColor,
  } = useSpriteContext();

  const [selectedPaletteId, setSelectedPaletteId] = useState<string>('retro-dev-classic');
  const [hexInput, setHexInput] = useState<string>(currentColor);

  const activePalette = DEFAULT_PALETTES.find((p) => p.id === selectedPaletteId) || DEFAULT_PALETTES[0];

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    setHexInput(val);
    if (!val.startsWith('#')) val = '#' + val;
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      setCurrentColor(val.toUpperCase());
    }
  };

  const handleSelectColor = (c: string) => {
    setCurrentColor(c);
    setHexInput(c);
  };

  return (
    <div className="wiki-box" style={{ marginBottom: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="wiki-box-header">
        <span>Color Palette</span>
        <select
          value={selectedPaletteId}
          onChange={(e) => setSelectedPaletteId(e.target.value)}
          style={{ fontSize: '12px', padding: '1px' }}
        >
          {DEFAULT_PALETTES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
          <option value="custom">My Custom Palette</option>
        </select>
      </div>

      {/* Active Color Preview & Hex Controls */}
      <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
        <input
          type="color"
          value={currentColor.startsWith('#') && currentColor.length === 7 ? currentColor : '#000000'}
          onChange={(e) => handleSelectColor(e.target.value.toUpperCase())}
          style={{ width: '32px', height: '28px', padding: '0', cursor: 'pointer', border: '1px solid #776655' }}
          title="Native Browser Color Chooser"
        />
        <input
          type="text"
          value={hexInput}
          onChange={handleHexChange}
          maxLength={7}
          style={{ width: '80px', fontFamily: 'Courier New, monospace' }}
        />
        <button type="button" onClick={() => addCustomColor(currentColor)}>
          + Save to Custom
        </button>
      </div>

      {/* Swatches Grid */}
      <div style={{ marginTop: '8px' }}>
        <strong style={{ fontSize: '12px' }}>
          {selectedPaletteId === 'custom' ? 'Custom Swatches:' : `${activePalette.name} Swatches:`}
        </strong>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', marginTop: '4px' }}>
          {selectedPaletteId === 'custom' ? (
            customColors.length === 0 ? (
              <span style={{ fontSize: '12px', color: '#5e4933' }}>No custom colors saved yet.</span>
            ) : (
              customColors.map((c, i) => (
                <div
                  key={i}
                  onClick={() => handleSelectColor(c)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    removeCustomColor(c);
                  }}
                  style={{
                    width: '18px',
                    height: '18px',
                    backgroundColor: c,
                    border: currentColor === c ? '2px solid #000' : '1px solid #776655',
                    cursor: 'pointer',
                  }}
                  title={`${c} (Right-click to remove)`}
                />
              ))
            )
          ) : (
            activePalette.colors.map((c, i) => (
              <div
                key={i}
                onClick={() => handleSelectColor(c)}
                style={{
                  width: '18px',
                  height: '18px',
                  backgroundColor: c,
                  border: currentColor === c ? '2px solid #000' : '1px solid #776655',
                  cursor: 'pointer',
                }}
                title={c}
              />
            ))
          )}
        </div>
      </div>

      {/* Recent Color History */}
      {colorHistory.length > 0 && (
        <div style={{ marginTop: '8px' }}>
          <strong style={{ fontSize: '12px' }}>Recent History:</strong>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', marginTop: '4px' }}>
            {colorHistory.slice(0, 16).map((c, i) => (
              <div
                key={i}
                onClick={() => handleSelectColor(c)}
                style={{
                  width: '16px',
                  height: '16px',
                  backgroundColor: c,
                  border: currentColor === c ? '2px solid #000' : '1px solid #776655',
                  cursor: 'pointer',
                }}
                title={c}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
