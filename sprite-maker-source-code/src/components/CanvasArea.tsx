import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Layer, 
  ToolType, 
  ReferenceImage, 
  SelectionState 
} from '../types/sprite';
import { getBodyLayout, isHeadPixel } from '../constants/retroDev';
import { 
  getLinePoints, 
  getRectanglePoints, 
  getCirclePoints, 
  floodFill, 
  adjustBrightness 
} from '../utils/pixelMath';

interface CanvasAreaProps {
  canvasWidth: number;
  canvasHeight: number;
  layers: Layer[];
  activeLayerId: string;
  onUpdateLayerPixels: (layerId: string, newPixels: string[]) => void;
  currentTool: ToolType;
  currentColor: string;
  onColorPick: (color: string) => void;
  brushSize: number;
  showGrid: boolean;
  showGuides: boolean;
  showNumbers: boolean;
  symmetryActive: boolean;
  bodyOffsetX: number;
  bodyOffsetY: number;
  references: ReferenceImage[];
  selection: SelectionState;
  onUpdateSelection: (newSel: SelectionState) => void;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
}

export const CanvasArea: React.FC<CanvasAreaProps> = ({
  canvasWidth,
  canvasHeight,
  layers,
  activeLayerId,
  onUpdateLayerPixels,
  currentTool,
  currentColor,
  onColorPick,
  brushSize,
  showGrid,
  showGuides,
  showNumbers,
  symmetryActive,
  bodyOffsetX,
  bodyOffsetY,
  references,
  selection,
  onUpdateSelection,
  zoom,
  onZoomChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mainCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);

  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const [isDrawing, setIsDrawing] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
  const [hoverPixel, setHoverPixel] = useState<{ x: number; y: number } | null>(null);

  // Active layer
  const activeLayer = layers.find(l => l.id === activeLayerId);

  // Symmetry axis (centered on Torso)
  const layout = getBodyLayout(canvasWidth, canvasHeight, bodyOffsetX, bodyOffsetY);
  const symmetryAxisX = layout.torso.x + Math.floor(layout.torso.width / 2);

  // Helper to map canvas client coordinates to grid pixel coordinates
  const clientToPixel = useCallback((clientX: number, clientY: number) => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((clientX - rect.left) / rect.width) * canvasWidth);
    const y = Math.floor(((clientY - rect.top) / rect.height) * canvasHeight);
    return { x, y };
  }, [canvasWidth, canvasHeight]);

  // Main canvas render: Draw composite layers and trace overlays
  useEffect(() => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // 1. Draw Trace Reference Overlays (if enabled)
    references.forEach(ref => {
      if (ref.traceMode && ref.traceOpacity > 0) {
        const img = new Image();
        img.src = ref.url;
        if (img.complete) {
          ctx.save();
          ctx.globalAlpha = ref.traceOpacity;
          const targetW = canvasWidth * ref.traceScale;
          const targetH = (ref.height / ref.width) * targetW;
          ctx.drawImage(img, ref.traceX, ref.traceY, targetW, targetH);
          ctx.restore();
        }
      }
    });

    // 2. Draw all visible layers from bottom to top
    layers.forEach(layer => {
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
  }, [layers, references, canvasWidth, canvasHeight]);

  // Overlay Canvas Render: Grid, Retro Dev Guides, Numbers, Selection, Hover
  useEffect(() => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const displayW = canvasWidth * zoom;
    const displayH = canvasHeight * zoom;

    canvas.width = displayW;
    canvas.height = displayH;
    ctx.clearRect(0, 0, displayW, displayH);

    // 1. Pixel Grid
    if (showGrid && zoom >= 8) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= canvasWidth; x++) {
        ctx.beginPath();
        ctx.moveTo(x * zoom, 0);
        ctx.lineTo(x * zoom, displayH);
        ctx.stroke();
      }
      for (let y = 0; y <= canvasHeight; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * zoom);
        ctx.lineTo(displayW, y * zoom);
        ctx.stroke();
      }
    }

    // 2. Retro Dev Body Dimension Guides
    if (showGuides) {
      ctx.save();
      ctx.lineWidth = Math.max(1, Math.round(zoom * 0.06));

      // Head: Yellow rounded outline (9x8)
      ctx.strokeStyle = '#F5CD2F';
      for (let ly = 0; ly < layout.head.height; ly++) {
        for (let lx = 0; lx < layout.head.width; lx++) {
          if (isHeadPixel(lx, ly)) {
            const gx = layout.head.x + lx;
            const gy = layout.head.y + ly;
            ctx.strokeRect(gx * zoom, gy * zoom, zoom, zoom);
          }
        }
      }

      // Left Arm: 5x10 yellow
      ctx.strokeStyle = '#E5C02A';
      ctx.strokeRect(
        layout.leftArm.x * zoom,
        layout.leftArm.y * zoom,
        layout.leftArm.width * zoom,
        layout.leftArm.height * zoom
      );

      // Right Arm: 5x10 yellow
      ctx.strokeRect(
        layout.rightArm.x * zoom,
        layout.rightArm.y * zoom,
        layout.rightArm.width * zoom,
        layout.rightArm.height * zoom
      );

      // Torso: 11x10 cyan
      ctx.strokeStyle = '#00D4FF';
      ctx.strokeRect(
        layout.torso.x * zoom,
        layout.torso.y * zoom,
        layout.torso.width * zoom,
        layout.torso.height * zoom
      );

      // Legs: 11x10 green
      ctx.strokeStyle = '#39FF14';
      ctx.strokeRect(
        layout.legs.x * zoom,
        layout.legs.y * zoom,
        layout.legs.width * zoom,
        layout.legs.height * zoom
      );

      // Legs center seam: 1px divider
      ctx.strokeStyle = '#FF0055';
      ctx.strokeRect(
        layout.legs.seamCol * zoom,
        layout.legs.y * zoom,
        zoom,
        layout.legs.height * zoom
      );

      ctx.restore();
    }

    // 3. Exact Dimension Numbers Overlay (like 1000.png!)
    if (showNumbers && zoom >= 10) {
      ctx.save();
      const fontSize = Math.max(8, Math.floor(zoom * 0.45));
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Head: Pink numbers 1-8
      ctx.fillStyle = '#FF66CC';
      for (let i = 1; i <= 8; i++) {
        const rowFromBottom = i - 1;
        const ly = layout.head.height - 1 - rowFromBottom;
        const py = (layout.head.y + ly + 0.5) * zoom;
        const px = (layout.head.x + 0.5) * zoom;
        ctx.fillText(i.toString(), px, py);
      }

      // Torso: Cyan numbers 11-20
      ctx.fillStyle = '#00F0FF';
      for (let i = 11; i <= 20; i++) {
        const rowFromTop = 20 - i;
        const py = (layout.torso.y + rowFromTop + 0.5) * zoom;
        const px = (layout.torso.x + 0.5) * zoom;
        ctx.fillText(i.toString(), px, py);
      }

      // Right Arm: Yellow numbers 1-10
      ctx.fillStyle = '#FFEE33';
      for (let i = 1; i <= 10; i++) {
        const rowFromBottom = i - 1;
        const py = (layout.rightArm.y + layout.rightArm.height - 1 - rowFromBottom + 0.5) * zoom;
        const px = (layout.rightArm.x + 0.5) * zoom;
        ctx.fillText(i.toString(), px, py);
      }

      // Legs: Red numbers 1-10 vertically, 1-11 horizontally
      ctx.fillStyle = '#FF3333';
      for (let i = 1; i <= 10; i++) {
        const rowFromBottom = i - 1;
        const py = (layout.legs.y + layout.legs.height - 1 - rowFromBottom + 0.5) * zoom;
        const px = (layout.legs.x + 0.5) * zoom;
        ctx.fillText(i.toString(), px, py);
      }

      ctx.restore();
    }

    // 4. Vertical Symmetry Line (if enabled)
    if (symmetryActive) {
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.5;
      const symX = (symmetryAxisX + 0.5) * zoom;
      ctx.beginPath();
      ctx.moveTo(symX, 0);
      ctx.lineTo(symX, displayH);
      ctx.stroke();
      ctx.restore();
    }

    // 5. Selection Marquee
    if (selection.active) {
      ctx.save();
      const minX = Math.min(selection.startX, selection.endX);
      const maxX = Math.max(selection.startX, selection.endX);
      const minY = Math.min(selection.startY, selection.endY);
      const maxY = Math.max(selection.startY, selection.endY);

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(
        minX * zoom,
        minY * zoom,
        (maxX - minX + 1) * zoom,
        (maxY - minY + 1) * zoom
      );
      ctx.restore();
    }

    // 6. Hover Pixel Box
    if (hoverPixel && hoverPixel.x >= 0 && hoverPixel.x < canvasWidth && hoverPixel.y >= 0 && hoverPixel.y < canvasHeight) {
      ctx.save();
      ctx.strokeStyle = '#FFCC00';
      ctx.lineWidth = 1.5;
      const radius = Math.floor((brushSize - 1) / 2);
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const px = hoverPixel.x + dx;
          const py = hoverPixel.y + dy;
          if (px >= 0 && px < canvasWidth && py >= 0 && py < canvasHeight) {
            ctx.strokeRect(px * zoom, py * zoom, zoom, zoom);
          }
        }
      }
      ctx.restore();
    }
  }, [
    zoom, 
    canvasWidth, 
    canvasHeight, 
    showGrid, 
    showGuides, 
    showNumbers, 
    symmetryActive, 
    symmetryAxisX, 
    selection, 
    hoverPixel, 
    brushSize,
    layout
  ]);

  // Apply pixel changes to active layer with symmetry support
  const applyPixelPoints = (points: { x: number; y: number }[], color: string | 'erase' | 'lighten' | 'darken') => {
    if (!activeLayer || activeLayer.locked) return;

    let newPixels = [...activeLayer.pixels];

    // Expand points by brushSize
    const expandedPoints: { x: number; y: number }[] = [];
    const radius = Math.floor((brushSize - 1) / 2);

    points.forEach(p => {
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          expandedPoints.push({ x: p.x + dx, y: p.y + dy });
          // If symmetry active, mirror along symmetryAxisX
          if (symmetryActive) {
            const distFromAxis = (p.x + dx) - symmetryAxisX;
            const mirroredX = symmetryAxisX - distFromAxis;
            expandedPoints.push({ x: mirroredX, y: p.y + dy });
          }
        }
      }
    });

    expandedPoints.forEach(p => {
      if (p.x >= 0 && p.x < canvasWidth && p.y >= 0 && p.y < canvasHeight) {
        const idx = p.y * canvasWidth + p.x;
        if (color === 'erase') {
          newPixels[idx] = '';
        } else if (color === 'lighten') {
          newPixels[idx] = adjustBrightness(newPixels[idx], 25);
        } else if (color === 'darken') {
          newPixels[idx] = adjustBrightness(newPixels[idx], -25);
        } else {
          newPixels[idx] = color;
        }
      }
    });

    onUpdateLayerPixels(activeLayer.id, newPixels);
  };

  const [isSpacePressed, setIsSpacePressed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Middle click, Space+Click, or Alt+Click: Pan canvas
    if (e.button === 1 || isSpacePressed || e.altKey) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    if (e.button !== 0) return; // Left click only for tools
    const pixel = clientToPixel(e.clientX, e.clientY);
    if (!pixel) return;

    setIsDrawing(true);
    setDragStartPos(pixel);

    if (currentTool === 'eyedropper') {
      // Sample color from active layer or topmost visible layer
      for (let i = layers.length - 1; i >= 0; i--) {
        const l = layers[i];
        if (l.visible) {
          const c = l.pixels[pixel.y * canvasWidth + pixel.x];
          if (c && c !== '') {
            onColorPick(c);
            break;
          }
        }
      }
      return;
    }

    if (currentTool === 'bucket') {
      if (!activeLayer || activeLayer.locked) return;
      const updated = floodFill(
        activeLayer.pixels,
        canvasWidth,
        canvasHeight,
        pixel.x,
        pixel.y,
        currentColor
      );
      onUpdateLayerPixels(activeLayer.id, updated);
      return;
    }

    if (currentTool === 'replace') {
      if (!activeLayer || activeLayer.locked) return;
      const target = activeLayer.pixels[pixel.y * canvasWidth + pixel.x] || '';
      if (target.toLowerCase() !== currentColor.toLowerCase()) {
        const updated = activeLayer.pixels.map(p => 
          (p || '').toLowerCase() === target.toLowerCase() ? currentColor : p
        );
        onUpdateLayerPixels(activeLayer.id, updated);
      }
      return;
    }

    if (currentTool === 'pencil') {
      applyPixelPoints([pixel], currentColor);
    } else if (currentTool === 'eraser') {
      applyPixelPoints([pixel], 'erase');
    } else if (currentTool === 'lighten') {
      applyPixelPoints([pixel], 'lighten');
    } else if (currentTool === 'darken') {
      applyPixelPoints([pixel], 'darken');
    } else if (currentTool === 'select') {
      onUpdateSelection({
        active: true,
        startX: pixel.x,
        startY: pixel.y,
        endX: pixel.x,
        endY: pixel.y,
        floating: false,
        floatingX: 0,
        floatingY: 0,
        floatingWidth: 0,
        floatingHeight: 0,
        floatingPixels: [],
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
      return;
    }

    const pixel = clientToPixel(e.clientX, e.clientY);
    setHoverPixel(pixel);
    if (!pixel) return;

    if (!isDrawing) return;

    if (currentTool === 'pencil') {
      applyPixelPoints([pixel], currentColor);
    } else if (currentTool === 'eraser') {
      applyPixelPoints([pixel], 'erase');
    } else if (currentTool === 'select' && dragStartPos) {
      onUpdateSelection({
        ...selection,
        active: true,
        startX: dragStartPos.x,
        startY: dragStartPos.y,
        endX: pixel.x,
        endY: pixel.y,
      });
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (!isDrawing) return;
    setIsDrawing(false);

    const pixel = clientToPixel(e.clientX, e.clientY);
    if (dragStartPos && pixel) {
      if (currentTool === 'line') {
        const points = getLinePoints(dragStartPos.x, dragStartPos.y, pixel.x, pixel.y);
        applyPixelPoints(points, currentColor);
      } else if (currentTool === 'rectangle') {
        const points = getRectanglePoints(dragStartPos.x, dragStartPos.y, pixel.x, pixel.y, false);
        applyPixelPoints(points, currentColor);
      } else if (currentTool === 'rectangle_fill') {
        const points = getRectanglePoints(dragStartPos.x, dragStartPos.y, pixel.x, pixel.y, true);
        applyPixelPoints(points, currentColor);
      } else if (currentTool === 'circle') {
        const points = getCirclePoints(dragStartPos.x, dragStartPos.y, pixel.x, pixel.y, false);
        applyPixelPoints(points, currentColor);
      } else if (currentTool === 'circle_fill') {
        const points = getCirclePoints(dragStartPos.x, dragStartPos.y, pixel.x, pixel.y, true);
        applyPixelPoints(points, currentColor);
      }
    }

    setDragStartPos(null);
  };

  // Zoom with mouse wheel
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 1 : -1;
    const newZoom = Math.max(4, Math.min(64, zoom + delta * 2));
    onZoomChange(newZoom);
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      className={`relative flex-1 h-full w-full overflow-hidden flex items-center justify-center bg-neutral-950 canvas-checkerboard select-none ${
        isPanning ? 'cursor-grab' : 'cursor-crosshair'
      }`}
    >
      {/* Centered Drawing Stage with Pan & Zoom */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px)`,
          width: `${canvasWidth * zoom}px`,
          height: `${canvasHeight * zoom}px`,
        }}
        className="relative shadow-2xl transition-transform duration-75 ease-out shrink-0"
      >
        {/* Main Composite Canvas (low resolution scaled with CSS pixelated) */}
        <canvas
          ref={mainCanvasRef}
          width={canvasWidth}
          height={canvasHeight}
          style={{
            width: '100%',
            height: '100%',
          }}
          className="absolute inset-0 pixelated"
        />

        {/* Overlay Canvas (high resolution for crisp lines, guides, numbers, hover) */}
        <canvas
          ref={overlayCanvasRef}
          style={{
            width: '100%',
            height: '100%',
          }}
          className="absolute inset-0 pointer-events-none"
        />
      </div>

      {/* Coordinate & Zoom pill indicator in bottom left */}
      <div className="absolute bottom-3 left-3 bg-neutral-900/90 backdrop-blur border border-neutral-800 rounded-lg px-2.5 py-1 text-xs font-mono text-neutral-300 flex items-center gap-3 shadow-lg pointer-events-none">
        <div>
          {hoverPixel && hoverPixel.x >= 0 && hoverPixel.x < canvasWidth && hoverPixel.y >= 0 && hoverPixel.y < canvasHeight ? (
            <span>
              X: <span className="text-amber-400">{hoverPixel.x}</span> Y: <span className="text-amber-400">{hoverPixel.y}</span>
            </span>
          ) : (
            <span className="text-neutral-500">X: -- Y: --</span>
          )}
        </div>
        <div className="w-px h-3 bg-neutral-700" />
        <span className="text-neutral-400">
          Canvas: <span className="text-white">{canvasWidth}×{canvasHeight}</span>
        </span>
        <div className="w-px h-3 bg-neutral-700" />
        <span className="text-amber-400 font-bold">{Math.round((zoom / 16) * 100)}%</span>
      </div>
    </div>
  );
};
