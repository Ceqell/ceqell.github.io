import React, { useState, useRef, useEffect } from 'react';
import { 
  Download, 
  Copy, 
  Check, 
  X, 
  Layers, 
  Eye, 
  Image as ImageIcon, 
  Settings2,
  Lock,
  Unlock
} from 'lucide-react';
import { Layer, ExportSettings } from '../types/sprite';
import { renderSpriteToCanvas, downloadPng, copyPngToClipboard } from '../utils/exportPng';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasWidth: number;
  canvasHeight: number;
  layers: Layer[];
  bodyOffsetX?: number;
  bodyOffsetY?: number;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  canvasWidth,
  canvasHeight,
  layers,
  bodyOffsetX = 0,
  bodyOffsetY = 0,
}) => {
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const [settings, setSettings] = useState<ExportSettings>({
    scale: 16, // Default 16x (e.g. 21x28 -> 336x448, very crisp and clear!)
    customWidth: canvasWidth * 16,
    customHeight: canvasHeight * 16,
    useCustomSize: false,
    maintainAspectRatio: true,
    backgroundType: 'transparent',
    backgroundColor: '#ffffff',
    includeGuides: false,
    includeNumbers: false,
    visibleLayersOnly: true,
    filename: 'retro-dev-character',
  });

  const [copied, setCopied] = useState(false);

  // Update customWidth & customHeight if scale changes
  const handleScalePreset = (scaleVal: number) => {
    setSettings(prev => ({
      ...prev,
      scale: scaleVal,
      useCustomSize: false,
      customWidth: canvasWidth * scaleVal,
      customHeight: canvasHeight * scaleVal,
    }));
  };

  const handleCustomWidthChange = (val: number) => {
    const w = Math.max(1, Math.min(8192, val));
    if (settings.maintainAspectRatio) {
      const h = Math.round((w / canvasWidth) * canvasHeight);
      setSettings(s => ({ ...s, useCustomSize: true, customWidth: w, customHeight: h }));
    } else {
      setSettings(s => ({ ...s, useCustomSize: true, customWidth: w }));
    }
  };

  const handleCustomHeightChange = (val: number) => {
    const h = Math.max(1, Math.min(8192, val));
    if (settings.maintainAspectRatio) {
      const w = Math.round((h / canvasHeight) * canvasWidth);
      setSettings(s => ({ ...s, useCustomSize: true, customWidth: w, customHeight: h }));
    } else {
      setSettings(s => ({ ...s, useCustomSize: true, customHeight: h }));
    }
  };

  // Live render preview
  useEffect(() => {
    if (!isOpen) return;
    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    // Render for preview (capped to max 320px for dialog performance)
    const previewScale = Math.min(16, settings.scale);
    const previewSettings = {
      ...settings,
      scale: previewScale,
      useCustomSize: false,
    };

    renderSpriteToCanvas(canvas, {
      width: canvasWidth,
      height: canvasHeight,
      layers,
      settings: previewSettings,
      bodyOffsetX,
      bodyOffsetY,
    });
  }, [isOpen, settings, canvasWidth, canvasHeight, layers, bodyOffsetX, bodyOffsetY]);

  if (!isOpen) return null;

  const currentExportWidth = settings.useCustomSize ? settings.customWidth : canvasWidth * settings.scale;
  const currentExportHeight = settings.useCustomSize ? settings.customHeight : canvasHeight * settings.scale;

  const handleDownload = () => {
    downloadPng({
      width: canvasWidth,
      height: canvasHeight,
      layers,
      settings,
      bodyOffsetX,
      bodyOffsetY,
    });
  };

  const handleCopy = async () => {
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
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-700/80 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800 bg-neutral-950/70">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">Export Character Sprite (PNG)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Preview */}
          <div className="flex flex-col items-center justify-center gap-3 bg-neutral-950 p-4 rounded-xl border border-neutral-800">
            <div className="text-xs font-medium text-neutral-400 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>Export Preview</span>
            </div>

            <div className="p-3 bg-neutral-900/60 rounded-lg border border-neutral-800 flex items-center justify-center min-h-[220px] w-full canvas-checkerboard">
              <canvas
                ref={previewCanvasRef}
                className="max-h-56 max-w-full object-contain pixelated shadow-xl"
              />
            </div>

            <div className="text-center">
              <div className="text-sm font-mono font-bold text-amber-400">
                {currentExportWidth} × {currentExportHeight} px
              </div>
              <div className="text-[11px] text-neutral-500">
                Pixel-perfect nearest-neighbor scaling
              </div>
            </div>
          </div>

          {/* Right: Settings */}
          <div className="space-y-4">
            {/* Resolution Multipliers */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">Resolution Scale Preset</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[1, 2, 4, 8, 16, 24, 32, 64].map(s => {
                  const isSelected = !settings.useCustomSize && settings.scale === s;
                  return (
                    <button
                      key={s}
                      onClick={() => handleScalePreset(s)}
                      className={`py-1.5 text-xs font-mono rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-amber-500 text-neutral-950 font-bold border-amber-400 shadow-md shadow-amber-500/20'
                          : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:border-neutral-500'
                      }`}
                    >
                      {s}x ({canvasWidth * s}px)
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Arbitrary Resolution */}
            <div className="space-y-1.5 p-2.5 bg-neutral-950/60 rounded-xl border border-neutral-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-300">Custom Dimensions</span>
                <button
                  onClick={() => setSettings(s => ({ ...s, maintainAspectRatio: !s.maintainAspectRatio }))}
                  className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white"
                  title="Lock aspect ratio"
                >
                  {settings.maintainAspectRatio ? <Lock className="w-3 h-3 text-amber-400" /> : <Unlock className="w-3 h-3 text-neutral-500" />}
                  <span>Aspect Ratio</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <span className="text-[10px] text-neutral-500 font-mono">Width (px)</span>
                  <input
                    type="number"
                    value={settings.customWidth}
                    onChange={(e) => handleCustomWidthChange(parseInt(e.target.value) || 1)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs font-mono text-white outline-none focus:border-amber-500"
                  />
                </div>
                <span className="text-neutral-500 mt-3 font-mono">×</span>
                <div className="flex-1">
                  <span className="text-[10px] text-neutral-500 font-mono">Height (px)</span>
                  <input
                    type="number"
                    value={settings.customHeight}
                    onChange={(e) => handleCustomHeightChange(parseInt(e.target.value) || 1)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs font-mono text-white outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Background options */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">Background</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'transparent', label: 'Transparent' },
                  { id: 'solid', label: 'Solid Color' },
                  { id: 'checkerboard', label: 'Checkerboard' },
                ].map(bg => (
                  <button
                    key={bg.id}
                    onClick={() => setSettings(s => ({ ...s, backgroundType: bg.id as any }))}
                    className={`py-1.5 px-2 text-xs rounded-lg border text-center transition-all ${
                      settings.backgroundType === bg.id
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                        : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'
                    }`}
                  >
                    {bg.label}
                  </button>
                ))}
              </div>

              {settings.backgroundType === 'solid' && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="color"
                    value={settings.backgroundColor}
                    onChange={(e) => setSettings(s => ({ ...s, backgroundColor: e.target.value }))}
                    className="w-8 h-8 rounded border border-neutral-700 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.backgroundColor}
                    onChange={(e) => setSettings(s => ({ ...s, backgroundColor: e.target.value }))}
                    className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs font-mono text-white uppercase w-24"
                  />
                </div>
              )}
            </div>

            {/* Extra Inclusions */}
            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.includeGuides}
                  onChange={(e) => setSettings(s => ({ ...s, includeGuides: e.target.checked }))}
                  className="rounded border-neutral-700 text-amber-500 focus:ring-amber-500"
                />
                <span>Include Retro Dev Body Outline Guides</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.includeNumbers}
                  onChange={(e) => setSettings(s => ({ ...s, includeNumbers: e.target.checked }))}
                  className="rounded border-neutral-700 text-amber-500 focus:ring-amber-500"
                />
                <span>Include Dimension Row Numbers (1-8, 11-20, etc.)</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.visibleLayersOnly}
                  onChange={(e) => setSettings(s => ({ ...s, visibleLayersOnly: e.target.checked }))}
                  className="rounded border-neutral-700 text-amber-500 focus:ring-amber-500"
                />
                <span>Export Visible Layers Only</span>
              </label>
            </div>

            {/* Filename */}
            <div className="space-y-1">
              <label className="text-[11px] text-neutral-400">File Name</label>
              <input
                type="text"
                value={settings.filename}
                onChange={(e) => setSettings(s => ({ ...s, filename: e.target.value }))}
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-neutral-800 bg-neutral-950/70">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-medium transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy PNG to Clipboard'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-2 text-xs text-neutral-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-xl text-xs font-bold shadow-lg shadow-amber-500/20 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download PNG ({currentExportWidth}×{currentExportHeight})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
