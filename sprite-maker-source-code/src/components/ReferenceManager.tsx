import React, { useRef, useState } from 'react';
import { 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  Layers, 
  Maximize2, 
  Eye, 
  EyeOff, 
  Sliders, 
  Pipette, 
  Move,
  X,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Info
} from 'lucide-react';
import { ReferenceImage } from '../types/sprite';

interface ReferenceManagerProps {
  references: ReferenceImage[];
  onAddReferences: (newRefs: ReferenceImage[]) => void;
  onUpdateReference: (id: string, updates: Partial<ReferenceImage>) => void;
  onDeleteReference: (id: string) => void;
  activeRefId: string | null;
  onSelectRef: (id: string | null) => void;
  onColorPick: (color: string) => void;
}

export const ReferenceManager: React.FC<ReferenceManagerProps> = ({
  references,
  onAddReferences,
  onUpdateReference,
  onDeleteReference,
  activeRefId,
  onSelectRef,
  onColorPick,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'trace'>('list');

  // Handle file uploads (multiple allowed)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newRefs: ReferenceImage[] = [];
    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        newRefs.push({
          id: `ref-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: file.name.replace(/\.[^/.]+$/, ''),
          url,
          width: img.naturalWidth,
          height: img.naturalHeight,
          traceMode: false,
          traceOpacity: 0.45,
          traceX: 0,
          traceY: 0,
          traceScale: 1,
          windowOpen: true,
          windowZoom: 1,
        });

        if (newRefs.length === files.length) {
          onAddReferences(newRefs);
        }
      };
      img.src = url;
    });

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const activeRef = references.find(r => r.id === activeRefId) || references[0] || null;

  return (
    <div className="flex flex-col bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl text-neutral-200 w-full max-h-[360px]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-800 bg-neutral-950/60">
        <div className="flex items-center gap-1.5 font-medium text-xs text-neutral-300">
          <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
          <span>References</span>
          <span className="text-[10px] text-neutral-500 font-mono">({references.length})</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-xs transition-colors"
            title="Upload one or multiple images"
          >
            <Upload className="w-3 h-3" />
            <span>Upload</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
          />
        </div>
      </div>

      {references.length === 0 ? (
        <div className="p-4 text-center space-y-2">
          <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
            <Upload className="w-4 h-4" />
          </div>
          <p className="text-xs text-neutral-400">No reference images added yet.</p>
          <p className="text-[11px] text-neutral-500">
            Upload character skins, packages (like iBot), or clothing designs to trace or inspect side-by-side.
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-amber-400 hover:text-amber-300 underline font-medium"
          >
            Choose files from computer
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {/* Reference List */}
          <div className="space-y-1.5">
            {references.map((ref) => {
              const isSelected = ref.id === activeRef?.id;
              return (
                <div
                  key={ref.id}
                  onClick={() => onSelectRef(ref.id)}
                  className={`flex items-center gap-2 p-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/40 text-white'
                      : 'bg-neutral-900/60 border-neutral-800 hover:bg-neutral-800 text-neutral-300'
                  }`}
                >
                  <img
                    src={ref.url}
                    alt={ref.name}
                    className="w-8 h-8 rounded object-contain bg-neutral-950 border border-neutral-700 shrink-0 pixelated"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{ref.name}</div>
                    <div className="text-[10px] text-neutral-500 font-mono">
                      {ref.width}×{ref.height} px
                    </div>
                  </div>

                  {/* Trace Toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateReference(ref.id, { traceMode: !ref.traceMode });
                    }}
                    className={`px-1.5 py-0.5 text-[10px] rounded border transition-colors ${
                      ref.traceMode
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'
                    }`}
                    title="Overlay on drawing canvas for tracing"
                  >
                    Trace
                  </button>

                  {/* Window Popup Toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateReference(ref.id, { windowOpen: !ref.windowOpen });
                    }}
                    className={`p-1 rounded hover:bg-neutral-700 ${
                      ref.windowOpen ? 'text-amber-400' : 'text-neutral-500'
                    }`}
                    title={ref.windowOpen ? 'Hide Floating Window' : 'Open Floating Window'}
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteReference(ref.id);
                    }}
                    className="p-1 rounded text-neutral-500 hover:text-red-400 hover:bg-neutral-700"
                    title="Delete reference"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Active Reference Settings if Trace is enabled */}
          {activeRef && activeRef.traceMode && (
            <div className="p-2 bg-neutral-950/80 rounded-lg border border-cyan-500/30 space-y-2 text-xs">
              <div className="flex items-center justify-between text-cyan-400 text-[11px] font-medium">
                <span className="flex items-center gap-1">
                  <Sliders className="w-3 h-3" />
                  Canvas Trace Settings: {activeRef.name}
                </span>
                <span className="font-mono text-[10px]">{Math.round(activeRef.traceOpacity * 100)}%</span>
              </div>

              {/* Opacity slider */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-neutral-400 w-12">Opacity</span>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.05"
                  value={activeRef.traceOpacity}
                  onChange={(e) => onUpdateReference(activeRef.id, { traceOpacity: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400 h-1 bg-neutral-800 rounded cursor-pointer"
                />
              </div>

              {/* Scale slider */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-neutral-400 w-12">Scale</span>
                <input
                  type="range"
                  min="0.2"
                  max="3"
                  step="0.1"
                  value={activeRef.traceScale}
                  onChange={(e) => onUpdateReference(activeRef.id, { traceScale: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400 h-1 bg-neutral-800 rounded cursor-pointer"
                />
                <span className="text-[10px] font-mono text-neutral-400 w-8 text-right">
                  {activeRef.traceScale.toFixed(1)}x
                </span>
              </div>

              {/* X / Y Offsets */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-neutral-400 w-12">Offset</span>
                <div className="flex items-center gap-1 flex-1">
                  <span className="text-[10px] text-neutral-500">X:</span>
                  <input
                    type="number"
                    value={activeRef.traceX}
                    onChange={(e) => onUpdateReference(activeRef.id, { traceX: parseInt(e.target.value) || 0 })}
                    className="w-12 bg-neutral-800 px-1 py-0.5 rounded text-[11px] font-mono border border-neutral-700"
                  />
                  <span className="text-[10px] text-neutral-500 ml-1">Y:</span>
                  <input
                    type="number"
                    value={activeRef.traceY}
                    onChange={(e) => onUpdateReference(activeRef.id, { traceY: parseInt(e.target.value) || 0 })}
                    className="w-12 bg-neutral-800 px-1 py-0.5 rounded text-[11px] font-mono border border-neutral-700"
                  />
                  <button
                    onClick={() => onUpdateReference(activeRef.id, { traceX: 0, traceY: 0, traceScale: 1 })}
                    className="ml-auto p-1 hover:text-white text-neutral-500"
                    title="Reset offset & scale"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Floating Reference Popout Window with Zoom & Eyedropper Sampling!
interface FloatingReferenceProps {
  reference: ReferenceImage;
  onClose: () => void;
  onColorPick: (color: string) => void;
}

export const FloatingReferenceWindow: React.FC<FloatingReferenceProps> = ({
  reference,
  onClose,
  onColorPick,
}) => {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 80, y: 120 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: Math.max(10, Math.min(window.innerWidth - 200, e.clientX - dragStart.x)),
        y: Math.max(10, Math.min(window.innerHeight - 200, e.clientY - dragStart.y)),
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  // Eyedrop directly from reference image
  const handleSampleColor = (e: React.MouseEvent<HTMLImageElement>) => {
    const img = imgRef.current;
    if (!img) return;

    const rect = img.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;

    const naturalX = Math.floor(clickX * scaleX);
    const naturalY = Math.floor(clickY * scaleY);

    // Draw on hidden canvas to sample pixel
    const hiddenCanvas = document.createElement('canvas');
    hiddenCanvas.width = img.naturalWidth;
    hiddenCanvas.height = img.naturalHeight;
    const ctx = hiddenCanvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(img, 0, 0);
    const pixel = ctx.getImageData(naturalX, naturalY, 1, 1).data;
    if (pixel[3] > 0) {
      const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1).toUpperCase()}`;
      onColorPick(hex);
    }
  };

  return (
    <div
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="fixed z-40 bg-neutral-900/95 backdrop-blur-md border border-neutral-700/80 rounded-xl shadow-2xl overflow-hidden flex flex-col w-72 max-w-[90vw]"
    >
      {/* Title bar (draggable) */}
      <div
        onMouseDown={handleMouseDown}
        className="flex items-center justify-between px-3 py-2 bg-neutral-950 border-b border-neutral-800 cursor-move select-none"
      >
        <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-300 truncate">
          <Move className="w-3 h-3 text-amber-400" />
          <span className="truncate">{reference.name}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
            className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white"
            title="Zoom out"
          >
            <ZoomOut className="w-3 h-3" />
          </button>
          <span className="text-[10px] font-mono text-neutral-400">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(z => Math.min(4, z + 0.25))}
            className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white"
            title="Zoom in"
          >
            <ZoomIn className="w-3 h-3" />
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 rounded transition-colors ml-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Image Preview & Eyedropper area */}
      <div className="relative p-2 bg-neutral-950/80 overflow-auto max-h-72 flex items-center justify-center canvas-checkerboard">
        <img
          ref={imgRef}
          src={reference.url}
          alt={reference.name}
          onClick={handleSampleColor}
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          className="max-w-full max-h-64 object-contain pixelated cursor-crosshair transition-transform"
          title="Click anywhere to eyedrop & sample color!"
        />
      </div>

      <div className="px-3 py-1.5 bg-neutral-950 text-[10px] text-neutral-400 flex items-center justify-between border-t border-neutral-800">
        <span className="flex items-center gap-1">
          <Pipette className="w-3 h-3 text-amber-400" />
          Click image to sample color
        </span>
        <span className="font-mono text-neutral-500">{reference.width}×{reference.height}px</span>
      </div>
    </div>
  );
};
