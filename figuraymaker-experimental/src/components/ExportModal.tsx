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
  defaultFilename?: string;
  onExportSuccess?: (filename: string, width: number, height: number) => void;
  onCopySuccess?: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  canvasWidth,
  canvasHeight,
  layers,
  bodyOffsetX = 0,
  bodyOffsetY = 0,
  defaultFilename,
  onExportSuccess,
  onCopySuccess,
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
    filename: defaultFilename || 'figuraymaker-sprite',
  });

  useEffect(() => {
    if (defaultFilename) {
      setSettings(prev => ({ ...prev, filename: defaultFilename }));
    }
  }, [defaultFilename, isOpen]);

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
    const filename = `${settings.filename || 'figuraymaker-sprite'}.png`;
    downloadPng({
      width: canvasWidth,
      height: canvasHeight,
      layers,
      settings,
      bodyOffsetX,
      bodyOffsetY,
    });
    onExportSuccess?.(filename, currentExportWidth, currentExportHeight);
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
      onCopySuccess?.();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="bg-surface-theme border border-ui-theme rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh] text-primary-theme">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-ui-theme bg-surface-raised-theme">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5" style={{ color: 'var(--text-accent)' }} />
            <h2 className="text-base font-bold text-primary-theme">Export Character Sprite (PNG)</h2>
          </div>
          <button
            onClick={onClose}
            className="retro-chrome-btn p-1.5 rounded-lg text-primary-theme cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Preview */}
          <div className="flex flex-col items-center justify-center gap-3 retro-inset-well p-4 rounded-xl">
            <div className="text-xs font-medium text-secondary-theme flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" style={{ color: 'var(--text-accent)' }} />
              <span>Export Preview</span>
            </div>

            <div className="p-3 bg-surface-raised-theme rounded-lg border border-ui-theme flex items-center justify-center min-h-[220px] w-full canvas-checkerboard">
              <canvas
                ref={previewCanvasRef}
                className="max-h-56 max-w-full object-contain pixelated shadow-xl"
              />
            </div>

            <div className="text-center">
              <div className="text-sm font-mono font-bold" style={{ color: 'var(--text-accent)' }}>
                {currentExportWidth} × {currentExportHeight} px
              </div>
              <div className="text-[11px] text-secondary-theme">
                Pixel-perfect nearest-neighbor scaling
              </div>
            </div>
          </div>

          {/* Right: Settings */}
          <div className="space-y-4">
            {/* Resolution Multipliers */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-primary-theme">Resolution Scale Preset</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[1, 2, 4, 8, 16, 24, 32, 64].map(s => {
                  const isSelected = !settings.useCustomSize && settings.scale === s;
                  return (
                    <button
                      key={s}
                      onClick={() => handleScalePreset(s)}
                      className={`py-1 px-1 text-xs font-mono rounded-lg border transition-all cursor-pointer flex flex-col items-center justify-center leading-tight ${
                        isSelected
                          ? 'bg-surface-raised-theme border-[var(--text-accent)] shadow-sm font-bold'
                          : 'retro-chrome-btn border-ui-theme text-secondary-theme'
                      }`}
                      style={isSelected ? { color: 'var(--text-accent)' } : undefined}
                    >
                      <span>{s}x</span>
                      <span className="text-[10px] opacity-80 font-normal">({canvasWidth * s}px)</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Arbitrary Resolution */}
            <div className="space-y-1.5 p-2.5 retro-inset-well rounded-xl">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-primary-theme">Custom Dimensions</span>
                <button
                  onClick={() => setSettings(s => ({ ...s, maintainAspectRatio: !s.maintainAspectRatio }))}
                  className="flex items-center gap-1 text-[11px] text-secondary-theme hover:text-primary-theme cursor-pointer"
                  title="Lock aspect ratio"
                >
                  {settings.maintainAspectRatio ? <Lock className="w-3 h-3" style={{ color: 'var(--text-accent)' }} /> : <Unlock className="w-3 h-3 opacity-50" />}
                  <span>Aspect Ratio</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <span className="text-[10px] text-secondary-theme font-mono">Width (px)</span>
                  <input
                    type="number"
                    value={settings.customWidth}
                    onChange={(e) => handleCustomWidthChange(parseInt(e.target.value) || 1)}
                    className="w-full bg-surface-raised-theme border border-ui-theme rounded px-2 py-1 text-xs font-mono text-primary-theme outline-none focus:border-[var(--text-accent)]"
                  />
                </div>
                <span className="text-secondary-theme mt-3 font-mono">×</span>
                <div className="flex-1">
                  <span className="text-[10px] text-secondary-theme font-mono">Height (px)</span>
                  <input
                    type="number"
                    value={settings.customHeight}
                    onChange={(e) => handleCustomHeightChange(parseInt(e.target.value) || 1)}
                    className="w-full bg-surface-raised-theme border border-ui-theme rounded px-2 py-1 text-xs font-mono text-primary-theme outline-none focus:border-[var(--text-accent)]"
                  />
                </div>
              </div>
            </div>

            {/* Background options */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-primary-theme">Background</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'transparent', label: 'Transparent' },
                  { id: 'solid', label: 'Solid Color' },
                  { id: 'checkerboard', label: 'Checkerboard' },
                ].map(bg => (
                  <button
                    key={bg.id}
                    onClick={() => setSettings(s => ({ ...s, backgroundType: bg.id as any }))}
                    className={`py-1.5 px-2 text-xs rounded-lg border text-center transition-all cursor-pointer ${
                      settings.backgroundType === bg.id
                        ? 'bg-surface-raised-theme border-[var(--text-accent)] shadow-sm font-bold'
                        : 'retro-chrome-btn border-ui-theme text-secondary-theme'
                    }`}
                    style={settings.backgroundType === bg.id ? { color: 'var(--text-accent)' } : undefined}
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
                    className="w-8 h-8 rounded border border-ui-theme cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.backgroundColor}
                    onChange={(e) => setSettings(s => ({ ...s, backgroundColor: e.target.value }))}
                    className="bg-surface-raised-theme border border-ui-theme rounded px-2 py-1 text-xs font-mono text-primary-theme uppercase w-24"
                  />
                </div>
              )}
            </div>

            {/* Extra Inclusions */}
            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2 text-xs text-primary-theme cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.includeGuides}
                  onChange={(e) => setSettings(s => ({ ...s, includeGuides: e.target.checked }))}
                  className="rounded border-ui-theme"
                />
                <span>Include Body Outline Guides</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-primary-theme cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.includeNumbers}
                  onChange={(e) => setSettings(s => ({ ...s, includeNumbers: e.target.checked }))}
                  className="rounded border-ui-theme"
                />
                <span>Include Dimension Row Numbers (1-8, 11-20, etc.)</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-primary-theme cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.visibleLayersOnly}
                  onChange={(e) => setSettings(s => ({ ...s, visibleLayersOnly: e.target.checked }))}
                  className="rounded border-ui-theme"
                />
                <span>Export Visible Layers Only</span>
              </label>
            </div>

            {/* Filename */}
            <div className="space-y-1">
              <label className="text-[11px] text-secondary-theme">File Name</label>
              <input
                type="text"
                value={settings.filename}
                onChange={(e) => setSettings(s => ({ ...s, filename: e.target.value }))}
                className="w-full bg-surface-raised-theme border border-ui-theme rounded px-2.5 py-1.5 text-xs text-primary-theme outline-none focus:border-[var(--text-accent)]"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-ui-theme bg-surface-raised-theme">
          <button
            onClick={handleCopy}
            className="retro-chrome-btn flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy PNG to Clipboard'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="retro-chrome-btn px-3 py-2 text-xs rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDownload}
              className="retro-gold-btn flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer"
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
