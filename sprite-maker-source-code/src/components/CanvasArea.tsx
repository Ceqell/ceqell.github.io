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
  adjustBrightness,
  getPolygonEnclosedPixels
} from '../utils/pixelMath';
import { 
  Trash2, 
  Move, 
  Check, 
  X, 
  FlipHorizontal, 
  FlipVertical 
} from 'lucide-react';

interface CanvasAreaProps {
  canvasWidth: number;
  canvasHeight: number;
  layers: Layer[];
  activeLayerId: string;
  onUpdateLayerPixels: (layerId: string, newPixels: string[], commitHistory?: boolean) => void;
  onCommitHistory?: (layerId?: string) => void;
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
  onGuideOffsetChange?: (offset: { x: number; y: number }) => void;
  isMovingGuide?: boolean;
  onToggleMoveGuide?: () => void;
  onCenterGuide?: () => void;
  references: ReferenceImage[];
  selection: SelectionState;
  onUpdateSelection: (newSel: SelectionState) => void;
  onDeleteSelection?: () => void;
  onCommitFloatingSelection?: () => void;
  onFlipHorizontalSelection?: () => void;
  onFlipVerticalSelection?: () => void;
  onClearSelection?: () => void;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  animationsEnabled?: boolean;
}

export const CanvasArea: React.FC<CanvasAreaProps> = ({
  canvasWidth,
  canvasHeight,
  layers,
  activeLayerId,
  onUpdateLayerPixels,
  onCommitHistory,
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
  onGuideOffsetChange,
  isMovingGuide = false,
  onToggleMoveGuide,
  onCenterGuide,
  references,
  selection,
  onUpdateSelection,
  onDeleteSelection,
  onCommitFloatingSelection,
  onFlipHorizontalSelection,
  onFlipVerticalSelection,
  onClearSelection,
  zoom,
  onZoomChange,
  animationsEnabled = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mainCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);

  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const [isDrawing, setIsDrawing] = useState(false);
  const strokeModifiedRef = useRef<boolean>(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
  const [hoverPixel, setHoverPixel] = useState<{ x: number; y: number } | null>(null);

  // Guide dragging state
  const [isDraggingGuide, setIsDraggingGuide] = useState<boolean>(false);
  const guideDragStart = useRef<{ mouseX: number; mouseY: number; initialX: number; initialY: number } | null>(null);

  // Mobile Touch Gestures State (1-finger draw, 2-finger pinch & pan)
  const touchState = useRef<{
    mode: 'none' | 'draw' | 'pinch';
    initialDist: number;
    initialZoom: number;
    initialPan: { x: number; y: number };
    initialCenter: { x: number; y: number };
  }>({
    mode: 'none',
    initialDist: 0,
    initialZoom: 18,
    initialPan: { x: 0, y: 0 },
    initialCenter: { x: 0, y: 0 },
  });

  // Active layer
  const activeLayer = layers.find(l => l.id === activeLayerId);

  // Moving selection state
  const [isMovingSelection, setIsMovingSelection] = useState<boolean>(false);
  const selectionMoveStart = useRef<{
    startPixel: { x: number; y: number };
    initialFloatingX: number;
    initialFloatingY: number;
  } | null>(null);

  // Lasso drawing state
  const [isLassoing, setIsLassoing] = useState<boolean>(false);
  const [lassoPoints, setLassoPoints] = useState<{ x: number; y: number }[]>([]);
  const lassoPointsRef = useRef<{ x: number; y: number }[]>([]);

  // Fast Set lookup for lasso selected pixel keys
  const lassoKeySet = React.useMemo(() => {
    if (selection.type === 'lasso' && selection.selectedPixelKeys) {
      return new Set(selection.selectedPixelKeys);
    }
    return null;
  }, [selection.type, selection.selectedPixelKeys]);

  // Check if pixel is inside the active selection
  const isPixelInSelection = useCallback((pixel: { x: number; y: number } | null) => {
    if (!pixel || !selection.active) return false;
    if (selection.floating) {
      const relX = pixel.x - selection.floatingX;
      const relY = pixel.y - selection.floatingY;
      if (relX >= 0 && relX < selection.floatingWidth && relY >= 0 && relY < selection.floatingHeight) {
        if (selection.floatingMask) {
          return !!selection.floatingMask[relY * selection.floatingWidth + relX];
        }
        return true;
      }
      return false;
    }
    if (selection.type === 'lasso' && lassoKeySet) {
      return lassoKeySet.has(`${pixel.x},${pixel.y}`);
    }
    const minX = Math.min(selection.startX, selection.endX);
    const maxX = Math.max(selection.startX, selection.endX);
    const minY = Math.min(selection.startY, selection.endY);
    const maxY = Math.max(selection.startY, selection.endY);
    return pixel.x >= minX && pixel.x <= maxX && pixel.y >= minY && pixel.y <= maxY;
  }, [selection, lassoKeySet]);

  // Finish freehand lasso selection
  const finishLassoSelection = useCallback((points: { x: number; y: number }[]) => {
    if (points.length < 3) {
      onClearSelection?.();
      return;
    }
    const enclosed = getPolygonEnclosedPixels(points);
    if (enclosed.length === 0) {
      onClearSelection?.();
      return;
    }

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    const selectedPixelKeys: string[] = [];

    enclosed.forEach(p => {
      if (p.x >= 0 && p.x < canvasWidth && p.y >= 0 && p.y < canvasHeight) {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
        selectedPixelKeys.push(`${p.x},${p.y}`);
      }
    });

    if (selectedPixelKeys.length > 0) {
      onUpdateSelection({
        active: true,
        type: 'lasso',
        startX: minX,
        startY: minY,
        endX: maxX,
        endY: maxY,
        selectedPixelKeys,
        floating: false,
        floatingX: minX,
        floatingY: minY,
        floatingWidth: maxX - minX + 1,
        floatingHeight: maxY - minY + 1,
        floatingPixels: [],
      });
    } else {
      onClearSelection?.();
    }
  }, [canvasWidth, canvasHeight, onUpdateSelection, onClearSelection]);

  // Lift selected pixels from active layer into floating state for moving
  const liftSelectionToFloating = useCallback((initialDragPixel: { x: number; y: number }) => {
    if (!activeLayer) return;
    let minX: number, maxX: number, minY: number, maxY: number;
    let selectedKeys: Set<string> | null = null;

    if (selection.type === 'lasso' && selection.selectedPixelKeys && selection.selectedPixelKeys.length > 0) {
      selectedKeys = new Set(selection.selectedPixelKeys);
      minX = selection.startX;
      maxX = selection.endX;
      minY = selection.startY;
      maxY = selection.endY;
    } else {
      minX = Math.min(selection.startX, selection.endX);
      maxX = Math.max(selection.startX, selection.endX);
      minY = Math.min(selection.startY, selection.endY);
      maxY = Math.max(selection.startY, selection.endY);
    }

    const width = Math.max(1, maxX - minX + 1);
    const height = Math.max(1, maxY - minY + 1);
    const floatingPixels = new Array(width * height).fill('');
    const floatingMask = new Array(width * height).fill(false);
    const newLayerPixels = [...activeLayer.pixels];

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const localIdx = (y - minY) * width + (x - minX);
        if (selectedKeys && !selectedKeys.has(`${x},${y}`)) continue;
        if (x >= 0 && x < canvasWidth && y >= 0 && y < canvasHeight) {
          const layerIdx = y * canvasWidth + x;
          const color = activeLayer.pixels[layerIdx] || '';
          floatingPixels[localIdx] = color;
          floatingMask[localIdx] = true;
          newLayerPixels[layerIdx] = ''; // erase original spot from layer while floating
        }
      }
    }

    onUpdateLayerPixels(activeLayer.id, newLayerPixels, false);

    onUpdateSelection({
      ...selection,
      floating: true,
      floatingX: minX,
      floatingY: minY,
      floatingWidth: width,
      floatingHeight: height,
      floatingPixels,
      floatingMask,
    });

    selectionMoveStart.current = {
      startPixel: initialDragPixel,
      initialFloatingX: minX,
      initialFloatingY: minY,
    };
    setIsMovingSelection(true);
  }, [activeLayer, selection, canvasWidth, canvasHeight, onUpdateLayerPixels, onUpdateSelection]);

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

      const layerW = layer.width || (layer.pixels.length === canvasWidth * canvasHeight ? canvasWidth : undefined);
      const layerH = layer.height || (layer.pixels.length === canvasWidth * canvasHeight ? canvasHeight : undefined);

      if (layerW && layerH && (layerW !== canvasWidth || layerH !== canvasHeight)) {
        // Dimension mismatch protection: center layer pixels without diagonal wrapping
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

      // Highlight bounding box & handles when in Move Guide mode or dragging guide
      if (isMovingGuide || isDraggingGuide) {
        ctx.save();
        ctx.strokeStyle = '#F5CD2F';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 4]);
        ctx.strokeRect(
          bodyOffsetX * zoom,
          bodyOffsetY * zoom,
          21 * zoom,
          28 * zoom
        );

        // Corner handles
        ctx.fillStyle = '#F5CD2F';
        const hs = Math.max(5, Math.round(zoom * 0.4));
        ctx.fillRect(bodyOffsetX * zoom - hs/2, bodyOffsetY * zoom - hs/2, hs, hs);
        ctx.fillRect((bodyOffsetX + 21) * zoom - hs/2, bodyOffsetY * zoom - hs/2, hs, hs);
        ctx.fillRect(bodyOffsetX * zoom - hs/2, (bodyOffsetY + 28) * zoom - hs/2, hs, hs);
        ctx.fillRect((bodyOffsetX + 21) * zoom - hs/2, (bodyOffsetY + 28) * zoom - hs/2, hs, hs);

        // Header label badge
        ctx.setLineDash([]);
        ctx.font = 'bold 10px monospace';
        const badgeText = `✥ Retro Dev Guide (${bodyOffsetX}, ${bodyOffsetY}) • Drag to Move`;
        const tw = ctx.measureText(badgeText).width + 12;
        const by = Math.max(2, bodyOffsetY * zoom - 18);
        ctx.fillStyle = 'rgba(15, 15, 15, 0.9)';
        ctx.fillRect(bodyOffsetX * zoom, by, tw, 16);
        ctx.strokeStyle = '#F5CD2F';
        ctx.lineWidth = 1;
        ctx.strokeRect(bodyOffsetX * zoom, by, tw, 16);
        ctx.fillStyle = '#F5CD2F';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(badgeText, bodyOffsetX * zoom + 6, by + 8);
        ctx.restore();
      }

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

    // 5. Selection Marquee & Floating Pixels
    if (selection.active) {
      ctx.save();

      // If floating, render floating pixels on overlay canvas
      if (selection.floating && selection.floatingPixels && selection.floatingPixels.length > 0) {
        for (let dy = 0; dy < selection.floatingHeight; dy++) {
          for (let dx = 0; dx < selection.floatingWidth; dx++) {
            const localIdx = dy * selection.floatingWidth + dx;
            if (selection.floatingMask && !selection.floatingMask[localIdx]) continue;
            const color = selection.floatingPixels[localIdx];
            if (color && color !== '') {
              ctx.fillStyle = color;
              ctx.fillRect(
                (selection.floatingX + dx) * zoom,
                (selection.floatingY + dy) * zoom,
                zoom,
                zoom
              );
            }
          }
        }

        // Floating dashed outline around moved pixels
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(
          selection.floatingX * zoom,
          selection.floatingY * zoom,
          selection.floatingWidth * zoom,
          selection.floatingHeight * zoom
        );
      } else {
        // Not floating: Draw selection bounds and mask
        if (selection.type === 'lasso' && selection.selectedPixelKeys && selection.selectedPixelKeys.length > 0) {
          // Translucent cyan highlight over all pixels in lasso selection
          ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
          selection.selectedPixelKeys.forEach(key => {
            const [xs, ys] = key.split(',');
            const x = parseInt(xs, 10);
            const y = parseInt(ys, 10);
            ctx.fillRect(x * zoom, y * zoom, zoom, zoom);
          });

          // Dashed box around lasso selection
          const minX = Math.min(selection.startX, selection.endX);
          const maxX = Math.max(selection.startX, selection.endX);
          const minY = Math.min(selection.startY, selection.endY);
          const maxY = Math.max(selection.startY, selection.endY);

          ctx.strokeStyle = '#38BDF8';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(
            minX * zoom,
            minY * zoom,
            (maxX - minX + 1) * zoom,
            (maxY - minY + 1) * zoom
          );
        } else {
          // Standard box selection
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

          ctx.fillStyle = 'rgba(245, 158, 11, 0.08)';
          ctx.fillRect(
            minX * zoom,
            minY * zoom,
            (maxX - minX + 1) * zoom,
            (maxY - minY + 1) * zoom
          );
        }
      }
      ctx.restore();
    }

    // 5b. Active live Lasso path in progress
    if (isLassoing && lassoPoints.length > 1) {
      ctx.save();
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      lassoPoints.forEach((p, idx) => {
        const cx = (p.x + 0.5) * zoom;
        const cy = (p.y + 0.5) * zoom;
        if (idx === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      });
      ctx.stroke();

      // Translucent closing line back to starting vertex
      const first = lassoPoints[0];
      const last = lassoPoints[lassoPoints.length - 1];
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.beginPath();
      ctx.moveTo((last.x + 0.5) * zoom, (last.y + 0.5) * zoom);
      ctx.lineTo((first.x + 0.5) * zoom, (first.y + 0.5) * zoom);
      ctx.stroke();
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
    layout,
    isLassoing,
    lassoPoints
  ]);

  // Apply pixel changes to active layer with symmetry support
  const applyPixelPoints = (
    points: { x: number; y: number }[], 
    color: string | 'erase' | 'lighten' | 'darken', 
    commitHistory: boolean = false
  ) => {
    if (!activeLayer || activeLayer.locked) return;

    let newPixels = [...activeLayer.pixels];
    let anyChanged = false;

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
          if (newPixels[idx] !== '') {
            newPixels[idx] = '';
            anyChanged = true;
          }
        } else if (color === 'lighten') {
          const adjusted = adjustBrightness(newPixels[idx], 25);
          if (newPixels[idx] !== adjusted) {
            newPixels[idx] = adjusted;
            anyChanged = true;
          }
        } else if (color === 'darken') {
          const adjusted = adjustBrightness(newPixels[idx], -25);
          if (newPixels[idx] !== adjusted) {
            newPixels[idx] = adjusted;
            anyChanged = true;
          }
        } else {
          if (newPixels[idx] !== color) {
            newPixels[idx] = color;
            anyChanged = true;
          }
        }
      }
    });

    if (anyChanged) {
      strokeModifiedRef.current = true;
      onUpdateLayerPixels(activeLayer.id, newPixels, commitHistory);
    }
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

  // Global mouse up for pan, guide drag, and moving selection
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDraggingGuide) {
        setIsDraggingGuide(false);
        guideDragStart.current = null;
      }
      if (isPanning) {
        setIsPanning(false);
      }
      if (isMovingSelection) {
        setIsMovingSelection(false);
        selectionMoveStart.current = null;
      }
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isDraggingGuide, isPanning, isMovingSelection]);

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Middle click or Space+Click: Pan canvas
    if (e.button === 1 || isSpacePressed) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    if (e.button !== 0) return; // Left click only for tools
    const pixel = clientToPixel(e.clientX, e.clientY);
    if (!pixel) return;

    // Check if dragging guide (Move Guide mode active OR Alt held over guide)
    const isOverGuide = (
      pixel.x >= bodyOffsetX - 1 &&
      pixel.x <= bodyOffsetX + 21 &&
      pixel.y >= bodyOffsetY - 1 &&
      pixel.y <= bodyOffsetY + 28
    );

    if (isMovingGuide || (e.altKey && isOverGuide)) {
      setIsDraggingGuide(true);
      guideDragStart.current = {
        mouseX: pixel.x,
        mouseY: pixel.y,
        initialX: bodyOffsetX,
        initialY: bodyOffsetY,
      };
      return;
    }

    // 1. Check if clicking inside active selection to move it
    if (selection.active && isPixelInSelection(pixel)) {
      if (!selection.floating) {
        liftSelectionToFloating(pixel);
      } else {
        selectionMoveStart.current = {
          startPixel: pixel,
          initialFloatingX: selection.floatingX,
          initialFloatingY: selection.floatingY,
        };
        setIsMovingSelection(true);
      }
      return;
    }

    // 2. If clicking outside an active selection:
    if (selection.active) {
      if (selection.floating) {
        onCommitFloatingSelection?.();
      }
      if (currentTool !== 'select' && currentTool !== 'lasso') {
        onClearSelection?.();
      }
    }

    // 3. Lasso Tool start
    if (currentTool === 'lasso') {
      setIsLassoing(true);
      lassoPointsRef.current = [pixel];
      setLassoPoints([pixel]);
      onClearSelection?.();
      return;
    }

    // 4. Box Select Tool start
    if (currentTool === 'select') {
      setIsDrawing(true);
      setDragStartPos(pixel);
      onUpdateSelection({
        active: true,
        type: 'rectangle',
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
      return;
    }

    // 5. Standard Drawing Tools
    setIsDrawing(true);
    setDragStartPos(pixel);
    strokeModifiedRef.current = false;

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
      onUpdateLayerPixels(activeLayer.id, updated, true);
      return;
    }

    if (currentTool === 'replace') {
      if (!activeLayer || activeLayer.locked) return;
      const target = activeLayer.pixels[pixel.y * canvasWidth + pixel.x] || '';
      if (target.toLowerCase() !== currentColor.toLowerCase()) {
        const updated = activeLayer.pixels.map(p => 
          (p || '').toLowerCase() === target.toLowerCase() ? currentColor : p
        );
        onUpdateLayerPixels(activeLayer.id, updated, true);
      }
      return;
    }

    if (currentTool === 'pencil') {
      applyPixelPoints([pixel], currentColor, false);
    } else if (currentTool === 'eraser') {
      applyPixelPoints([pixel], 'erase', false);
    } else if (currentTool === 'lighten') {
      applyPixelPoints([pixel], 'lighten', false);
    } else if (currentTool === 'darken') {
      applyPixelPoints([pixel], 'darken', false);
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

    // Moving selection
    if (isMovingSelection && selectionMoveStart.current) {
      const deltaX = pixel.x - selectionMoveStart.current.startPixel.x;
      const deltaY = pixel.y - selectionMoveStart.current.startPixel.y;
      onUpdateSelection({
        ...selection,
        floatingX: selectionMoveStart.current.initialFloatingX + deltaX,
        floatingY: selectionMoveStart.current.initialFloatingY + deltaY,
      });
      return;
    }

    // Freehand Lasso drawing in progress
    if (isLassoing && lassoPointsRef.current.length > 0) {
      const lastPoint = lassoPointsRef.current[lassoPointsRef.current.length - 1];
      if (lastPoint.x !== pixel.x || lastPoint.y !== pixel.y) {
        const line = getLinePoints(lastPoint.x, lastPoint.y, pixel.x, pixel.y);
        const nextPoints = line.slice(1);
        if (nextPoints.length > 0) {
          lassoPointsRef.current.push(...nextPoints);
          setLassoPoints([...lassoPointsRef.current]);
        }
      }
      return;
    }

    // Moving guide
    if (isDraggingGuide && guideDragStart.current) {
      const deltaX = pixel.x - guideDragStart.current.mouseX;
      const deltaY = pixel.y - guideDragStart.current.mouseY;
      const newX = guideDragStart.current.initialX + deltaX;
      const newY = guideDragStart.current.initialY + deltaY;
      onGuideOffsetChange?.({ x: newX, y: newY });
      return;
    }

    if (!isDrawing) return;

    if (currentTool === 'pencil') {
      applyPixelPoints([pixel], currentColor, false);
    } else if (currentTool === 'eraser') {
      applyPixelPoints([pixel], 'erase', false);
    } else if (currentTool === 'lighten') {
      applyPixelPoints([pixel], 'lighten', false);
    } else if (currentTool === 'darken') {
      applyPixelPoints([pixel], 'darken', false);
    } else if (currentTool === 'select' && dragStartPos) {
      onUpdateSelection({
        ...selection,
        active: true,
        type: 'rectangle',
        startX: Math.min(dragStartPos.x, pixel.x),
        startY: Math.min(dragStartPos.y, pixel.y),
        endX: Math.max(dragStartPos.x, pixel.x),
        endY: Math.max(dragStartPos.y, pixel.y),
      });
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (isMovingSelection) {
      setIsMovingSelection(false);
      selectionMoveStart.current = null;
      return;
    }

    if (isLassoing) {
      setIsLassoing(false);
      const points = lassoPointsRef.current;
      lassoPointsRef.current = [];
      setLassoPoints([]);
      finishLassoSelection(points);
      return;
    }

    if (isDraggingGuide) {
      setIsDraggingGuide(false);
      guideDragStart.current = null;
      return;
    }

    if (!isDrawing) return;
    setIsDrawing(false);

    const pixel = clientToPixel(e.clientX, e.clientY);
    if (dragStartPos && pixel) {
      if (currentTool === 'select') {
        const minX = Math.min(dragStartPos.x, pixel.x);
        const maxX = Math.max(dragStartPos.x, pixel.x);
        const minY = Math.min(dragStartPos.y, pixel.y);
        const maxY = Math.max(dragStartPos.y, pixel.y);
        onUpdateSelection({
          active: true,
          type: 'rectangle',
          startX: minX,
          startY: minY,
          endX: maxX,
          endY: maxY,
          floating: false,
          floatingX: minX,
          floatingY: minY,
          floatingWidth: maxX - minX + 1,
          floatingHeight: maxY - minY + 1,
          floatingPixels: [],
        });
        setDragStartPos(null);
        return;
      } else if (currentTool === 'line') {
        const points = getLinePoints(dragStartPos.x, dragStartPos.y, pixel.x, pixel.y);
        applyPixelPoints(points, currentColor, false);
      } else if (currentTool === 'rectangle') {
        const points = getRectanglePoints(dragStartPos.x, dragStartPos.y, pixel.x, pixel.y, false);
        applyPixelPoints(points, currentColor, false);
      } else if (currentTool === 'rectangle_fill') {
        const points = getRectanglePoints(dragStartPos.x, dragStartPos.y, pixel.x, pixel.y, true);
        applyPixelPoints(points, currentColor, false);
      } else if (currentTool === 'circle') {
        const points = getCirclePoints(dragStartPos.x, dragStartPos.y, pixel.x, pixel.y, false);
        applyPixelPoints(points, currentColor, false);
      } else if (currentTool === 'circle_fill') {
        const points = getCirclePoints(dragStartPos.x, dragStartPos.y, pixel.x, pixel.y, true);
        applyPixelPoints(points, currentColor, false);
      }
    }

    if (strokeModifiedRef.current) {
      onCommitHistory?.(activeLayer?.id);
      strokeModifiedRef.current = false;
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

  // Mobile Touch Event Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchState.current.mode = 'draw';
      const touch = e.touches[0];
      const pixel = clientToPixel(touch.clientX, touch.clientY);
      if (!pixel) return;

      if (isMovingGuide) {
        setIsDraggingGuide(true);
        guideDragStart.current = {
          mouseX: pixel.x,
          mouseY: pixel.y,
          initialX: bodyOffsetX,
          initialY: bodyOffsetY,
        };
        return;
      }

      // 1. Check if touching inside active selection to move it
      if (selection.active && isPixelInSelection(pixel)) {
        if (!selection.floating) {
          liftSelectionToFloating(pixel);
        } else {
          selectionMoveStart.current = {
            startPixel: pixel,
            initialFloatingX: selection.floatingX,
            initialFloatingY: selection.floatingY,
          };
          setIsMovingSelection(true);
        }
        return;
      }

      // 2. If touching outside an active selection:
      if (selection.active) {
        if (selection.floating) {
          onCommitFloatingSelection?.();
        }
        if (currentTool !== 'select' && currentTool !== 'lasso') {
          onClearSelection?.();
        }
      }

      // 3. Lasso Tool touch start
      if (currentTool === 'lasso') {
        setIsLassoing(true);
        lassoPointsRef.current = [pixel];
        setLassoPoints([pixel]);
        onClearSelection?.();
        return;
      }

      // 4. Box Select Tool touch start
      if (currentTool === 'select') {
        setIsDrawing(true);
        setDragStartPos(pixel);
        onUpdateSelection({
          active: true,
          type: 'rectangle',
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
        return;
      }

      // 5. Standard Drawing Tools
      setIsDrawing(true);
      setDragStartPos(pixel);
      strokeModifiedRef.current = false;

      if (currentTool === 'eyedropper') {
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
        const updated = floodFill(activeLayer.pixels, canvasWidth, canvasHeight, pixel.x, pixel.y, currentColor);
        onUpdateLayerPixels(activeLayer.id, updated, true);
        return;
      }

      if (currentTool === 'replace') {
        if (!activeLayer || activeLayer.locked) return;
        const target = activeLayer.pixels[pixel.y * canvasWidth + pixel.x] || '';
        if (target.toLowerCase() !== currentColor.toLowerCase()) {
          const updated = activeLayer.pixels.map(p => 
            (p || '').toLowerCase() === target.toLowerCase() ? currentColor : p
          );
          onUpdateLayerPixels(activeLayer.id, updated, true);
        }
        return;
      }

      if (currentTool === 'pencil') {
        applyPixelPoints([pixel], currentColor, false);
      } else if (currentTool === 'eraser') {
        applyPixelPoints([pixel], 'erase', false);
      } else if (currentTool === 'lighten') {
        applyPixelPoints([pixel], 'lighten', false);
      } else if (currentTool === 'darken') {
        applyPixelPoints([pixel], 'darken', false);
      }
    } else if (e.touches.length >= 2) {
      // 2-finger touch: Pinch zoom & Pan
      setIsDrawing(false);
      setIsDraggingGuide(false);
      guideDragStart.current = null;
      strokeModifiedRef.current = false;

      const t0 = e.touches[0];
      const t1 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
      const center = {
        x: (t0.clientX + t1.clientX) / 2,
        y: (t0.clientY + t1.clientY) / 2,
      };

      touchState.current = {
        mode: 'pinch',
        initialDist: Math.max(10, dist),
        initialZoom: zoom,
        initialPan: { ...pan },
        initialCenter: center,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && touchState.current.mode === 'draw') {
      const touch = e.touches[0];
      const pixel = clientToPixel(touch.clientX, touch.clientY);
      setHoverPixel(pixel);
      if (!pixel) return;

      // Moving selection with touch
      if (isMovingSelection && selectionMoveStart.current) {
        const deltaX = pixel.x - selectionMoveStart.current.startPixel.x;
        const deltaY = pixel.y - selectionMoveStart.current.startPixel.y;
        onUpdateSelection({
          ...selection,
          floatingX: selectionMoveStart.current.initialFloatingX + deltaX,
          floatingY: selectionMoveStart.current.initialFloatingY + deltaY,
        });
        return;
      }

      // Lasso drawing with touch
      if (isLassoing && lassoPointsRef.current.length > 0) {
        const lastPoint = lassoPointsRef.current[lassoPointsRef.current.length - 1];
        if (lastPoint.x !== pixel.x || lastPoint.y !== pixel.y) {
          const line = getLinePoints(lastPoint.x, lastPoint.y, pixel.x, pixel.y);
          const nextPoints = line.slice(1);
          if (nextPoints.length > 0) {
            lassoPointsRef.current.push(...nextPoints);
            setLassoPoints([...lassoPointsRef.current]);
          }
        }
        return;
      }

      if (isDraggingGuide && guideDragStart.current) {
        const deltaX = pixel.x - guideDragStart.current.mouseX;
        const deltaY = pixel.y - guideDragStart.current.mouseY;
        const newX = guideDragStart.current.initialX + deltaX;
        const newY = guideDragStart.current.initialY + deltaY;
        onGuideOffsetChange?.({ x: newX, y: newY });
        return;
      }

      if (!isDrawing) return;

      if (currentTool === 'pencil') {
        applyPixelPoints([pixel], currentColor, false);
      } else if (currentTool === 'eraser') {
        applyPixelPoints([pixel], 'erase', false);
      } else if (currentTool === 'lighten') {
        applyPixelPoints([pixel], 'lighten', false);
      } else if (currentTool === 'darken') {
        applyPixelPoints([pixel], 'darken', false);
      } else if (currentTool === 'select' && dragStartPos) {
        onUpdateSelection({
          ...selection,
          active: true,
          type: 'rectangle',
          startX: Math.min(dragStartPos.x, pixel.x),
          startY: Math.min(dragStartPos.y, pixel.y),
          endX: Math.max(dragStartPos.x, pixel.x),
          endY: Math.max(dragStartPos.y, pixel.y),
        });
      }
    } else if (e.touches.length >= 2 && touchState.current.mode === 'pinch') {
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
      const currentCenter = {
        x: (t0.clientX + t1.clientX) / 2,
        y: (t0.clientY + t1.clientY) / 2,
      };

      // 1. Pan
      const deltaPanX = currentCenter.x - touchState.current.initialCenter.x;
      const deltaPanY = currentCenter.y - touchState.current.initialCenter.y;
      setPan({
        x: touchState.current.initialPan.x + deltaPanX,
        y: touchState.current.initialPan.y + deltaPanY,
      });

      // 2. Pinch zoom
      const scale = dist / touchState.current.initialDist;
      const newZoom = Math.max(4, Math.min(64, Math.round(touchState.current.initialZoom * scale)));
      if (newZoom !== zoom) {
        onZoomChange(newZoom);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchState.current.mode === 'pinch') {
      if (e.touches.length < 2) {
        touchState.current.mode = 'none';
      }
      return;
    }

    if (isMovingSelection) {
      setIsMovingSelection(false);
      selectionMoveStart.current = null;
      touchState.current.mode = 'none';
      return;
    }

    if (isLassoing) {
      setIsLassoing(false);
      const points = lassoPointsRef.current;
      lassoPointsRef.current = [];
      setLassoPoints([]);
      finishLassoSelection(points);
      touchState.current.mode = 'none';
      return;
    }

    if (isDraggingGuide) {
      setIsDraggingGuide(false);
      guideDragStart.current = null;
    }

    if (isDrawing) {
      setIsDrawing(false);
      if (e.changedTouches.length > 0 && dragStartPos) {
        const touch = e.changedTouches[0];
        const pixel = clientToPixel(touch.clientX, touch.clientY);
        if (pixel) {
          if (currentTool === 'select') {
            const minX = Math.min(dragStartPos.x, pixel.x);
            const maxX = Math.max(dragStartPos.x, pixel.x);
            const minY = Math.min(dragStartPos.y, pixel.y);
            const maxY = Math.max(dragStartPos.y, pixel.y);
            onUpdateSelection({
              active: true,
              type: 'rectangle',
              startX: minX,
              startY: minY,
              endX: maxX,
              endY: maxY,
              floating: false,
              floatingX: minX,
              floatingY: minY,
              floatingWidth: maxX - minX + 1,
              floatingHeight: maxY - minY + 1,
              floatingPixels: [],
            });
            setDragStartPos(null);
            touchState.current.mode = 'none';
            return;
          } else if (currentTool === 'line') {
            const points = getLinePoints(dragStartPos.x, dragStartPos.y, pixel.x, pixel.y);
            applyPixelPoints(points, currentColor, false);
          } else if (currentTool === 'rectangle') {
            const points = getRectanglePoints(dragStartPos.x, dragStartPos.y, pixel.x, pixel.y, false);
            applyPixelPoints(points, currentColor, false);
          } else if (currentTool === 'rectangle_fill') {
            const points = getRectanglePoints(dragStartPos.x, dragStartPos.y, pixel.x, pixel.y, true);
            applyPixelPoints(points, currentColor, false);
          } else if (currentTool === 'circle') {
            const points = getCirclePoints(dragStartPos.x, dragStartPos.y, pixel.x, pixel.y, false);
            applyPixelPoints(points, currentColor, false);
          } else if (currentTool === 'circle_fill') {
            const points = getCirclePoints(dragStartPos.x, dragStartPos.y, pixel.x, pixel.y, true);
            applyPixelPoints(points, currentColor, false);
          }
        }
      }

      if (strokeModifiedRef.current) {
        onCommitHistory?.(activeLayer?.id);
        strokeModifiedRef.current = false;
      }
      setDragStartPos(null);
    }
    touchState.current.mode = 'none';
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className={`relative flex-1 h-full w-full overflow-hidden flex items-center justify-center bg-[var(--canvas-desk-bg)] canvas-checkerboard select-none touch-none ${
        isPanning 
          ? 'cursor-grab' 
          : isDraggingGuide 
            ? 'cursor-grabbing' 
            : isMovingGuide 
              ? 'cursor-move' 
              : isMovingSelection || isPixelInSelection(hoverPixel)
                ? 'cursor-move'
                : (currentTool === 'select' || currentTool === 'lasso')
                  ? 'cursor-crosshair'
                  : 'cursor-crosshair'
      }`}
    >
      {/* Floating Guide Position Controller */}
      {isMovingGuide && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-surface-theme/95 border border-ui-theme rounded-2xl px-4 py-2.5 shadow-2xl flex items-center gap-3.5 backdrop-blur-md animate-in fade-in slide-in-from-top-3 text-primary-theme">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <div>
              <span className="text-xs font-bold text-primary-theme block leading-tight">Move Guide Mode</span>
              <span className="text-[10px] text-secondary-theme block">Click & drag guide anywhere</span>
            </div>
          </div>

          <div className="retro-recessed-divider h-6" />

          {/* Coordinate Display */}
          <div className="flex items-center gap-2 font-mono text-xs text-primary-theme retro-inset-well px-2.5 py-1 rounded-lg">
            <span>X: <strong className="font-bold" style={{ color: 'var(--text-accent)' }}>{bodyOffsetX}</strong></span>
            <span>Y: <strong className="font-bold" style={{ color: 'var(--text-accent)' }}>{bodyOffsetY}</strong></span>
          </div>

          {/* Pixel Nudge Arrow Buttons */}
          <div className="flex items-center gap-0.5 retro-inset-well p-0.5 rounded-lg">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onGuideOffsetChange?.({ x: bodyOffsetX - 1, y: bodyOffsetY });
              }}
              title="Nudge Left 1px"
              className="retro-chrome-btn w-6 h-6 flex items-center justify-center rounded text-primary-theme text-xs font-mono cursor-pointer"
            >
              ◀
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onGuideOffsetChange?.({ x: bodyOffsetX, y: bodyOffsetY - 1 });
              }}
              title="Nudge Up 1px"
              className="retro-chrome-btn w-6 h-6 flex items-center justify-center rounded text-primary-theme text-xs font-mono cursor-pointer"
            >
              ▲
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onGuideOffsetChange?.({ x: bodyOffsetX, y: bodyOffsetY + 1 });
              }}
              title="Nudge Down 1px"
              className="retro-chrome-btn w-6 h-6 flex items-center justify-center rounded text-primary-theme text-xs font-mono cursor-pointer"
            >
              ▼
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onGuideOffsetChange?.({ x: bodyOffsetX + 1, y: bodyOffsetY });
              }}
              title="Nudge Right 1px"
              className="retro-chrome-btn w-6 h-6 flex items-center justify-center rounded text-primary-theme text-xs font-mono cursor-pointer"
            >
              ▶
            </button>
          </div>

          {/* Center Button */}
          {onCenterGuide && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCenterGuide();
              }}
              className="retro-chrome-btn px-2.5 py-1 rounded-lg text-primary-theme text-xs font-medium transition-colors cursor-pointer"
            >
              Center Guide
            </button>
          )}

          {/* Done Button */}
          {onToggleMoveGuide && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleMoveGuide();
              }}
              className="retro-gold-btn px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Done / Lock
            </button>
          )}
        </div>
      )}

      {/* Centered Drawing Stage with Pan & Zoom */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px)`,
          width: `${canvasWidth * zoom}px`,
          height: `${canvasHeight * zoom}px`,
          transition: (animationsEnabled && !isPanning && touchState.current.mode !== 'pinch') ? 'transform 75ms ease-out' : 'none',
        }}
        className="relative shadow-2xl shrink-0"
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

        {/* Floating Selection Quick Action Bar on Stage */}
        {selection.active && !isLassoing && (
          (() => {
            const minX = selection.floating ? selection.floatingX : Math.min(selection.startX, selection.endX);
            const minY = selection.floating ? selection.floatingY : Math.min(selection.startY, selection.endY);
            const width = selection.floating ? selection.floatingWidth : Math.abs(selection.endX - selection.startX) + 1;
            const height = selection.floating ? selection.floatingHeight : Math.abs(selection.endY - selection.startY) + 1;

            const selPixelLeft = minX * zoom;
            const selPixelTop = minY * zoom;
            const showBelow = selPixelTop < 38;
            const topPos = showBelow ? (minY + height) * zoom + 6 : selPixelTop - 36;

            return (
              <div
                style={{
                  left: `${Math.max(0, Math.min(canvasWidth * zoom - 220, selPixelLeft))}px`,
                  top: `${topPos}px`,
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                className="absolute z-30 bg-neutral-900/95 border border-amber-500/50 rounded-xl px-2 py-1 shadow-2xl flex items-center gap-1.5 backdrop-blur-md animate-in fade-in select-none pointer-events-auto"
              >
                <div className="flex items-center gap-1 text-[10px] font-bold text-amber-300 px-1">
                  <Move className="w-3 h-3 text-amber-400" />
                  <span>{selection.floating ? 'Moving Pixels' : selection.type === 'lasso' ? 'Lasso' : 'Box'}</span>
                </div>

                <div className="h-4 w-px bg-neutral-800" />

                {selection.floating && onCommitFloatingSelection && (
                  <button
                    type="button"
                    onClick={onCommitFloatingSelection}
                    title="Stamp / Commit Moved Pixels (Enter)"
                    className="flex items-center gap-1 px-2 py-0.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded transition-colors shadow"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Stamp</span>
                  </button>
                )}

                {onDeleteSelection && (
                  <button
                    type="button"
                    onClick={onDeleteSelection}
                    title="Delete Selected Pixels (Delete / Backspace)"
                    className="flex items-center gap-1 px-2 py-0.5 bg-red-600/90 hover:bg-red-500 text-white font-medium text-xs rounded transition-colors shadow"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Del</span>
                  </button>
                )}

                <div className="flex items-center gap-0.5">
                  {onFlipHorizontalSelection && (
                    <button
                      type="button"
                      onClick={onFlipHorizontalSelection}
                      title="Flip Horizontal"
                      className="p-1 hover:bg-neutral-800 rounded text-neutral-300 hover:text-white transition-colors"
                    >
                      <FlipHorizontal className="w-3 h-3" />
                    </button>
                  )}
                  {onFlipVerticalSelection && (
                    <button
                      type="button"
                      onClick={onFlipVerticalSelection}
                      title="Flip Vertical"
                      className="p-1 hover:bg-neutral-800 rounded text-neutral-300 hover:text-white transition-colors"
                    >
                      <FlipVertical className="w-3 h-3" />
                    </button>
                  )}
                  {onClearSelection && (
                    <button
                      type="button"
                      onClick={onClearSelection}
                      title="Deselect (Escape)"
                      className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white transition-colors ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })()
        )}
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
