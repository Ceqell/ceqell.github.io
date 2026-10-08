import React, { useRef, useState, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  Layers, 
  Maximize2, 
  Minimize2,
  Eye, 
  EyeOff, 
  Sliders, 
  Pipette, 
  Move,
  X,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Info,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { ReferenceImage } from '../types/sprite';
import { CollapsibleSection } from './CollapsibleSection';
import { createDefaultReferenceImage } from '../constants/defaultReference';

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

  // Handle file uploads (multiple allowed, stored as permanent cross-origin Base64 Data URLs)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    let loadedCount = 0;
    const newRefs: ReferenceImage[] = [];

    fileList.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (!dataUrl) return;

        const img = new Image();
        img.onload = () => {
          newRefs.push({
            id: `ref-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            name: file.name.replace(/\.[^/.]+$/, ''),
            url: dataUrl,
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

          loadedCount++;
          if (loadedCount === fileList.length) {
            onAddReferences(newRefs);
          }
        };
        img.onerror = () => {
          loadedCount++;
          if (loadedCount === fileList.length && newRefs.length > 0) {
            onAddReferences(newRefs);
          }
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const activeRef = references.find(r => r.id === activeRefId) || references[0] || null;

  return (
    <CollapsibleSection
      id="references"
      title="References"
      icon={<ImageIcon className="w-3.5 h-3.5" style={{ color: 'var(--text-accent)' }} />}
      badge={<span className="text-[10px] text-secondary-theme font-mono">({references.length})</span>}
      defaultOpen={false}
      headerActions={
        <div className="flex items-center gap-1">
          <button
            onClick={() => onAddReferences([createDefaultReferenceImage()])}
            className="retro-chrome-btn flex items-center gap-1 px-1.5 py-0.5 rounded text-xs transition-colors cursor-pointer"
            title="Load Default Character Packages Template (Robloxian 2.0, Skeleton, iBot, Peter)"
          >
            <Sparkles className="w-3 h-3" style={{ color: 'var(--text-accent)' }} />
            <span className="hidden sm:inline text-[11px]">Template</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="retro-chrome-btn flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-colors cursor-pointer"
            title="Upload one or multiple images"
          >
            <Upload className="w-3 h-3" style={{ color: 'var(--text-accent)' }} />
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
      }
    >

      {references.length === 0 ? (
        <div className="p-4 text-center space-y-2.5">
          <div className="w-8 h-8 rounded-full retro-inset-well flex items-center justify-center mx-auto text-secondary-theme">
            <Upload className="w-4 h-4" />
          </div>
          <p className="text-xs text-primary-theme font-semibold">No reference images added yet.</p>
          <p className="text-[11px] text-secondary-theme leading-relaxed">
            Inspect character packages side-by-side or trace over guidelines pixel-by-pixel.
          </p>
          <div className="flex flex-col gap-1.5 pt-1">
            <button
              onClick={() => onAddReferences([createDefaultReferenceImage()])}
              className="retro-chrome-btn px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 mx-auto cursor-pointer shadow-xs"
              style={{ color: 'var(--text-accent)' }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Default Package Template</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs hover:underline font-medium cursor-pointer text-secondary-theme mt-1"
            >
              Or choose files from computer
            </button>
          </div>
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
                      ? 'bg-surface-raised-theme border-[var(--text-accent)] text-primary-theme shadow-sm font-semibold'
                      : 'bg-surface-theme border-ui-theme hover:bg-surface-raised-theme text-secondary-theme'
                  }`}
                >
                  <img
                    src={ref.url}
                    alt={ref.name}
                    className="w-8 h-8 rounded object-contain bg-surface-raised-theme border border-ui-theme shrink-0 pixelated"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate text-primary-theme">{ref.name}</div>
                    <div className="text-[10px] text-secondary-theme font-mono">
                      {ref.width}×{ref.height} px
                    </div>
                  </div>

                  {/* Trace Toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateReference(ref.id, { traceMode: !ref.traceMode });
                    }}
                    className={`retro-chrome-btn px-1.5 py-0.5 text-[10px] rounded cursor-pointer ${
                      ref.traceMode ? 'active font-bold' : 'text-secondary-theme'
                    }`}
                    style={ref.traceMode ? { color: 'var(--text-accent)' } : undefined}
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
                    className={`retro-chrome-btn p-1 rounded cursor-pointer ${
                      ref.windowOpen ? 'active' : 'text-secondary-theme'
                    }`}
                    style={ref.windowOpen ? { color: 'var(--text-accent)' } : undefined}
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
                    className="retro-chrome-btn p-1 rounded text-red-500 hover:text-red-600 cursor-pointer"
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
            <div className="p-2 retro-inset-well rounded-lg space-y-2 text-xs">
              <div className="flex items-center justify-between text-[11px] font-medium" style={{ color: 'var(--text-accent)' }}>
                <span className="flex items-center gap-1">
                  <Sliders className="w-3 h-3" />
                  Canvas Trace Settings: {activeRef.name}
                </span>
                <span className="font-mono text-[10px]">{Math.round(activeRef.traceOpacity * 100)}%</span>
              </div>

              {/* Opacity slider */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-secondary-theme w-12">Opacity</span>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.05"
                  value={activeRef.traceOpacity}
                  onChange={(e) => onUpdateReference(activeRef.id, { traceOpacity: parseFloat(e.target.value) })}
                  className="flex-1 cursor-pointer"
                />
              </div>

              {/* Scale slider */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-secondary-theme w-12">Scale</span>
                <input
                  type="range"
                  min="0.2"
                  max="3"
                  step="0.1"
                  value={activeRef.traceScale}
                  onChange={(e) => onUpdateReference(activeRef.id, { traceScale: parseFloat(e.target.value) })}
                  className="flex-1 cursor-pointer"
                />
                <span className="text-[10px] font-mono text-secondary-theme w-8 text-right">
                  {activeRef.traceScale.toFixed(1)}x
                </span>
              </div>

              {/* X / Y Offsets */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-secondary-theme w-12">Offset</span>
                <div className="flex items-center gap-1 flex-1">
                  <span className="text-[10px] text-secondary-theme">X:</span>
                  <input
                    type="number"
                    value={activeRef.traceX}
                    onChange={(e) => onUpdateReference(activeRef.id, { traceX: parseInt(e.target.value) || 0 })}
                    className="w-12 bg-surface-raised-theme px-1 py-0.5 rounded text-[11px] font-mono border border-ui-theme text-primary-theme"
                  />
                  <span className="text-[10px] text-secondary-theme ml-1">Y:</span>
                  <input
                    type="number"
                    value={activeRef.traceY}
                    onChange={(e) => onUpdateReference(activeRef.id, { traceY: parseInt(e.target.value) || 0 })}
                    className="w-12 bg-surface-raised-theme px-1 py-0.5 rounded text-[11px] font-mono border border-ui-theme text-primary-theme"
                  />
                  <button
                    onClick={() => onUpdateReference(activeRef.id, { traceX: 0, traceY: 0, traceScale: 1 })}
                    className="retro-chrome-btn ml-auto p-1 text-secondary-theme hover:text-primary-theme cursor-pointer rounded"
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
    </CollapsibleSection>
  );
};

// Floating Reference Popout Window with Zoom & Eyedropper Sampling!
interface FloatingReferenceProps {
  reference: ReferenceImage;
  onClose: () => void;
  onColorPick: (color: string) => void;
  onUpdateReference?: (id: string, updates: Partial<ReferenceImage>) => void;
}

export const FloatingReferenceWindow: React.FC<FloatingReferenceProps> = ({
  reference,
  onClose,
  onColorPick,
  onUpdateReference,
}) => {
  const [zoom, setZoom] = useState(reference.windowZoom ?? 1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState(() => ({
    x: reference.windowX ?? (typeof window !== 'undefined' && window.innerWidth < 768 ? 16 : 80),
    y: reference.windowY ?? 110,
  }));
  const [size, setSize] = useState(() => ({
    width: reference.windowWidth ?? (typeof window !== 'undefined' && window.innerWidth < 768 ? Math.min(320, window.innerWidth - 32) : 360),
    height: reference.windowHeight ?? 430,
  }));
  const [imgError, setImgError] = useState(false);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  // Maximize / Restore state
  const [isMaximized, setIsMaximized] = useState(false);
  const prevBoundsBeforeMaxRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);

  useEffect(() => {
    setImgError(false);
  }, [reference.url]);

  // Window drag state
  const [isWindowDragging, setIsWindowDragging] = useState(false);
  const windowDragStartRef = useRef({ x: 0, y: 0 });

  // Viewport image pan state
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const panOriginMouseRef = useRef({ x: 0, y: 0 });
  const panMovedDistRef = useRef(0);

  // Window resize state
  type ResizeDir = 'se' | 'e' | 's' | 'w' | 'n' | 'ne' | 'nw' | 'sw';
  const [resizingDir, setResizingDir] = useState<ResizeDir | null>(null);
  const resizeStartRef = useRef<{
    mouseX: number;
    mouseY: number;
    startX: number;
    startY: number;
    startW: number;
    startH: number;
    dir: ResizeDir;
  }>({ mouseX: 0, mouseY: 0, startX: 0, startY: 0, startW: 0, startH: 0, dir: 'se' });

  // Keep a synchronous ref of current bounds to avoid any stale closures
  const currentBoundsRef = useRef({
    x: position.x,
    y: position.y,
    width: size.width,
    height: size.height,
  });

  useEffect(() => {
    currentBoundsRef.current = {
      x: position.x,
      y: position.y,
      width: size.width,
      height: size.height,
    };
  }, [position.x, position.y, size.width, size.height]);

  const imgRef = useRef<HTMLImageElement>(null);

  // Global mouse handlers for window dragging, resizing, and viewport panning
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isWindowDragging) {
        const newX = Math.max(10, Math.min(window.innerWidth - 100, e.clientX - windowDragStartRef.current.x));
        const newY = Math.max(10, Math.min(window.innerHeight - 80, e.clientY - windowDragStartRef.current.y));
        setPosition({ x: newX, y: newY });
        currentBoundsRef.current.x = newX;
        currentBoundsRef.current.y = newY;
      }

      if (resizingDir) {
        const { mouseX, mouseY, startX, startY, startW, startH, dir } = resizeStartRef.current;
        const dx = e.clientX - mouseX;
        const dy = e.clientY - mouseY;

        const MIN_W = 250;
        const MIN_H = 200;
        const maxW = Math.max(MIN_W, window.innerWidth - 20);
        const maxH = Math.max(MIN_H, window.innerHeight - 20);

        let newW = startW;
        let newH = startH;
        let newX = startX;
        let newY = startY;

        if (dir.includes('e')) {
          newW = Math.min(maxW, Math.max(MIN_W, startW + dx));
        }
        if (dir.includes('s')) {
          newH = Math.min(maxH, Math.max(MIN_H, startH + dy));
        }
        if (dir.includes('w')) {
          const rawW = startW - dx;
          newW = Math.min(maxW, Math.max(MIN_W, rawW));
          newX = startX + (startW - newW);
        }
        if (dir.includes('n')) {
          const rawH = startH - dy;
          newH = Math.min(maxH, Math.max(MIN_H, rawH));
          newY = startY + (startH - newH);
        }

        setSize({ width: newW, height: newH });
        currentBoundsRef.current.width = newW;
        currentBoundsRef.current.height = newH;

        if (newX !== startX || newY !== startY) {
          setPosition({ x: newX, y: newY });
          currentBoundsRef.current.x = newX;
          currentBoundsRef.current.y = newY;
        }
      }

      if (isPanning) {
        const dx = e.clientX - panOriginMouseRef.current.x;
        const dy = e.clientY - panOriginMouseRef.current.y;
        panMovedDistRef.current = Math.hypot(dx, dy);

        setPan({
          x: e.clientX - panStartRef.current.x,
          y: e.clientY - panStartRef.current.y,
        });
      }
    };

    const handleGlobalMouseUp = (e: MouseEvent) => {
      if (isWindowDragging) {
        setIsWindowDragging(false);
        onUpdateReference?.(reference.id, {
          windowX: currentBoundsRef.current.x,
          windowY: currentBoundsRef.current.y,
        });
      }
      if (resizingDir) {
        setResizingDir(null);
        onUpdateReference?.(reference.id, {
          windowWidth: currentBoundsRef.current.width,
          windowHeight: currentBoundsRef.current.height,
          windowX: currentBoundsRef.current.x,
          windowY: currentBoundsRef.current.y,
        });
      }
      if (isPanning) {
        setIsPanning(false);
        // If mouse didn't drag (moved < 4px), treat as a deliberate click to sample color
        if (panMovedDistRef.current < 4) {
          sampleColorAt(e.clientX, e.clientY);
        }
      }
    };

    if (isWindowDragging || resizingDir || isPanning) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isWindowDragging, resizingDir, isPanning]);

  // Window header drag start
  const handleTitleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsWindowDragging(true);
    windowDragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  // Resize start for edge/corner handles
  const handleResizeStart = (e: React.MouseEvent, dir: ResizeDir) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingDir(dir);
    resizeStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: position.x,
      startY: position.y,
      startW: size.width,
      startH: size.height,
      dir,
    };
  };

  // Touch resize handler for mobile corner handle
  const touchResizeStartRef = useRef<{ touchX: number; touchY: number; startW: number; startH: number } | null>(null);

  const handleTouchResizeStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const t = e.touches[0];
      touchResizeStartRef.current = {
        touchX: t.clientX,
        touchY: t.clientY,
        startW: size.width,
        startH: size.height,
      };
    }
  };

  const handleTouchResizeMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && touchResizeStartRef.current) {
      const t = e.touches[0];
      const dx = t.clientX - touchResizeStartRef.current.touchX;
      const dy = t.clientY - touchResizeStartRef.current.touchY;
      const MIN_W = 250;
      const MIN_H = 200;
      const newW = Math.max(MIN_W, Math.min(window.innerWidth - 20, touchResizeStartRef.current.startW + dx));
      const newH = Math.max(MIN_H, Math.min(window.innerHeight - 20, touchResizeStartRef.current.startH + dy));
      setSize({ width: newW, height: newH });
      currentBoundsRef.current.width = newW;
      currentBoundsRef.current.height = newH;
    }
  };

  const handleTouchResizeEnd = () => {
    if (touchResizeStartRef.current) {
      touchResizeStartRef.current = null;
      onUpdateReference?.(reference.id, {
        windowWidth: currentBoundsRef.current.width,
        windowHeight: currentBoundsRef.current.height,
      });
    }
  };

  // Maximize / restore toggle
  const handleToggleMaximize = () => {
    if (isMaximized) {
      if (prevBoundsBeforeMaxRef.current) {
        setPosition({ x: prevBoundsBeforeMaxRef.current.x, y: prevBoundsBeforeMaxRef.current.y });
        setSize({ width: prevBoundsBeforeMaxRef.current.width, height: prevBoundsBeforeMaxRef.current.height });
        onUpdateReference?.(reference.id, {
          windowX: prevBoundsBeforeMaxRef.current.x,
          windowY: prevBoundsBeforeMaxRef.current.y,
          windowWidth: prevBoundsBeforeMaxRef.current.width,
          windowHeight: prevBoundsBeforeMaxRef.current.height,
        });
      }
      setIsMaximized(false);
    } else {
      prevBoundsBeforeMaxRef.current = {
        x: position.x,
        y: position.y,
        width: size.width,
        height: size.height,
      };
      const maxW = Math.min(840, Math.max(250, window.innerWidth - 60));
      const maxH = Math.min(680, Math.max(200, window.innerHeight - 100));
      const centerX = Math.max(20, Math.round((window.innerWidth - maxW) / 2));
      const centerY = Math.max(60, Math.round((window.innerHeight - maxH) / 2));
      setPosition({ x: centerX, y: centerY });
      setSize({ width: maxW, height: maxH });
      setIsMaximized(true);
      onUpdateReference?.(reference.id, {
        windowX: centerX,
        windowY: centerY,
        windowWidth: maxW,
        windowHeight: maxH,
      });
    }
  };

  // Viewport pan start
  const handleViewportMouseDown = (e: React.MouseEvent) => {
    if (imgError) return;
    if (e.button !== 0 && e.button !== 1) return;
    e.preventDefault();
    setIsPanning(true);
    panMovedDistRef.current = 0;
    panOriginMouseRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  // Wheel zoom in viewport
  const handleWheel = (e: React.WheelEvent) => {
    if (imgError) return;
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.25 : -0.25;
    setZoom(z => Math.max(0.25, Math.min(8, Math.round((z + delta) * 100) / 100)));
  };

  // Reset zoom & pan to 100%
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Fit image to current window dimensions
  const handleFitToWindow = () => {
    const availW = Math.max(100, size.width - 32);
    const availH = Math.max(100, size.height - 84);
    const naturalW = reference.width || 312;
    const naturalH = reference.height || 312;
    const fitScale = Math.min(availW / naturalW, availH / naturalH);
    const roundedFit = Math.max(0.25, Math.min(8, Math.round(fitScale * 100) / 100));

    if (Math.abs(zoom - roundedFit) < 0.05 && zoom !== 1) {
      setZoom(1);
    } else {
      setZoom(roundedFit);
    }
    setPan({ x: 0, y: 0 });
  };

  // Eyedrop directly from reference image at screen coordinates
  const sampleColorAt = (clientX: number, clientY: number) => {
    const img = imgRef.current;
    if (!img || imgError || !img.complete || img.naturalWidth === 0) return;

    const rect = img.getBoundingClientRect();
    if (
      clientX < rect.left || 
      clientX > rect.right || 
      clientY < rect.top || 
      clientY > rect.bottom
    ) {
      return; // outside image bounds
    }

    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;

    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;

    const naturalX = Math.floor(clickX * scaleX);
    const naturalY = Math.floor(clickY * scaleY);

    if (naturalX < 0 || naturalX >= img.naturalWidth || naturalY < 0 || naturalY >= img.naturalHeight) {
      return;
    }

    try {
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
    } catch {
      // Silently ignore if image is broken or cross-origin tainted
    }
  };

  // Touch handlers for mobile/tablet panning
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchDistRef = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (imgError) return;
    if (e.touches.length === 1) {
      const t = e.touches[0];
      touchStartRef.current = { x: t.clientX, y: t.clientY };
      panStartRef.current = { x: t.clientX - pan.x, y: t.clientY - pan.y };
      touchDistRef.current = 0;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (imgError) return;
    if (e.touches.length === 1 && touchStartRef.current) {
      const t = e.touches[0];
      const dist = Math.hypot(t.clientX - touchStartRef.current.x, t.clientY - touchStartRef.current.y);
      touchDistRef.current = dist;
      setPan({
        x: t.clientX - panStartRef.current.x,
        y: t.clientY - panStartRef.current.y,
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (imgError) return;
    if (touchStartRef.current && touchDistRef.current < 6 && e.changedTouches.length > 0) {
      const t = e.changedTouches[0];
      sampleColorAt(t.clientX, t.clientY);
    }
    touchStartRef.current = null;
  };

  // Replace image handler for legacy / broken / cross-origin links
  const handleReplaceImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpdateReference) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;
      const testImg = new Image();
      testImg.onload = () => {
        onUpdateReference(reference.id, {
          url: dataUrl,
          width: testImg.naturalWidth,
          height: testImg.naturalHeight,
        });
        setImgError(false);
      };
      testImg.src = dataUrl;
    };
    reader.readAsDataURL(file);

    if (replaceFileInputRef.current) replaceFileInputRef.current.value = '';
  };

  return (
    <div
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
      }}
      className={`fixed z-40 bg-surface-theme border border-ui-theme rounded-xl shadow-2xl overflow-hidden flex flex-col text-primary-theme ${
        resizingDir ? 'select-none pointer-events-auto' : ''
      }`}
    >
      {/* Title bar (draggable & double-click to toggle maximize) */}
      <div
        onMouseDown={handleTitleMouseDown}
        onDoubleClick={handleToggleMaximize}
        className="shrink-0 flex items-center justify-between px-3 py-2 bg-surface-raised-theme border-b border-ui-theme cursor-move select-none"
        title="Double click to maximize/restore • Drag to move"
      >
        <div className="flex items-center gap-1.5 text-xs font-medium text-primary-theme truncate mr-2">
          <Move className="w-3 h-3 shrink-0" style={{ color: 'var(--text-accent)' }} />
          <span className="truncate">{reference.name}</span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setZoom(z => Math.max(0.25, Math.round((z - 0.25) * 100) / 100))}
            className="retro-chrome-btn p-1 rounded text-primary-theme cursor-pointer"
            title="Zoom out"
          >
            <ZoomOut className="w-3 h-3" />
          </button>
          <button
            onClick={handleFitToWindow}
            className="retro-chrome-btn px-1.5 py-0.5 rounded text-[10px] font-mono text-secondary-theme hover:text-primary-theme cursor-pointer"
            title="Fit image to window (click again for 100%)"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={() => setZoom(z => Math.min(8, Math.round((z + 0.25) * 100) / 100))}
            className="retro-chrome-btn p-1 rounded text-primary-theme cursor-pointer"
            title="Zoom in"
          >
            <ZoomIn className="w-3 h-3" />
          </button>
          <button
            onClick={handleResetView}
            className="retro-chrome-btn p-1 rounded text-secondary-theme hover:text-primary-theme cursor-pointer"
            title="Recenter & Reset View (100%)"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
          <button
            onClick={handleToggleMaximize}
            className="retro-chrome-btn p-1 rounded text-secondary-theme hover:text-primary-theme cursor-pointer"
            title={isMaximized ? "Restore window size" : "Maximize window"}
          >
            {isMaximized ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </button>
          <button
            onClick={onClose}
            className="retro-chrome-btn p-1 rounded text-red-500 hover:text-red-600 transition-colors ml-0.5 cursor-pointer"
            title="Close reference"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Image Preview & Eyedropper area with virtual panning & zoom */}
      <div 
        onMouseDown={handleViewportMouseDown}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`relative p-0 bg-surface-raised-theme overflow-hidden flex-1 min-h-0 w-full flex items-center justify-center canvas-checkerboard select-none ${
          imgError ? 'cursor-default' : isPanning ? 'cursor-grabbing' : 'cursor-crosshair'
        }`}
        title={imgError ? undefined : "Click to sample color • Drag to pan • Scroll wheel to zoom"}
      >
        {imgError ? (
          <div className="flex flex-col items-center justify-center p-4 text-center gap-2 z-10">
            <AlertTriangle className="w-7 h-7 text-amber-500 shrink-0" />
            <span className="text-xs font-bold text-primary-theme">Image Link Unavailable</span>
            <span className="text-[10px] text-secondary-theme max-w-[210px] leading-relaxed">
              This reference was saved with an expired session or cross-origin restricted URL.
            </span>
            {onUpdateReference && (
              <>
                <button
                  type="button"
                  onClick={() => replaceFileInputRef.current?.click()}
                  className="retro-gold-btn px-2.5 py-1 text-xs font-semibold rounded mt-1 flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Re-upload Image</span>
                </button>
                <input
                  type="file"
                  ref={replaceFileInputRef}
                  accept="image/*"
                  onChange={handleReplaceImage}
                  className="hidden"
                />
              </>
            )}
          </div>
        ) : (
          <div
            style={{ 
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, 
              transformOrigin: 'center center',
              transition: isPanning || resizingDir ? 'none' : 'transform 75ms ease-out',
            }}
            className="relative shrink-0 flex items-center justify-center pointer-events-none"
          >
            <img
              ref={imgRef}
              src={reference.url}
              alt={reference.name}
              onError={() => setImgError(true)}
              style={{
                maxWidth: `${Math.max(160, size.width - 24)}px`,
                maxHeight: `${Math.max(120, size.height - 84)}px`,
              }}
              className="w-auto h-auto object-contain pixelated pointer-events-auto"
              draggable={false}
            />
          </div>
        )}
      </div>

      {/* Bottom Status & Info Bar */}
      <div className="shrink-0 px-3 py-1.5 bg-surface-raised-theme text-[10px] text-secondary-theme flex items-center justify-between border-t border-ui-theme relative select-none pr-7">
        <span className="flex items-center gap-1 truncate mr-2">
          <Pipette className="w-3 h-3 shrink-0" style={{ color: 'var(--text-accent)' }} />
          <span className="truncate">{imgError ? 'Image unavailable' : 'Click to sample • Drag to pan'}</span>
        </span>
        <div className="flex items-center gap-2 shrink-0 font-mono text-[9px] text-secondary-theme">
          <span>{reference.width}×{reference.height}px</span>
          <span className="opacity-40">|</span>
          <span title="Window size">{Math.round(size.width)}×{Math.round(size.height)}</span>
        </div>
      </div>

      {/* Edge & Corner Resize Drag Zones */}
      {/* Right Edge */}
      <div
        onMouseDown={(e) => handleResizeStart(e, 'e')}
        className="absolute top-2 bottom-6 -right-1 w-2 cursor-e-resize z-50 hover:bg-accent-theme/20 transition-colors"
        title="Drag to resize width"
      />
      {/* Bottom Edge */}
      <div
        onMouseDown={(e) => handleResizeStart(e, 's')}
        className="absolute left-2 right-6 -bottom-1 h-2 cursor-s-resize z-50 hover:bg-accent-theme/20 transition-colors"
        title="Drag to resize height"
      />
      {/* Left Edge */}
      <div
        onMouseDown={(e) => handleResizeStart(e, 'w')}
        className="absolute top-2 bottom-6 -left-1 w-2 cursor-w-resize z-50 hover:bg-accent-theme/20 transition-colors"
        title="Drag to resize width"
      />
      {/* Top Edge */}
      <div
        onMouseDown={(e) => handleResizeStart(e, 'n')}
        className="absolute left-6 right-6 -top-1 h-2 cursor-n-resize z-50 hover:bg-accent-theme/20 transition-colors"
        title="Drag to resize height"
      />
      {/* Top-Right Corner */}
      <div
        onMouseDown={(e) => handleResizeStart(e, 'ne')}
        className="absolute -top-1 -right-1 w-3.5 h-3.5 cursor-ne-resize z-50"
      />
      {/* Top-Left Corner */}
      <div
        onMouseDown={(e) => handleResizeStart(e, 'nw')}
        className="absolute -top-1 -left-1 w-3.5 h-3.5 cursor-nw-resize z-50"
      />
      {/* Bottom-Left Corner */}
      <div
        onMouseDown={(e) => handleResizeStart(e, 'sw')}
        className="absolute -bottom-1 -left-1 w-3.5 h-3.5 cursor-sw-resize z-50"
      />
      {/* Bottom-Right Corner (Primary visual grip handle + touch handler) */}
      <div
        onMouseDown={(e) => handleResizeStart(e, 'se')}
        onTouchStart={handleTouchResizeStart}
        onTouchMove={handleTouchResizeMove}
        onTouchEnd={handleTouchResizeEnd}
        className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize z-50 flex items-end justify-end p-1 group select-none"
        title="Drag to resize window"
      >
        <svg 
          className="w-3.5 h-3.5 text-secondary-theme group-hover:text-primary-theme transition-colors drop-shadow-sm pointer-events-none"
          viewBox="0 0 16 16" 
          fill="currentColor"
        >
          <circle cx="13" cy="13" r="1.3" />
          <circle cx="9" cy="13" r="1.3" />
          <circle cx="13" cy="9" r="1.3" />
          <circle cx="5" cy="13" r="1.3" />
          <circle cx="9" cy="9" r="1.3" />
          <circle cx="13" cy="5" r="1.3" />
        </svg>
      </div>
    </div>
  );
};
