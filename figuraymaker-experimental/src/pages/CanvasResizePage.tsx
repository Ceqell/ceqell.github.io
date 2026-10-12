/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSpriteContext } from '../context/SpriteContext';

export const CanvasResizePage: React.FC = () => {
  const { canvasWidth, canvasHeight, setCanvasGeometry } = useSpriteContext();

  const [width, setWidth] = useState<number>(canvasWidth);
  const [height, setHeight] = useState<number>(canvasHeight);
  const [anchor, setAnchor] = useState<'center' | 'top-left' | 'bottom-center'>('center');
  const [autoCenterGuide, setAutoCenterGuide] = useState<boolean>(true);

  const quickPresets = [
    { label: '21 × 28', w: 21, h: 28, desc: 'Retro Dev Classic Wiki Body' },
    { label: '25 × 32', w: 25, h: 32, desc: 'Recommended: Hats & Limbs Room' },
    { label: '32 × 32', w: 32, h: 32, desc: 'Standard Square Game Engine' },
    { label: '36 × 36', w: 36, h: 36, desc: 'Capes, Wings & Large Weapons' },
    { label: '48 × 48', w: 48, h: 48, desc: 'High Detail Character' },
    { label: '64 × 64', w: 64, h: 64, desc: 'Full Scene / Diorama' },
  ];

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setCanvasGeometry(width, height, `${width} × ${height}`, anchor, autoCenterGuide);
    window.location.hash = '#/';
  };

  const handlePresetSelect = (w: number, h: number, name: string) => {
    setWidth(w);
    setHeight(h);
    setCanvasGeometry(w, h, name, anchor, autoCenterGuide);
    window.location.hash = '#/';
  };

  return (
    <div className="wiki-container">
      <p className="wiki-breadcrumb">
        <a href="#/">← Return to Sprite Editor</a>
      </p>

      <h1>Canvas Dimensions & Geometry Configuration</h1>
      <p>
        Resize your working sprite area. Pixels on all existing layers will be positioned relative to the selected anchor point.
      </p>

      {/* Current Stats */}
      <div className="wiki-box">
        <div className="wiki-box-header">Current Dimensions</div>
        <p style={{ marginTop: '8px' }}>
          <strong>Active Canvas Size:</strong> {canvasWidth} pixels wide by {canvasHeight} pixels high (Total {canvasWidth * canvasHeight} pixels per layer).
        </p>
      </div>

      {/* Resize Form */}
      <div className="wiki-box">
        <div className="wiki-box-header">Manual Dimension Controls</div>
        <form onSubmit={handleApply} style={{ marginTop: '10px' }}>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'inline-block', width: '150px' }}>
              <strong>Width (X Axis):</strong>
            </label>
            <input
              type="number"
              min="8"
              max="256"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              style={{ width: '80px', marginRight: '6px' }}
              required
            />
            <span style={{ fontSize: '13px', color: '#5e4933' }}>pixels (8 to 256)</span>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'inline-block', width: '150px' }}>
              <strong>Height (Y Axis):</strong>
            </label>
            <input
              type="number"
              min="8"
              max="256"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              style={{ width: '80px', marginRight: '6px' }}
              required
            />
            <span style={{ fontSize: '13px', color: '#5e4933' }}>pixels (8 to 256)</span>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'inline-block', width: '150px' }}>
              <strong>Content Anchor:</strong>
            </label>
            <select
              value={anchor}
              onChange={(e) => setAnchor(e.target.value as 'center' | 'top-left' | 'bottom-center')}
            >
              <option value="center">Center existing artwork in new canvas</option>
              <option value="top-left">Align top-left (maintain (0,0) coordinates)</option>
              <option value="bottom-center">Align bottom-center (ground feet)</option>
            </select>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label>
              <input
                type="checkbox"
                checked={autoCenterGuide}
                onChange={(e) => setAutoCenterGuide(e.target.checked)}
              />
              Automatically re-center anatomical body guide inside new dimensions
            </label>
          </div>

          <button type="submit">[ Apply New Canvas Dimensions ]</button>
        </form>
      </div>

      {/* Quick Standard Presets */}
      <h2>Quick Dimensional Presets</h2>
      <table>
        <thead>
          <tr>
            <th>Preset</th>
            <th>Dimensions</th>
            <th>Design Description</th>
            <th style={{ width: '140px' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {quickPresets.map((p) => (
            <tr key={p.label}>
              <td><strong>{p.label}</strong></td>
              <td>{p.w} × {p.h} px</td>
              <td>{p.desc}</td>
              <td>
                <button
                  type="button"
                  onClick={() => handlePresetSelect(p.w, p.h, `${p.label} (${p.desc})`)}
                >
                  [ Select {p.label} ]
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
