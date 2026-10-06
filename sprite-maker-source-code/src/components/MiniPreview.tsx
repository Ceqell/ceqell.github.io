import React, { useRef, useEffect, useState } from 'react';
import { Layer } from '../types/sprite';
import { Eye, Copy, Check } from 'lucide-react';
import { CollapsibleSection } from './CollapsibleSection';

interface MiniPreviewProps {
  canvasWidth: number;
  canvasHeight: number;
  layers: Layer[];
}

export const MiniPreview: React.FC<MiniPreviewProps> = ({
  canvasWidth,
  canvasHeight,
  layers,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bgStyle, setBgStyle] = useState<'retro' | 'dark' | 'checker'>('retro');
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
    layers.forEach(layer => {
      if (!layer.visible || layer.opacity <= 0) return;
      ctx.save();
      ctx.globalAlpha = layer.opacity;

      const layerW = layer.width || (layer.pixels.length === canvasWidth * canvasHeight ? canvasWidth : undefined);
      const layerH = layer.height || (layer.pixels.length === canvasWidth * canvasHeight ? canvasHeight : undefined);

      if (layerW && layerH && (layerW !== canvasWidth || layerH !== canvasHeight)) {
        const ox = Math.floor((canvasWidth - layerW) / 2);
        const oy = Math.floor((canvasHeight - layerH) / 2);
        for (let ly = 0; ly < layerH; ly++) {
          for (let lx = 0; lx < layerW; lx++) {
            const color = layer.pixels[ly * layerW + lx];
            if (color && color !== '') {
              const dx = lx + ox;
              const dy = ly + oy;
              if (dx >= 0 && dx < canvasWidth && dy >= 0 && dy < canvasHeight) {
                ctx.fillStyle = color;
                ctx.fillRect(dx, dy, 1, 1);
              }
            }
          }
        }
      } else {
        for (let y = 0; y < canvasHeight; y++) {
          for (let x = 0; x < canvasWidth; x++) {
            const color = layer.pixels[y * canvasWidth + x];
            if (color && color !== '') {
              ctx.fillStyle = color;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        }
      }
      ctx.restore();
    });
  }, [layers, canvasWidth, canvasHeight]);

  const handleCopyQuick = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      if (blob) {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // ignore
        }
      }
    });
  };

  const getBgClass = () => {
    if (bgStyle === 'checker') return 'canvas-checkerboard-sm';
    if (bgStyle === 'dark') return 'bg-[#121318]';
    return 'bg-[#404044]'; // Authentic retro grey background like 1000.png!
  };

  return (
    <CollapsibleSection
      id="preview"
      title="Real-time Preview"
      icon={<Eye className="w-3.5 h-3.5" style={{ color: 'var(--text-accent)' }} />}
      defaultOpen={true}
      headerActions={
        <div className="flex items-center gap-1">
          <button
            onClick={() => setBgStyle(b => b === 'retro' ? 'checker' : b === 'checker' ? 'dark' : 'retro')}
            className="retro-chrome-btn text-[10px] px-1.5 py-0.5 rounded cursor-pointer text-primary-theme font-medium"
            title="Cycle background"
          >
            BG: {bgStyle}
          </button>
          <button
            onClick={handleCopyQuick}
            className="retro-chrome-btn p-1 rounded text-primary-theme cursor-pointer"
            title="Copy 1x PNG to Clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      }
    >
      {/* Preview Box - Dual Views: 1x (real size) and 3x/4x enlarged */}
      <div className={`p-4 flex items-center justify-around gap-4 min-h-[110px] ${getBgClass()} transition-colors border-inset shadow-inner`}>
        {/* 1x Real Size */}
        <div className="flex flex-col items-center gap-1">
          <div className="border border-white/20 shadow-md">
            <canvas
              ref={canvasRef}
              style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }}
              className="pixelated block"
            />
          </div>
          <span className="text-[9px] font-mono text-neutral-300 uppercase tracking-wider font-semibold">1x (Original)</span>
        </div>

        {/* 3x Enlarged */}
        <div className="flex flex-col items-center gap-1">
          <div className="border border-white/20 shadow-md">
            <canvas
              width={canvasWidth}
              height={canvasHeight}
              ref={(c) => {
                if (!c) return;
                const src = canvasRef.current;
                if (!src) return;
                const ctx = c.getContext('2d');
                if (ctx) {
                  ctx.imageSmoothingEnabled = false;
                  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
                  ctx.drawImage(src, 0, 0);
                }
              }}
              style={{ width: `${canvasWidth * 3}px`, height: `${canvasHeight * 3}px` }}
              className="pixelated block"
            />
          </div>
          <span className="text-[9px] font-mono text-neutral-300 uppercase tracking-wider font-semibold">3x Scale</span>
        </div>
      </div>
    </CollapsibleSection>
  );
};
