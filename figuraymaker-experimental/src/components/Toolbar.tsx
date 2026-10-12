/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useSpriteContext } from '../context/SpriteContext';
import { ToolType } from '../types/sprite';

export const Toolbar: React.FC = () => {
  const {
    currentTool,
    setCurrentTool,
    brushSize,
    setBrushSize,
    symmetryActive,
    setSymmetryActive,
    autoSwitchPencil,
    setAutoSwitchPencil,
    selection,
    commitFloatingSelection,
    deleteSelection,
    flipSelectionH,
    flipSelectionV,
    clearSelection,
  } = useSpriteContext();

  const tools: { id: ToolType; label: string; key: string }[] = [
    { id: 'pencil', label: 'Pencil', key: 'P' },
    { id: 'eraser', label: 'Eraser', key: 'E' },
    { id: 'bucket', label: 'Bucket Fill', key: 'B' },
    { id: 'eyedropper', label: 'Eyedropper', key: 'I' },
    { id: 'line', label: 'Line', key: 'L' },
    { id: 'rectangle', label: 'Box Outline', key: 'U' },
    { id: 'rectangle_fill', label: 'Solid Box', key: '' },
    { id: 'circle', label: 'Circle Outline', key: 'C' },
    { id: 'circle_fill', label: 'Solid Circle', key: '' },
    { id: 'select', label: 'Box Select', key: 'M' },
    { id: 'lasso', label: 'Lasso Select', key: 'Q' },
    { id: 'lighten', label: 'Lighten (Dodge)', key: '' },
    { id: 'darken', label: 'Darken (Burn)', key: '' },
    { id: 'replace', label: 'Color Replace', key: '' },
  ];

  return (
    <div className="wiki-box" style={{ marginBottom: '14px' }}>
      <div className="wiki-box-header">Drawing & Selection Tools</div>

      {/* Tools Table / Matrix */}
      <table style={{ margin: '8px 0', fontSize: '13px' }}>
        <tbody>
          {Array.from({ length: Math.ceil(tools.length / 2) }).map((_, rowIndex) => {
            const t1 = tools[rowIndex * 2];
            const t2 = tools[rowIndex * 2 + 1];
            return (
              <tr key={rowIndex}>
                <td
                  style={{
                    backgroundColor: currentTool === t1.id ? '#dfd2c0' : 'transparent',
                    fontWeight: currentTool === t1.id ? 'bold' : 'normal',
                    width: '50%',
                  }}
                >
                  <label style={{ display: 'block', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="drawingTool"
                      value={t1.id}
                      checked={currentTool === t1.id}
                      onChange={() => setCurrentTool(t1.id)}
                    />
                    {t1.label} {t1.key && <span style={{ color: '#5e4933' }}>[{t1.key}]</span>}
                  </label>
                </td>
                {t2 ? (
                  <td
                    style={{
                      backgroundColor: currentTool === t2.id ? '#dfd2c0' : 'transparent',
                      fontWeight: currentTool === t2.id ? 'bold' : 'normal',
                      width: '50%',
                    }}
                  >
                    <label style={{ display: 'block', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="drawingTool"
                        value={t2.id}
                        checked={currentTool === t2.id}
                        onChange={() => setCurrentTool(t2.id)}
                      />
                      {t2.label} {t2.key && <span style={{ color: '#5e4933' }}>[{t2.key}]</span>}
                    </label>
                  </td>
                ) : (
                  <td />
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Brush Size Controls */}
      <div style={{ marginBottom: '8px', fontSize: '13px' }}>
        <strong>Brush Size: </strong>
        {[1, 2, 3, 4].map((size) => (
          <label key={size} style={{ marginRight: '10px', cursor: 'pointer' }}>
            <input
              type="radio"
              name="brushSize"
              value={size}
              checked={brushSize === size}
              onChange={() => setBrushSize(size)}
            />
            {size}px
          </label>
        ))}
      </div>

      {/* Toggles */}
      <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label>
          <input
            type="checkbox"
            checked={symmetryActive}
            onChange={(e) => setSymmetryActive(e.target.checked)}
          />
          Vertical Symmetry / Mirror Mode [S]
        </label>
        <label>
          <input
            type="checkbox"
            checked={autoSwitchPencil}
            onChange={(e) => setAutoSwitchPencil(e.target.checked)}
          />
          Auto-switch back to Pencil after using Eyedropper
        </label>
      </div>

      {/* Selection Operational Box if active */}
      {selection.active && (
        <div
          style={{
            marginTop: '10px',
            padding: '8px',
            backgroundColor: '#fff2d6',
            border: '1px solid #776655',
            fontSize: '13px',
          }}
        >
          <strong>Selection Active: </strong>
          {selection.floating ? 'Floating (Movable)' : 'Boundary Selected'}
          <div style={{ marginTop: '6px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {selection.floating && (
              <button type="button" onClick={commitFloatingSelection}>
                Stamp [Enter]
              </button>
            )}
            <button type="button" onClick={deleteSelection}>
              Delete [Del]
            </button>
            {selection.floating && (
              <>
                <button type="button" onClick={flipSelectionH}>
                  Flip H
                </button>
                <button type="button" onClick={flipSelectionV}>
                  Flip V
                </button>
              </>
            )}
            <button type="button" onClick={clearSelection}>
              Deselect [Esc]
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
