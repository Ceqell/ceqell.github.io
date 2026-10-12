/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from 'react';
import { useSpriteContext } from '../context/SpriteContext';
import { CanvasBgStyle } from '../types/sprite';

export const MiniPreview: React.FC = () => {
  const { canvasWidth, canvasHeight, layers, canvasBg, setCanvasBg, showAnnouncement } = useSpriteContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw visible layers
    layers.forEach((layer) => {
      if (!layer.visible || layer.opacity <= 0) return;
      ctx.save();
      ctx.globalAlpha = layer.opacity;

      for (let y = 0; y < canvasHeight; y++) {
        for (let x = 0; x < canvasWidth; x++) {
          const color = layer.pixels[y * canvasWidth + x];
          if (color && color !== '') {
            ctx.fillStyle = color;
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
      ctx.restore();
    });
  }, [canvasWidth, canvasHeight, layers]);

  const handleCopy1x = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        showAnnouncement('Copied 1x native sprite to clipboard.');
      } catch (err) {
        console.error(err);
      }
    });
  };

  const getBgStyle = (): React.CSSProperties => {
    switch (canvasBg) {
      case 'retro':
        return { backgroundColor: '#404044' };
      case 'dark':
        return { backgroundColor: '#121318' };
      case 'light-checker':
        return {
          backgroundImage:
            'linear-gradient(45deg, #eee 25%, transparent 25%), linear-gradient(-45deg, #eee 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #eee 75%), linear-gradient(-45deg, transparent 75%, #eee 75%)',
          backgroundSize: '16px 16px',
          backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
          backgroundColor: '#fff',
        };
      case 'dark-checker':
      default:
        return {
          backgroundImage:
            'linear-gradient(45deg, #222 25%, transparent 25%), linear-gradient(-45deg, #222 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #222 75%), linear-gradient(-45deg, transparent 75%, #222 75%)',
          backgroundSize: '16px 16px',
          backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
          backgroundColor: '#111',
        };
    }
  };

  return (
    <div className="wiki-box" style={{ marginBottom: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="wiki-box-header">
        <span>Real-Time Mini Preview</span>
        <select
          value={canvasBg}
          onChange={(e) => setCanvasBg(e.target.value as CanvasBgStyle)}
          style={{ fontSize: '12px', padding: '1px' }}
        >
          <option value="retro">Bg: Retro Grey (#404044)</option>
          <option value="dark-checker">Bg: Dark Checker</option>
          <option value="light-checker">Bg: Light Checker</option>
          <option value="dark">Bg: Pitch Dark (#121318)</option>
        </select>
      </div>

      <div
        style={{
          marginTop: '8px',
          padding: '12px',
          border: '1px solid #776655',
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          justifyContent: 'center',
          ...getBgStyle(),
        }}
      >
        {/* 1x native scale */}
        <div style={{ textAlign: 'center' }}>
          <canvas
            ref={canvasRef}
            style={{
              width: `${canvasWidth}px`,
              height: `${canvasHeight}px`,
              imageRendering: 'pixelated',
              border: '1px solid rgba(255,255,255,0.3)',
            }}
          />
          <div style={{ fontSize: '11px', color: '#fff', marginTop: '3px' }}>1x</div>
        </div>

        {/* 3x magnified preview */}
        <div style={{ textAlign: 'center' }}>
          <canvas
            ref={(c) => {
              if (!c || !canvasRef.current) return;
              c.width = canvasWidth * 3;
              c.height = canvasHeight * 3;
              const ctx = c.getContext('2d');
              if (ctx) {
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(canvasRef.current, 0, 0, canvasWidth * 3, canvasHeight * 3);
              }
            }}
            style={{
              width: `${canvasWidth * 3}px`,
              height: `${canvasHeight * 3}px`,
              imageRendering: 'pixelated',
              border: '1px solid rgba(255,255,255,0.3)',
            }}
          />
          <div style={{ fontSize: '11px', color: '#fff', marginTop: '3px' }}>3x</div>
        </div>
      </div>

      <div style={{ marginTop: '8px', textAlign: 'center' }}>
        <button type="button" onClick={handleCopy1x} style={{ fontSize: '12px' }}>
          {copied ? 'Copied 1x Sprite!' : 'Copy 1x PNG to Clipboard'}
        </button>
      </div>
    </div>
  );
};
