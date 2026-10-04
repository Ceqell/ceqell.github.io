/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  PanelLeftOpen, 
  PanelRightOpen, 
  ChevronRight, 
  Layers as LayersIcon 
} from 'lucide-react';
import { 
  Layer, 
  ToolType, 
  ReferenceImage, 
  SelectionState, 
  CanvasDimensions, 
  ProjectState 
} from './types/sprite';
import { 
  CANVAS_PRESETS, 
  createNoobSprite, 
  DEFAULT_PALETTES,
  STARTER_TEMPLATES,
  getBodyLayout
} from './constants/retroDev';
import { flipPixelsHorizontal, flipPixelsVertical } from './utils/pixelMath';

import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { CanvasArea } from './components/CanvasArea';
import { LayersPanel } from './components/LayersPanel';
import { ColorPalette } from './components/ColorPalette';
import { ReferenceManager, FloatingReferenceWindow } from './components/ReferenceManager';
import { MiniPreview } from './components/MiniPreview';
import { ExportModal } from './components/ExportModal';
import { GuideModal } from './components/GuideModal';
import { CustomCanvasModal } from './components/CustomCanvasModal';

export default function App() {
  // Canvas Size Preset
  const [activePreset, setActivePreset] = useState<CanvasDimensions>(CANVAS_PRESETS[0]);
  const [guideOffset, setGuideOffset] = useState<{ x: number; y: number }>({
    x: CANVAS_PRESETS[0].bodyOffsetX,
    y: CANVAS_PRESETS[0].bodyOffsetY,
  });
  const [isMovingGuide, setIsMovingGuide] = useState<boolean>(false);
  const [isCustomCanvasOpen, setIsCustomCanvasOpen] = useState<boolean>(false);

  const canvasWidth = activePreset.width;
  const canvasHeight = activePreset.height;
  const bodyOffsetX = guideOffset.x;
  const bodyOffsetY = guideOffset.y;

  // Layers state
  const [layers, setLayers] = useState<Layer[]>(() => 
    createNoobSprite(CANVAS_PRESETS[0].width, CANVAS_PRESETS[0].height, CANVAS_PRESETS[0].bodyOffsetX, CANVAS_PRESETS[0].bodyOffsetY)
  );
  const [activeLayerId, setActiveLayerId] = useState<string>('layer-body');

  // History stack for Undo / Redo
  const [history, setHistory] = useState<{ layers: Layer[]; activeLayerId: string }[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Tools & Brush
  const [currentTool, setCurrentTool] = useState<ToolType>('pencil');
  const [brushSize, setBrushSize] = useState<number>(1);
  const [symmetryActive, setSymmetryActive] = useState<boolean>(false);

  // Colors
  const [currentColor, setCurrentColor] = useState<string>('#F5CD2F'); // Retro bright yellow
  const [colorHistory, setColorHistory] = useState<string[]>([
    '#F5CD2F', '#0D69AC', '#287F46', '#1C5831', '#1B2A34', '#FFFFFF'
  ]);
  const [customColors, setCustomColors] = useState<string[]>([
    '#F5CD2F', '#0D69AC', '#287F46', '#1C5831', '#1B2A34', '#FFFFFF', '#A0A5A9', '#DA2A2A'
  ]);

  // Display Toggles
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showGuides, setShowGuides] = useState<boolean>(true);
  const [showNumbers, setShowNumbers] = useState<boolean>(true);
  const [zoom, setZoom] = useState<number>(18); // Default generous zoom for pixel work

  // Selection
  const [selection, setSelection] = useState<SelectionState>({
    active: false,
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    floating: false,
    floatingX: 0,
    floatingY: 0,
    floatingWidth: 0,
    floatingHeight: 0,
    floatingPixels: [],
  });

  // Multiple Reference Images
  const [references, setReferences] = useState<ReferenceImage[]>([]);
  const [activeRefId, setActiveRefId] = useState<string | null>(null);

  // Modals
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  // Right sidebar tab state for smaller screens
  const [rightTab, setRightTab] = useState<'layers' | 'palette' | 'references'>('layers');

  // Sidebars Width and Collapse State
  const [leftSidebarWidth, setLeftSidebarWidth] = useState<number>(64);
  const [leftCollapsed, setLeftCollapsed] = useState<boolean>(false);
  const [rightSidebarWidth, setRightSidebarWidth] = useState<number>(320);
  const [rightCollapsed, setRightCollapsed] = useState<boolean>(false);

  const isDraggingLeftRef = useRef<boolean>(false);
  const isDraggingRightRef = useRef<boolean>(false);

  const handleLeftResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingLeftRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingLeftRef.current) return;
      const newWidth = Math.round(moveEvent.clientX);
      if (newWidth < 46) {
        setLeftCollapsed(true);
      } else {
        setLeftCollapsed(false);
        setLeftSidebarWidth(Math.max(56, Math.min(240, newWidth)));
      }
    };

    const handleMouseUp = () => {
      isDraggingLeftRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleRightResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRightRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRightRef.current) return;
      const newWidth = Math.round(window.innerWidth - moveEvent.clientX);
      if (newWidth < 160) {
        setRightCollapsed(true);
      } else {
        setRightCollapsed(false);
        const maxWidth = Math.max(300, Math.min(680, window.innerWidth - 300));
        setRightSidebarWidth(Math.max(220, Math.min(maxWidth, newWidth)));
      }
    };

    const handleMouseUp = () => {
      isDraggingRightRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Save history state
  const pushHistory = useCallback((newLayers: Layer[], newActiveId = activeLayerId) => {
    setHistory(prev => {
      const validHistory = historyIndex >= 0 ? prev.slice(0, historyIndex + 1) : [];
      const newEntry = {
        layers: JSON.parse(JSON.stringify(newLayers)),
        activeLayerId: newActiveId,
      };
      const updated = [...validHistory, newEntry];
      const maxHistory = 60;
      if (updated.length > maxHistory) {
        const trimmed = updated.slice(updated.length - maxHistory);
        setHistoryIndex(trimmed.length - 1);
        return trimmed;
      }
      setHistoryIndex(updated.length - 1);
      return updated;
    });
  }, [activeLayerId, historyIndex]);

  // Initial history push
  const initialHistoryRecorded = useRef(false);
  useEffect(() => {
    if (!initialHistoryRecorded.current && layers.length > 0) {
      initialHistoryRecorded.current = true;
      setHistory([{ layers: JSON.parse(JSON.stringify(layers)), activeLayerId }]);
      setHistoryIndex(0);
    }
  }, [layers, activeLayerId]);

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const targetState = history[historyIndex - 1];
      setLayers(JSON.parse(JSON.stringify(targetState.layers)));
      setActiveLayerId(targetState.activeLayerId);
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex]);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const targetState = history[historyIndex + 1];
      setLayers(JSON.parse(JSON.stringify(targetState.layers)));
      setActiveLayerId(targetState.activeLayerId);
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex]);

  // Explicit history commit on stroke end
  const handleCommitHistory = useCallback((targetLayerId?: string) => {
    const layerId = targetLayerId || activeLayerId;
    setLayers(currentLayers => {
      pushHistory(currentLayers, layerId);
      return currentLayers;
    });
  }, [activeLayerId, pushHistory]);

  // Color selection
  const handleColorSelect = (color: string) => {
    setCurrentColor(color);
    setColorHistory(prev => {
      const filtered = prev.filter(c => c.toUpperCase() !== color.toUpperCase());
      return [color, ...filtered].slice(0, 16);
    });
  };

  // Add custom color
  const handleAddCustomColor = (color: string) => {
    if (!customColors.includes(color)) {
      setCustomColors(prev => [color, ...prev]);
    }
  };

  const handleRemoveCustomColor = (color: string) => {
    setCustomColors(prev => prev.filter(c => c !== color));
  };

  // Native Eyedropper API
  const handleNativeEyedropper = async () => {
    if (typeof window !== 'undefined' && 'EyeDropper' in window) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        if (result && result.sRGBHex) {
          handleColorSelect(result.sRGBHex.toUpperCase());
        }
      } catch {
        // Canceled or unsupported
      }
    }
  };

  // Update pixels on a layer
  const handleUpdateLayerPixels = (layerId: string, newPixels: string[], commitHistory: boolean = false) => {
    setLayers(prev => {
      const updated = prev.map(l => l.id === layerId ? { ...l, pixels: newPixels } : l);
      if (commitHistory) {
        pushHistory(updated, layerId);
      }
      return updated;
    });
  };

  // Layer operations
  const handleAddLayer = () => {
    const newId = `layer-${Date.now()}`;
    const newLayer: Layer = {
      id: newId,
      name: `Layer ${layers.length + 1}`,
      visible: true,
      opacity: 1,
      locked: false,
      pixels: new Array(canvasWidth * canvasHeight).fill(''),
    };
    const updated = [...layers, newLayer];
    setLayers(updated);
    setActiveLayerId(newId);
    pushHistory(updated, newId);
  };

  const handleDeleteLayer = (id: string) => {
    if (layers.length <= 1) return;
    const updated = layers.filter(l => l.id !== id);
    const newActiveId = id === activeLayerId ? updated[updated.length - 1].id : activeLayerId;
    setLayers(updated);
    setActiveLayerId(newActiveId);
    pushHistory(updated, newActiveId);
  };

  const handleDuplicateLayer = (id: string) => {
    const layer = layers.find(l => l.id === id);
    if (!layer) return;
    const newId = `layer-${Date.now()}`;
    const newLayer: Layer = {
      ...layer,
      id: newId,
      name: `${layer.name} (Copy)`,
      pixels: [...layer.pixels],
    };
    const idx = layers.findIndex(l => l.id === id);
    const updated = [...layers];
    updated.splice(idx + 1, 0, newLayer);
    setLayers(updated);
    setActiveLayerId(newId);
    pushHistory(updated, newId);
  };

  const handleMergeDown = (id: string) => {
    const idx = layers.findIndex(l => l.id === id);
    if (idx <= 0) return; // Cannot merge down bottom layer

    const upperLayer = layers[idx];
    const lowerLayer = layers[idx - 1];

    const mergedPixels = [...lowerLayer.pixels];
    for (let i = 0; i < upperLayer.pixels.length; i++) {
      const topColor = upperLayer.pixels[i];
      if (topColor && topColor !== '') {
        mergedPixels[i] = topColor;
      }
    }

    const mergedLayer: Layer = {
      ...lowerLayer,
      name: `${lowerLayer.name} + ${upperLayer.name}`,
      pixels: mergedPixels,
    };

    const updated = layers.filter((_, i) => i !== idx).map((l, i) => i === idx - 1 ? mergedLayer : l);
    setLayers(updated);
    setActiveLayerId(mergedLayer.id);
    pushHistory(updated, mergedLayer.id);
  };

  const handleMoveLayer = (id: string, direction: 'up' | 'down') => {
    const idx = layers.findIndex(l => l.id === id);
    if (idx < 0) return;
    if (direction === 'up' && idx >= layers.length - 1) return;
    if (direction === 'down' && idx <= 0) return;

    const targetIdx = direction === 'up' ? idx + 1 : idx - 1;
    const updated = [...layers];
    const [removed] = updated.splice(idx, 1);
    updated.splice(targetIdx, 0, removed);
    setLayers(updated);
    pushHistory(updated, id);
  };

  const handleToggleVisibility = (id: string) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
  };

  const handleToggleLock = (id: string) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, locked: !l.locked } : l));
  };

  const handleChangeOpacity = (id: string, opacity: number) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, opacity } : l));
  };

  const handleRenameLayer = (id: string, name: string) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, name } : l));
  };

  // Canvas Preset Switcher
  const handleSelectCanvasPreset = (presetName: string) => {
    const preset = CANVAS_PRESETS.find(p => p.name === presetName);
    if (!preset) return;

    setActivePreset(preset);
    setGuideOffset({ x: preset.bodyOffsetX, y: preset.bodyOffsetY });

    // Remap layers to new size with centered alignment
    const offsetX = Math.floor((preset.width - canvasWidth) / 2);
    const offsetY = Math.floor((preset.height - canvasHeight) / 2);

    const newLayers = layers.map(l => {
      const newPixels = new Array(preset.width * preset.height).fill('');
      for (let y = 0; y < canvasHeight; y++) {
        for (let x = 0; x < canvasWidth; x++) {
          const targetX = x + offsetX;
          const targetY = y + offsetY;
          if (targetX >= 0 && targetX < preset.width && targetY >= 0 && targetY < preset.height) {
            newPixels[targetY * preset.width + targetX] = l.pixels[y * canvasWidth + x] || '';
          }
        }
      }
      return {
        ...l,
        pixels: newPixels,
      };
    });
    setLayers(newLayers);
    pushHistory(newLayers, activeLayerId);
  };

  // Custom Canvas Dimensions Handler
  const handleApplyCustomCanvasSize = (
    newWidth: number,
    newHeight: number,
    anchor: 'center' | 'top-left' | 'bottom-center' = 'center',
    autoCenterGuide: boolean = true
  ) => {
    if (newWidth === canvasWidth && newHeight === canvasHeight) return;

    let offsetX = 0;
    let offsetY = 0;

    if (anchor === 'center') {
      offsetX = Math.floor((newWidth - canvasWidth) / 2);
      offsetY = Math.floor((newHeight - canvasHeight) / 2);
    } else if (anchor === 'bottom-center') {
      offsetX = Math.floor((newWidth - canvasWidth) / 2);
      offsetY = newHeight - canvasHeight;
    } else {
      offsetX = 0;
      offsetY = 0;
    }

    const newLayers = layers.map(layer => {
      const newPixels = new Array(newWidth * newHeight).fill('');
      for (let oldY = 0; oldY < canvasHeight; oldY++) {
        for (let oldX = 0; oldX < canvasWidth; oldX++) {
          const targetX = oldX + offsetX;
          const targetY = oldY + offsetY;
          if (targetX >= 0 && targetX < newWidth && targetY >= 0 && targetY < newHeight) {
            newPixels[targetY * newWidth + targetX] = layer.pixels[oldY * canvasWidth + oldX] || '';
          }
        }
      }
      return {
        ...layer,
        pixels: newPixels,
      };
    });

    const newGuideOffset = autoCenterGuide
      ? { x: Math.floor((newWidth - 21) / 2), y: Math.floor((newHeight - 28) / 2) }
      : { x: guideOffset.x + offsetX, y: guideOffset.y + offsetY };

    const customPreset: CanvasDimensions = {
      name: `Custom (${newWidth} × ${newHeight})`,
      width: newWidth,
      height: newHeight,
      description: `Custom ${newWidth}x${newHeight} canvas dimensions`,
      bodyOffsetX: newGuideOffset.x,
      bodyOffsetY: newGuideOffset.y,
    };

    setActivePreset(customPreset);
    setGuideOffset(newGuideOffset);
    setLayers(newLayers);
    pushHistory(newLayers, activeLayerId);
  };

  const handleCenterGuide = () => {
    const centeredX = Math.floor((canvasWidth - 21) / 2);
    const centeredY = Math.floor((canvasHeight - 28) / 2);
    setGuideOffset({ x: centeredX, y: centeredY });
  };

  // Starter Templates
  const handleSelectStarterTemplate = (templateId: string) => {
    if (!window.confirm('Load template? Any unsaved changes in current canvas will be replaced.')) return;

    const totalPixels = canvasWidth * canvasHeight;
    const layout = getBodyLayout(canvasWidth, canvasHeight, bodyOffsetX, bodyOffsetY);

    if (templateId === 'empty') {
      const blankLayers: Layer[] = [
        {
          id: 'layer-body',
          name: 'Layer 1',
          visible: true,
          opacity: 1,
          locked: false,
          pixels: new Array(totalPixels).fill(''),
        },
      ];
      setLayers(blankLayers);
      setActiveLayerId('layer-body');
      pushHistory(blankLayers, 'layer-body');
      return;
    }

    if (templateId === 'noob') {
      const noobLayers = createNoobSprite(canvasWidth, canvasHeight, bodyOffsetX, bodyOffsetY);
      setLayers(noobLayers);
      setActiveLayerId(noobLayers[0].id);
      pushHistory(noobLayers, noobLayers[0].id);
      return;
    }

    // Default Noob base + custom outfits for guest / bluudude / ibot / wireframe
    const baseLayers = createNoobSprite(canvasWidth, canvasHeight, bodyOffsetX, bodyOffsetY);
    const bodyL = baseLayers[0];
    const faceL = baseLayers[1];

    if (templateId === 'guest') {
      // Black shirt, Navy pants, yellow limbs
      const black = '#1B2A34';
      const white = '#FFFFFF';
      const navy = '#002060';

      // Re-color torso black
      for (let y = 0; y < layout.torso.height; y++) {
        for (let x = 0; x < layout.torso.width; x++) {
          bodyL.pixels[(layout.torso.y + y) * canvasWidth + (layout.torso.x + x)] = black;
        }
      }
      // White retro 'R' decal on chest
      bodyL.pixels[(layout.torso.y + 3) * canvasWidth + (layout.torso.x + 5)] = white;
      bodyL.pixels[(layout.torso.y + 4) * canvasWidth + (layout.torso.x + 5)] = white;
      bodyL.pixels[(layout.torso.y + 5) * canvasWidth + (layout.torso.x + 5)] = white;
      bodyL.pixels[(layout.torso.y + 3) * canvasWidth + (layout.torso.x + 6)] = white;

      // Navy pants
      for (let y = 0; y < layout.legs.height; y++) {
        for (let x = 0; x < layout.legs.width; x++) {
          const px = layout.legs.x + x;
          const py = layout.legs.y + y;
          bodyL.pixels[py * canvasWidth + px] = px === layout.legs.seamCol ? '#001030' : navy;
        }
      }
    } else if (templateId === 'bluudude') {
      // Cyan glitch hacker
      const cyan = '#00E5FF';
      const darkCyan = '#005577';
      const black = '#0A0A0A';
      bodyL.pixels = bodyL.pixels.map(p => p === '#0D69AC' ? darkCyan : p === '#F5CD2F' ? cyan : p === '#287F46' ? black : p);
    } else if (templateId === 'ibot') {
      // iBot Package metallic cybernetic frame
      const silver = '#A0A5A9';
      const darkMetal = '#635F61';
      const cyanLight = '#00E5FF';
      for (let i = 0; i < bodyL.pixels.length; i++) {
        if (bodyL.pixels[i] === '#0D69AC') bodyL.pixels[i] = silver;
        if (bodyL.pixels[i] === '#287F46') bodyL.pixels[i] = darkMetal;
      }
      // Cyber visor on face
      for (let x = 1; x <= 7; x++) {
        faceL.pixels[(layout.head.y + 3) * canvasWidth + (layout.head.x + x)] = cyanLight;
      }
    } else if (templateId === 'wireframe') {
      // Mannequin neutral grey
      const grey = '#A0A5A9';
      const darkGrey = '#635F61';
      for (let i = 0; i < bodyL.pixels.length; i++) {
        if (bodyL.pixels[i] !== '') bodyL.pixels[i] = grey;
      }
      // Clear face
      faceL.pixels.fill('');
    }

    setLayers(baseLayers);
    setActiveLayerId(baseLayers[0].id);
    pushHistory(baseLayers, baseLayers[0].id);
  };

  // Reference management
  const handleAddReferences = (newRefs: ReferenceImage[]) => {
    setReferences(prev => [...prev, ...newRefs]);
    if (!activeRefId && newRefs.length > 0) {
      setActiveRefId(newRefs[0].id);
    }
  };

  const handleUpdateReference = (id: string, updates: Partial<ReferenceImage>) => {
    setReferences(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const handleDeleteReference = (id: string) => {
    setReferences(prev => prev.filter(r => r.id !== id));
    if (activeRefId === id) setActiveRefId(null);
  };

  // Selection manipulations
  const handleFlipHorizontalSelection = () => {
    const activeLayer = layers.find(l => l.id === activeLayerId);
    if (!selection.active || !activeLayer) return;
    const minX = Math.min(selection.startX, selection.endX);
    const maxX = Math.max(selection.startX, selection.endX);
    const minY = Math.min(selection.startY, selection.endY);
    const maxY = Math.max(selection.startY, selection.endY);
    const w = maxX - minX + 1;
    const h = maxY - minY + 1;

    const block: string[] = [];
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        block.push(activeLayer.pixels[y * canvasWidth + x] || '');
      }
    }

    const flipped = flipPixelsHorizontal(block, w, h);
    const newPixels = [...activeLayer.pixels];
    let idx = 0;
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        newPixels[y * canvasWidth + x] = flipped[idx++];
      }
    }

    handleUpdateLayerPixels(activeLayer.id, newPixels, true);
  };

  const handleFlipVerticalSelection = () => {
    const activeLayer = layers.find(l => l.id === activeLayerId);
    if (!selection.active || !activeLayer) return;
    const minX = Math.min(selection.startX, selection.endX);
    const maxX = Math.max(selection.startX, selection.endX);
    const minY = Math.min(selection.startY, selection.endY);
    const maxY = Math.max(selection.startY, selection.endY);
    const w = maxX - minX + 1;
    const h = maxY - minY + 1;

    const block: string[] = [];
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        block.push(activeLayer.pixels[y * canvasWidth + x] || '');
      }
    }

    const flipped = flipPixelsVertical(block, w, h);
    const newPixels = [...activeLayer.pixels];
    let idx = 0;
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        newPixels[y * canvasWidth + x] = flipped[idx++];
      }
    }

    handleUpdateLayerPixels(activeLayer.id, newPixels, true);
  };

  const handleClearSelection = () => {
    setSelection({
      active: false,
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
      floating: false,
      floatingX: 0,
      floatingY: 0,
      floatingWidth: 0,
      floatingHeight: 0,
      floatingPixels: [],
    });
  };

  // Save Project JSON
  const handleSaveProject = () => {
    const project: ProjectState = {
      version: 1,
      canvasWidth,
      canvasHeight,
      canvasPresetName: activePreset.name,
      layers,
      activeLayerId,
      references,
      selectedColor: currentColor,
      bodyOffsetX: guideOffset.x,
      bodyOffsetY: guideOffset.y,
    };

    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = `retro-dev-${activePreset.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.json`;
    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Load Project JSON
  const handleLoadProject = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const project: ProjectState = JSON.parse(e.target?.result as string);
        if (project.layers && project.canvasWidth && project.canvasHeight) {
          const defaultOx = Math.floor((project.canvasWidth - 21) / 2);
          const defaultOy = Math.floor((project.canvasHeight - 28) / 2);
          const loadedOx = project.bodyOffsetX !== undefined ? project.bodyOffsetX : defaultOx;
          const loadedOy = project.bodyOffsetY !== undefined ? project.bodyOffsetY : defaultOy;

          const matchedPreset = CANVAS_PRESETS.find(p => p.name === project.canvasPresetName) || {
            name: `Custom (${project.canvasWidth} × ${project.canvasHeight})`,
            width: project.canvasWidth,
            height: project.canvasHeight,
            description: 'Custom canvas loaded from project',
            bodyOffsetX: loadedOx,
            bodyOffsetY: loadedOy,
          };
          setActivePreset(matchedPreset);
          setGuideOffset({ x: loadedOx, y: loadedOy });
          setLayers(project.layers);
          setActiveLayerId(project.activeLayerId || project.layers[0].id);
          if (project.selectedColor) setCurrentColor(project.selectedColor);
          if (project.references) setReferences(project.references);
          pushHistory(project.layers, project.activeLayerId || project.layers[0].id);
        }
      } catch {
        alert('Invalid project file format.');
      }
    };
    reader.readAsText(file);
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.key.toLowerCase() === 'p') {
        setCurrentTool('pencil');
      } else if (e.key.toLowerCase() === 'e') {
        setCurrentTool('eraser');
      } else if (e.key.toLowerCase() === 'b') {
        setCurrentTool('bucket');
      } else if (e.key.toLowerCase() === 'i') {
        setCurrentTool('eyedropper');
      } else if (e.key.toLowerCase() === 'l') {
        setCurrentTool('line');
      } else if (e.key.toLowerCase() === 'u') {
        setCurrentTool('rectangle');
      } else if (e.key.toLowerCase() === 'c') {
        setCurrentTool('circle');
      } else if (e.key.toLowerCase() === 'm') {
        setCurrentTool('select');
      } else if (e.key.toLowerCase() === 'g') {
        setShowGrid(g => !g);
      } else if (e.key.toLowerCase() === 'h') {
        setShowGuides(g => !g);
      } else if (e.key.toLowerCase() === 'n') {
        setShowNumbers(n => !n);
      } else if (e.key.toLowerCase() === 's' && !e.ctrlKey && !e.metaKey) {
        setSymmetryActive(s => !s);
      } else if (e.key === 'Escape') {
        handleClearSelection();
      } else if (e.key === '[') {
        setBrushSize(b => Math.max(1, b - 1));
      } else if (e.key === ']') {
        setBrushSize(b => Math.min(4, b + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-neutral-950 font-sans text-neutral-100 select-none">
      {/* Top Header */}
      <Header
        canvasPresetName={activePreset.name}
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        onSelectCanvasPreset={handleSelectCanvasPreset}
        onOpenCustomCanvasModal={() => setIsCustomCanvasOpen(true)}
        onSelectStarterTemplate={handleSelectStarterTemplate}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(g => !g)}
        showGuides={showGuides}
        onToggleGuides={() => setShowGuides(g => !g)}
        showNumbers={showNumbers}
        onToggleNumbers={() => setShowNumbers(n => !n)}
        isMovingGuide={isMovingGuide}
        onToggleMoveGuide={() => setIsMovingGuide(v => !v)}
        symmetryActive={symmetryActive}
        onToggleSymmetry={() => setSymmetryActive(s => !s)}
        zoom={zoom}
        onZoomChange={setZoom}
        onOpenExportModal={() => setIsExportOpen(true)}
        onOpenGuideModal={() => setIsGuideOpen(true)}
        onSaveProject={handleSaveProject}
        onLoadProject={handleLoadProject}
        leftCollapsed={leftCollapsed}
        onToggleLeftSidebar={() => setLeftCollapsed(v => !v)}
        rightCollapsed={rightCollapsed}
        onToggleRightSidebar={() => setRightCollapsed(v => !v)}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Toolbar & Resizer */}
        {!leftCollapsed ? (
          <div className="flex shrink-0 h-full relative group/left z-20">
            <Toolbar
              currentTool={currentTool}
              onSelectTool={setCurrentTool}
              brushSize={brushSize}
              onBrushSizeChange={setBrushSize}
              symmetryActive={symmetryActive}
              onToggleSymmetry={() => setSymmetryActive(s => !s)}
              hasSelection={selection.active}
              onFlipHorizontalSelection={handleFlipHorizontalSelection}
              onFlipVerticalSelection={handleFlipVerticalSelection}
              onClearSelection={handleClearSelection}
              canUndo={historyIndex > 0}
              canRedo={historyIndex < history.length - 1}
              onUndo={handleUndo}
              onRedo={handleRedo}
              width={leftSidebarWidth}
              onCollapse={() => setLeftCollapsed(true)}
            />
            {/* Draggable Splitter on right edge of Left Toolbar */}
            <div
              onMouseDown={handleLeftResizeMouseDown}
              onDoubleClick={() => setLeftSidebarWidth(64)}
              title="Drag to resize Tools Sidebar (Double-click to reset)"
              className="w-1.5 hover:w-2 cursor-col-resize hover:bg-amber-400/60 active:bg-amber-400 transition-all z-30 flex items-center justify-center -mr-1"
            >
              <div className="w-0.5 h-7 bg-neutral-700 hover:bg-amber-400 rounded-full" />
            </div>
          </div>
        ) : (
          /* Floating Reopen Button when Left Sidebar is collapsed */
          <button
            onClick={() => setLeftCollapsed(false)}
            title="Expand Tools Sidebar"
            className="absolute top-3 left-3 z-30 flex items-center gap-1.5 px-2.5 py-1.5 bg-neutral-900/95 border border-neutral-800 hover:border-amber-400/50 text-neutral-300 hover:text-amber-400 rounded-lg shadow-xl backdrop-blur-md transition-all text-xs font-medium cursor-pointer"
          >
            <PanelLeftOpen className="w-4 h-4 text-amber-400" />
            <span>Tools</span>
          </button>
        )}

        {/* Central Drawing Canvas Area */}
        <CanvasArea
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          layers={layers}
          activeLayerId={activeLayerId}
          onUpdateLayerPixels={handleUpdateLayerPixels}
          onCommitHistory={handleCommitHistory}
          currentTool={currentTool}
          currentColor={currentColor}
          onColorPick={handleColorSelect}
          brushSize={brushSize}
          showGrid={showGrid}
          showGuides={showGuides}
          showNumbers={showNumbers}
          symmetryActive={symmetryActive}
          bodyOffsetX={bodyOffsetX}
          bodyOffsetY={bodyOffsetY}
          onGuideOffsetChange={setGuideOffset}
          isMovingGuide={isMovingGuide}
          onToggleMoveGuide={() => setIsMovingGuide(v => !v)}
          onCenterGuide={handleCenterGuide}
          references={references}
          selection={selection}
          onUpdateSelection={setSelection}
          zoom={zoom}
          onZoomChange={setZoom}
        />

        {/* Right Dock: Mini Preview, Layers, Palette, References */}
        {!rightCollapsed ? (
          <div className="flex shrink-0 h-full relative group/right z-20">
            {/* Draggable Splitter on left edge of Right Panels */}
            <div
              onMouseDown={handleRightResizeMouseDown}
              onDoubleClick={() => setRightSidebarWidth(320)}
              title="Drag to resize Panels Sidebar (Double-click to reset 320px)"
              className="w-1.5 hover:w-2 cursor-col-resize hover:bg-amber-400/60 active:bg-amber-400 transition-all z-30 flex items-center justify-center -ml-1"
            >
              <div className="w-0.5 h-7 bg-neutral-700 hover:bg-amber-400 rounded-full" />
            </div>

            <aside 
              style={{ width: `${rightSidebarWidth}px` }}
              className="bg-neutral-900 border-l border-neutral-800 flex flex-col p-3 gap-3 overflow-y-auto shrink-0 z-20 shadow-2xl transition-[width] duration-75"
            >
              {/* Header with Title and Collapse Button */}
              <div className="flex items-center justify-between pb-1.5 border-b border-neutral-800 shrink-0">
                <div className="flex items-center gap-1.5">
                  <LayersIcon className="w-4 h-4 text-amber-400" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-300">Panels & Layers</span>
                </div>
                <button
                  onClick={() => setRightCollapsed(true)}
                  title="Collapse Panels Sidebar"
                  className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Mini Preview Box */}
              <MiniPreview
                canvasWidth={canvasWidth}
                canvasHeight={canvasHeight}
                layers={layers}
              />

              {/* Color Palette Selector */}
              <ColorPalette
                currentColor={currentColor}
                onSelectColor={handleColorSelect}
                colorHistory={colorHistory}
                customColors={customColors}
                onAddCustomColor={handleAddCustomColor}
                onRemoveCustomColor={handleRemoveCustomColor}
                onPickWithNativeEyedropper={handleNativeEyedropper}
              />

              {/* Layers Stack */}
              <LayersPanel
                layers={layers}
                activeLayerId={activeLayerId}
                onSelectLayer={setActiveLayerId}
                onAddLayer={handleAddLayer}
                onDeleteLayer={handleDeleteLayer}
                onDuplicateLayer={handleDuplicateLayer}
                onMergeDownLayer={handleMergeDown}
                onMoveLayer={handleMoveLayer}
                onToggleVisibility={handleToggleVisibility}
                onToggleLock={handleToggleLock}
                onChangeOpacity={handleChangeOpacity}
                onRenameLayer={handleRenameLayer}
                canvasWidth={canvasWidth}
                canvasHeight={canvasHeight}
              />

              {/* Reference Images Manager */}
              <ReferenceManager
                references={references}
                onAddReferences={handleAddReferences}
                onUpdateReference={handleUpdateReference}
                onDeleteReference={handleDeleteReference}
                activeRefId={activeRefId}
                onSelectRef={setActiveRefId}
                onColorPick={handleColorSelect}
              />
            </aside>
          </div>
        ) : (
          /* Floating Reopen Button when Right Sidebar is collapsed */
          <button
            onClick={() => setRightCollapsed(false)}
            title="Expand Panels Sidebar"
            className="absolute top-3 right-3 z-30 flex items-center gap-1.5 px-2.5 py-1.5 bg-neutral-900/95 border border-neutral-800 hover:border-amber-400/50 text-neutral-300 hover:text-amber-400 rounded-lg shadow-xl backdrop-blur-md transition-all text-xs font-medium cursor-pointer"
          >
            <PanelRightOpen className="w-4 h-4 text-amber-400" />
            <span>Panels</span>
          </button>
        )}
      </div>

      {/* Floating Reference Windows (if opened by user) */}
      {references.map(ref => {
        if (!ref.windowOpen) return null;
        return (
          <FloatingReferenceWindow
            key={ref.id}
            reference={ref}
            onClose={() => handleUpdateReference(ref.id, { windowOpen: false })}
            onColorPick={handleColorSelect}
          />
        );
      })}

      {/* Export PNG in Any Resolution Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        layers={layers}
        bodyOffsetX={bodyOffsetX}
        bodyOffsetY={bodyOffsetY}
      />

      {/* Retro Dev Wiki Dimensions & Tutorial Modal */}
      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onLoadTemplate={handleSelectStarterTemplate}
      />

      {/* Custom Canvas Size & Dimensions Modal */}
      <CustomCanvasModal
        isOpen={isCustomCanvasOpen}
        onClose={() => setIsCustomCanvasOpen(false)}
        currentWidth={canvasWidth}
        currentHeight={canvasHeight}
        onApply={handleApplyCustomCanvasSize}
      />
    </div>
  );
}
