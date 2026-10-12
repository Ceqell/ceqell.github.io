/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useSpriteContext } from '../context/SpriteContext';
import { ExportSettings } from '../types/sprite';
import { renderSpriteToCanvas, downloadPng, copyPngToClipboard } from '../utils/exportPng';

export const ExportPage: React.FC = () => {
  const { 
    canvasWidth, 
    canvasHeight, 
    layers, 
    bodyOffsetX, 
    bodyOffsetY, 
    projectName, 
    showAnnouncement 
  } = useSpriteContext();

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const [settings, setSettings] = useState<ExportSettings>({
    scale: 16,
    customWidth: canvasWidth * 16,
    customHeight: canvasHeight * 16,
    useCustomSize: false,
    maintainAspectRatio: true,
    backgroundType: 'transparent',
    backgroundColor: '#ffffff',
    includeGuides: false,
    includeNumbers: false,
    visibleLayersOnly: true,
    filename: projectName.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'figuray_sprite',
  });

  const [copied, setCopied] = useState(false);

  // Re-render preview canvas whenever settings change
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    renderSpriteToCanvas(canvas, {
      width: canvasWidth,
      height: canvasHeight,
      layers,
      settings,
      bodyOffsetX,
      bodyOffsetY,
    });
  }, [canvasWidth, canvasHeight, layers, settings, bodyOffsetX, bodyOffsetY]);

  const handleDownload = () => {
    downloadPng({
      width: canvasWidth,
      height: canvasHeight,
      layers,
      settings,
      bodyOffsetX,
      bodyOffsetY,
    });
    showAnnouncement(`Exported "${settings.filename}.png" successfully.`);
  };

  const handleCopy = async () => {
    try {
      const success = await copyPngToClipboard({
        width: canvasWidth,
        height: canvasHeight,
        layers,
        settings,
        bodyOffsetX,
        bodyOffsetY,
      });
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
        showAnnouncement('Copied raster PNG sprite to system clipboard.');
      }
    } catch (err) {
      console.error(err);
      alert('Unable to copy image to clipboard.');
    }
  };

  const outputW = settings.useCustomSize ? settings.customWidth : canvasWidth * settings.scale;
  const outputH = settings.useCustomSize ? settings.customHeight : canvasHeight * settings.scale;

  return (
    <div className="wiki-container">
      <p className="wiki-breadcrumb">
        <a href="#/">← Return to Sprite Editor</a>
      </p>

      <h1>Export Sprite Graphics (PNG Format)</h1>
      <p>
        Render composite visible layers into a crisp, pixel-perfect PNG graphic. 
        You can export at canonical wiki resolution (1x), high-definition game scales (8x, 16x, 32x), or custom resolutions.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Left Column: Preview */}
        <div className="wiki-box">
          <div className="wiki-box-header">Output Raster Preview</div>
          <div
            style={{
              padding: '12px',
              backgroundColor: settings.backgroundType === 'solid' ? settings.backgroundColor : '#e2d2be',
              border: '1px solid #776655',
              marginTop: '10px',
              textAlign: 'center',
              minHeight: '260px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <canvas
              ref={previewCanvasRef}
              style={{
                maxWidth: '100%',
                maxHeight: '280px',
                imageRendering: 'pixelated',
                border: '1px solid #776655',
              }}
            />
            <div style={{ marginTop: '8px', fontSize: '13px', color: '#5e4933' }}>
              Final Export Resolution: {outputW} × {outputH} px
            </div>
          </div>

          <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
            <button type="button" onClick={handleDownload} style={{ fontWeight: 'bold' }}>
              [ Download {settings.filename}.png ]
            </button>
            <button type="button" onClick={handleCopy}>
              [ {copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'} ]
            </button>
          </div>
        </div>

        {/* Right Column: Settings Form */}
        <div className="wiki-box">
          <div className="wiki-box-header">Export Configuration</div>
          
          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '3px' }}>
                File Name:
              </label>
              <input
                type="text"
                value={settings.filename}
                onChange={(e) => setSettings({ ...settings, filename: e.target.value })}
                style={{ width: '220px' }}
              />{' '}
              .png
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '3px' }}>
                Magnification Scale:
              </label>
              <select
                value={settings.scale}
                onChange={(e) => setSettings({ ...settings, scale: Number(e.target.value), useCustomSize: false })}
              >
                <option value={1}>1x Native Pixel Resolution ({canvasWidth} × {canvasHeight})</option>
                <option value={2}>2x Scale ({canvasWidth * 2} × {canvasHeight * 2})</option>
                <option value={4}>4x Scale ({canvasWidth * 4} × {canvasHeight * 4})</option>
                <option value={8}>8x Scale ({canvasWidth * 8} × {canvasHeight * 8})</option>
                <option value={16}>16x High-Definition HD ({canvasWidth * 16} × {canvasHeight * 16} — Recommended)</option>
                <option value={24}>24x Ultra High Scale ({canvasWidth * 24} × {canvasHeight * 24})</option>
                <option value={32}>32x Presentation Scale ({canvasWidth * 32} × {canvasHeight * 32})</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '3px' }}>
                Background Mode:
              </label>
              <select
                value={settings.backgroundType}
                onChange={(e) => setSettings({ ...settings, backgroundType: e.target.value as 'transparent' | 'solid' | 'checkerboard' })}
              >
                <option value="transparent">Transparent Alpha Channel (Standard PNG)</option>
                <option value="solid">Solid Background Color</option>
                <option value="checkerboard">Checkerboard Canvas Background</option>
              </select>
              {settings.backgroundType === 'solid' && (
                <div style={{ marginTop: '6px' }}>
                  <input
                    type="color"
                    value={settings.backgroundColor}
                    onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                    style={{ verticalAlign: 'middle', marginRight: '6px' }}
                  />
                  <code>{settings.backgroundColor}</code>
                </div>
              )}
            </div>

            <hr />

            <div>
              <label style={{ display: 'block', marginBottom: '4px' }}>
                <input
                  type="checkbox"
                  checked={settings.visibleLayersOnly}
                  onChange={(e) => setSettings({ ...settings, visibleLayersOnly: e.target.checked })}
                />
                Include visible layers only ({layers.filter(l => l.visible).length} of {layers.length} active)
              </label>
              <label style={{ display: 'block', marginBottom: '4px' }}>
                <input
                  type="checkbox"
                  checked={settings.includeGuides}
                  onChange={(e) => setSettings({ ...settings, includeGuides: e.target.checked })}
                />
                Imprint anatomical body wireframe outline onto exported image
              </label>
              <label style={{ display: 'block' }}>
                <input
                  type="checkbox"
                  checked={settings.includeNumbers}
                  onChange={(e) => setSettings({ ...settings, includeNumbers: e.target.checked })}
                />
                Imprint pixel coordinate dimension numbers onto body zones
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
