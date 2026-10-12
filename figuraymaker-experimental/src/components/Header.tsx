/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useSpriteContext } from '../context/SpriteContext';

export const Header: React.FC = () => {
  const {
    projectName,
    setProjectName,
    canvasWidth,
    canvasHeight,
    canvasPresetName,
    zoom,
    setZoom,
    canUndo,
    canRedo,
    undo,
    redo,
    showGrid,
    setShowGrid,
    showGuides,
    setShowGuides,
    showNumbers,
    setShowNumbers,
    symmetryActive,
    setSymmetryActive,
    canvasBg,
    cycleCanvasBg,
    activeLayer,
    flipActiveLayerH,
    flipActiveLayerV,
    centerActiveLayer,
    clearActiveLayer,
  } = useSpriteContext();

  return (
    <header className="wiki-box" style={{ marginBottom: '14px', paddingBottom: '10px' }}>
      {/* Document Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
        <h1 style={{ borderBottom: 'none', marginBottom: '4px', fontSize: '22px' }}>
          FigurayMaker: Sprite Construction Studio
        </h1>
        <div style={{ fontSize: '13px', color: '#5e4933' }}>
          Personal Wiki & Document Edition (Web 1.0)
        </div>
      </div>

      {/* Bracketed Web 1.0 Hyperlink Bar */}
      <div className="wiki-nav-bar" style={{ margin: '6px 0 10px 0' }}>
        [ <a href="#/">Editor</a> ]
        [ <a href="#/projects">Projects Archive</a> ]
        [ <a href="#/starters">Starters</a> ]
        [ <a href="#/assets">Toolbox Assets</a> ]
        [ <a href="#/canvas-resize">Resize Canvas</a> ]
        [ <a href="#/export">Export PNG</a> ]
        [ <a href="#/guide">Proportion Guide</a> ]
        [ <a href="#/help">Help & Manual</a> ]
        [ <a href="#/keybindings">Keybindings</a> ]
        [ <a href="#/about">About & Colophon</a> ]
      </div>

      {/* Editor Operational Status Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          backgroundColor: '#e8dbca',
          padding: '6px 10px',
          border: '1px solid #776655',
          fontSize: '13px',
        }}
      >
        <div>
          <label>
            <strong>Project: </strong>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              style={{ width: '130px', padding: '1px 4px' }}
            />
          </label>
        </div>

        <div>
          <strong>Canvas: </strong>
          <code>{canvasWidth} × {canvasHeight}</code> ({canvasPresetName})
        </div>

        <div>
          <strong>Zoom: </strong>
          <button
            type="button"
            onClick={() => setZoom((z: number) => Math.max(2, z - 2))}
            style={{ padding: '0 5px', marginRight: '3px' }}
          >
            -
          </button>
          <span>{zoom}x</span>
          <button
            type="button"
            onClick={() => setZoom((z: number) => Math.min(48, z + 2))}
            style={{ padding: '0 5px', marginLeft: '3px' }}
          >
            +
          </button>
        </div>

        <div>
          <button
            type="button"
            disabled={!canUndo}
            onClick={undo}
            style={{ marginRight: '3px' }}
          >
            Undo
          </button>
          <button
            type="button"
            disabled={!canRedo}
            onClick={redo}
          >
            Redo
          </button>
        </div>

        <div>
          <button type="button" onClick={cycleCanvasBg}>
            Bg: {canvasBg}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <label>
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
            />
            Grid
          </label>
          <label>
            <input
              type="checkbox"
              checked={showGuides}
              onChange={(e) => setShowGuides(e.target.checked)}
            />
            Guide
          </label>
          <label>
            <input
              type="checkbox"
              checked={showNumbers}
              onChange={(e) => setShowNumbers(e.target.checked)}
            />
            Numbers
          </label>
          <label>
            <input
              type="checkbox"
              checked={symmetryActive}
              onChange={(e) => setSymmetryActive(e.target.checked)}
            />
            Symmetry
          </label>
        </div>

        {activeLayer && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
            <span style={{ color: '#5e4933', alignSelf: 'center' }}>Active: [{activeLayer.name}]</span>
            <button type="button" onClick={flipActiveLayerH} title="Flip Layer Horizontally">Flip H</button>
            <button type="button" onClick={flipActiveLayerV} title="Flip Layer Vertically">Flip V</button>
            <button type="button" onClick={centerActiveLayer} title="Center Layer Pixels">Center</button>
            <button type="button" onClick={clearActiveLayer} title="Clear Layer Pixels">Clear</button>
          </div>
        )}
      </div>
    </header>
  );
};
