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
  ProjectState,
  HistoryEntry,
  CanvasBgStyle 
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
import { HelpModal, HelpTabId } from './components/HelpModal';
import { AboutModal } from './components/AboutModal';
import { CustomCanvasModal } from './components/CustomCanvasModal';
import { ProjectManagerModal } from './components/ProjectManagerModal';
import { StarterModal } from './components/StarterModal';
import { AssetManagerModal } from './components/AssetManagerModal';
import { ToastContainer, ToastItem } from './components/Toast';
import { createDefaultReferenceImage } from './constants/defaultReference';
import { 
  SPRITE_ATLAS, 
  SpriteAtlasEntry, 
  RevampedStarter, 
  ScaleMode,
  extractSpritePixels, 
  placeSpriteOnCanvas, 
  REVAMPED_STARTER_TEMPLATES 
} from './utils/spriteAtlas';
import { 
  StoredProject, 
  saveProjectToDB, 
  getAllProjectsFromDB, 
  generateProjectThumbnail, 
  generateProjectId 
} from './utils/storageDB';
import { DEFAULT_THEME_ID } from './constants/themes';

export default function App() {
  // Toast notifications
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts(prev => [...prev.slice(-3), { ...toast, id }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Canvas & Preview Background Style
  const [canvasBg, setCanvasBg] = useState<CanvasBgStyle>(() => {
    const saved = localStorage.getItem('figuraymaker_canvas_bg');
    if (saved === 'light-checker' || saved === 'dark-checker' || saved === 'retro' || saved === 'dark') {
      return saved as CanvasBgStyle;
    }
    return 'dark-checker';
  });

  const handleCycleCanvasBg = useCallback(() => {
    setCanvasBg(prev => {
      const sequence: CanvasBgStyle[] = ['dark-checker', 'light-checker', 'retro', 'dark'];
      const next = sequence[(sequence.indexOf(prev) + 1) % sequence.length];
      localStorage.setItem('figuraymaker_canvas_bg', next);
      return next;
    });
  }, []);

  const handleSetCanvasBg = useCallback((style: CanvasBgStyle) => {
    setCanvasBg(style);
    localStorage.setItem('figuraymaker_canvas_bg', style);
  }, []);

  // Canvas Size Preset
  const [activePreset, setActivePreset] = useState<CanvasDimensions>(CANVAS_PRESETS[0]);
  const [guideOffset, setGuideOffset] = useState<{ x: number; y: number }>({
    x: CANVAS_PRESETS[0].bodyOffsetX,
    y: CANVAS_PRESETS[0].bodyOffsetY,
  });
  const [isMovingGuide, setIsMovingGuide] = useState<boolean>(false);
  const [isCustomCanvasOpen, setIsCustomCanvasOpen] = useState<boolean>(false);

  const activePresetRef = useRef(activePreset);
  activePresetRef.current = activePreset;
  const guideOffsetRef = useRef(guideOffset);
  guideOffsetRef.current = guideOffset;

  const canvasWidth = activePreset.width;
  const canvasHeight = activePreset.height;
  const bodyOffsetX = guideOffset.x;
  const bodyOffsetY = guideOffset.y;

  // Layers state
  const [layers, setLayers] = useState<Layer[]>(() => 
    createNoobSprite(CANVAS_PRESETS[0].width, CANVAS_PRESETS[0].height, CANVAS_PRESETS[0].bodyOffsetX, CANVAS_PRESETS[0].bodyOffsetY)
  );
  const [activeLayerId, setActiveLayerId] = useState<string>('layer-body');

  // History stack for Undo / Redo (stores layers, activeLayerId, canvasPreset, and guideOffset to prevent resize-undo glitches)
  const [history, setHistory] = useState<HistoryEntry[]>([]);
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

  // Project Name
  const [projectName, setProjectName] = useState<string>('figuraymaker-sprite');

  // Display Toggles
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showGuides, setShowGuides] = useState<boolean>(true);
  const [showNumbers, setShowNumbers] = useState<boolean>(true);
  const [zoom, setZoom] = useState<number>(18); // Default generous zoom for pixel work

  // Auto switch tool back to pencil after eyedropper color pick (off by default)
  const [autoSwitchPencil, setAutoSwitchPencil] = useState<boolean>(() => {
    try {
      return localStorage.getItem('figuray_auto_pencil') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleAutoSwitchPencil = (val: boolean) => {
    setAutoSwitchPencil(val);
    try {
      localStorage.setItem('figuray_auto_pencil', String(val));
    } catch {}
  };

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

  // Multiple Reference Images (initialized with default package reference if enabled)
  const [references, setReferences] = useState<ReferenceImage[]>(() => {
    try {
      const enabled = localStorage.getItem('figuray_default_reference_enabled');
      if (enabled === 'false') return [];
      return [createDefaultReferenceImage()];
    } catch {
      return [createDefaultReferenceImage()];
    }
  });
  const [activeRefId, setActiveRefId] = useState<string | null>(() => {
    try {
      const enabled = localStorage.getItem('figuray_default_reference_enabled');
      if (enabled === 'false') return null;
      return 'default-package-templates';
    } catch {
      return null;
    }
  });

  // Modals
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  const [isProjectManagerOpen, setIsProjectManagerOpen] = useState<boolean>(true);
  const [isStarterModalOpen, setIsStarterModalOpen] = useState<boolean>(false);
  const [isAssetManagerOpen, setIsAssetManagerOpen] = useState<boolean>(false);
  const [helpInitialTab, setHelpInitialTab] = useState<HelpTabId>('overview');

  // Active Project ID for local IndexedDB tracking
  const [currentProjectId, setCurrentProjectId] = useState<string>(() => generateProjectId());
  const autoSaveTimerRef = useRef<number | null>(null);
  const hasChosenProjectRef = useRef<boolean>(false);
  const isInitialLoadRef = useRef<boolean>(true);

  // Right sidebar tab state for smaller screens
  const [rightTab, setRightTab] = useState<'layers' | 'palette' | 'references'>('layers');

  // Sidebars & Top Bar Size and Collapse State
  const [headerHeight, setHeaderHeight] = useState<number | undefined>(undefined);
  const [leftSidebarWidth, setLeftSidebarWidth] = useState<number>(64);
  const [leftCollapsed, setLeftCollapsed] = useState<boolean>(false);
  const [rightSidebarWidth, setRightSidebarWidth] = useState<number>(320);
  const [rightCollapsed, setRightCollapsed] = useState<boolean>(false);

  // Active Theme Engine (2008 Chrome Retro vs Modern Dark)
  const [currentThemeId, setCurrentThemeId] = useState<string>(() => {
    try {
      return localStorage.getItem('figuray_theme') || DEFAULT_THEME_ID;
    } catch {
      return DEFAULT_THEME_ID;
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentThemeId);
    try {
      localStorage.setItem('figuray_theme', currentThemeId);
    } catch {
      // ignore
    }
  }, [currentThemeId]);

  // Animations & Snappy Mode Toggle
  const [animationsEnabled, setAnimationsEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('retro_animations') !== 'false';
    } catch {
      return true;
    }
  });

  const handleToggleAnimations = () => {
    setAnimationsEnabled(prev => {
      const next = !prev;
      try {
        localStorage.setItem('retro_animations', String(next));
      } catch {}
      return next;
    });
  };

  // Fluid Left Resizer (Touch & Mouse, NO Sluggish Snapping)
  const handleLeftResizeStart = (clientX: number) => {
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMove = (currX: number) => {
      const maxW = Math.max(200, window.innerWidth - 60);
      const newWidth = Math.max(36, Math.min(maxW, Math.round(currX)));
      setLeftSidebarWidth(newWidth);
    };

    const handleMouseMove = (e: MouseEvent) => onMove(e.clientX);
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) onMove(e.touches[0].clientX);
    };

    const handleEnd = () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
      window.removeEventListener('touchcancel', handleEnd);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleEnd);
    window.addEventListener('touchcancel', handleEnd);
  };

  // Fluid Right Resizer (Touch & Mouse, NO Sluggish Snapping)
  const handleRightResizeStart = (clientX: number) => {
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMove = (currX: number) => {
      const newWidth = Math.round(window.innerWidth - currX);
      const maxW = Math.max(200, window.innerWidth - 50);
      setRightSidebarWidth(Math.max(50, Math.min(maxW, newWidth)));
    };

    const handleMouseMove = (e: MouseEvent) => onMove(e.clientX);
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) onMove(e.touches[0].clientX);
    };

    const handleEnd = () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
      window.removeEventListener('touchcancel', handleEnd);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleEnd);
    window.addEventListener('touchcancel', handleEnd);
  };

  // Fluid Header Height Resizer (Touch & Mouse, NO Sluggish Snapping)
  const handleHeaderResizeStart = (clientY: number) => {
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';

    const onMove = (currY: number) => {
      const newHeight = Math.max(40, Math.min(120, Math.round(currY)));
      setHeaderHeight(newHeight);
    };

    const handleMouseMove = (e: MouseEvent) => onMove(e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) onMove(e.touches[0].clientY);
    };

    const handleEnd = () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
      window.removeEventListener('touchcancel', handleEnd);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleEnd);
    window.addEventListener('touchcancel', handleEnd);
  };

  const handleLeftResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleLeftResizeStart(e.clientX);
  };
  const handleLeftResizeTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) handleLeftResizeStart(e.touches[0].clientX);
  };

  const handleRightResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleRightResizeStart(e.clientX);
  };
  const handleRightResizeTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) handleRightResizeStart(e.touches[0].clientX);
  };

  const handleHeaderResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleHeaderResizeStart(e.clientY);
  };
  const handleHeaderResizeTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) handleHeaderResizeStart(e.touches[0].clientY);
  };

  // Save history state
  const pushHistory = useCallback((
    newLayers: Layer[], 
    newActiveId = activeLayerId,
    overridePreset?: CanvasDimensions,
    overrideGuideOffset?: { x: number; y: number }
  ) => {
    const currentPreset = overridePreset || activePresetRef.current;
    const currentOffset = overrideGuideOffset || guideOffsetRef.current;

    // Attach width and height to each layer for safety
    const stampedLayers: Layer[] = newLayers.map(l => ({
      ...l,
      width: currentPreset.width,
      height: currentPreset.height,
    }));

    setHistory(prev => {
      const validHistory = historyIndex >= 0 ? prev.slice(0, historyIndex + 1) : [];
      const newEntry: HistoryEntry = {
        layers: JSON.parse(JSON.stringify(stampedLayers)),
        activeLayerId: newActiveId,
        preset: { ...currentPreset },
        guideOffset: { ...currentOffset },
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
      const initialPreset = activePresetRef.current;
      const initialOffset = guideOffsetRef.current;
      const stampedLayers: Layer[] = layers.map(l => ({
        ...l,
        width: initialPreset.width,
        height: initialPreset.height,
      }));
      setHistory([{
        layers: JSON.parse(JSON.stringify(stampedLayers)),
        activeLayerId,
        preset: { ...initialPreset },
        guideOffset: { ...initialOffset },
      }]);
      setHistoryIndex(0);
    }
  }, [layers, activeLayerId]);

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const targetState = history[historyIndex - 1];

      // Restore canvas preset and dimensions if undo crosses a canvas resize
      if (targetState.preset) {
        setActivePreset(targetState.preset);
      }
      if (targetState.guideOffset) {
        setGuideOffset(targetState.guideOffset);
      }

      // Reset any active selection to avoid stale coordinates
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

      setLayers(JSON.parse(JSON.stringify(targetState.layers)));
      setActiveLayerId(targetState.activeLayerId);
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex]);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const targetState = history[historyIndex + 1];

      // Restore canvas preset and dimensions if redo crosses a canvas resize
      if (targetState.preset) {
        setActivePreset(targetState.preset);
      }
      if (targetState.guideOffset) {
        setGuideOffset(targetState.guideOffset);
      }

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
  const handleColorSelect = useCallback((color: string) => {
    setCurrentColor(color);
    setColorHistory(prev => {
      const filtered = prev.filter(c => c.toUpperCase() !== color.toUpperCase());
      return [color, ...filtered].slice(0, 16);
    });
  }, []);

  // Eyedropper pick handler (auto switches back to pencil if option is enabled)
  const handleEyedropPick = useCallback((color: string) => {
    handleColorSelect(color);
    if (autoSwitchPencil) {
      setCurrentTool('pencil');
    }
  }, [autoSwitchPencil, handleColorSelect]);

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
          handleEyedropPick(result.sRGBHex.toUpperCase());
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
      width: canvasWidth,
      height: canvasHeight,
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
      width: layer.width || canvasWidth,
      height: layer.height || canvasHeight,
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
      width: canvasWidth,
      height: canvasHeight,
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

  const handleReorderLayers = useCallback((newLayers: Layer[]) => {
    setLayers(newLayers);
    pushHistory(newLayers, activeLayerId);
  }, [activeLayerId, pushHistory]);

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
    const newGuideOffset = { x: preset.bodyOffsetX, y: preset.bodyOffsetY };
    setGuideOffset(newGuideOffset);

    // Clear selection so floating pixels don't get mispositioned across resize
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

    // Remap layers to new size with centered alignment
    const offsetX = Math.floor((preset.width - canvasWidth) / 2);
    const offsetY = Math.floor((preset.height - canvasHeight) / 2);

    const newLayers: Layer[] = layers.map(l => {
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
        width: preset.width,
        height: preset.height,
        pixels: newPixels,
      };
    });
    setLayers(newLayers);
    pushHistory(newLayers, activeLayerId, preset, newGuideOffset);
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

    // Clear selection so floating pixels don't get mispositioned across resize
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

    const newLayers: Layer[] = layers.map(layer => {
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
        width: newWidth,
        height: newHeight,
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
    pushHistory(newLayers, activeLayerId, customPreset, newGuideOffset);
  };

  const handleCenterGuide = () => {
    const centeredX = Math.floor((canvasWidth - 21) / 2);
    const centeredY = Math.floor((canvasHeight - 28) / 2);
    setGuideOffset({ x: centeredX, y: centeredY });
  };

  // Starter Templates (revamped with authentic hand-drawn sprites from DavidBlxTemplate, scaled to 1x wiki default or 2x HD)
  const handleLoadRevampedStarter = async (
    starter: RevampedStarter,
    autoResizeCanvas: boolean,
    scaleMode: ScaleMode = '1x'
  ) => {
    const recommendedW = scaleMode === '1x' ? starter.recommendedWidth1x : starter.recommendedWidth2x;
    const recommendedH = scaleMode === '1x' ? starter.recommendedHeight1x : starter.recommendedHeight2x;

    let targetWidth = canvasWidth;
    let targetHeight = canvasHeight;
    let targetPreset = activePreset;
    let targetGuideOffset = guideOffset;

    if (autoResizeCanvas && (canvasWidth !== recommendedW || canvasHeight !== recommendedH)) {
      targetWidth = recommendedW;
      targetHeight = recommendedH;
      targetPreset = {
        width: targetWidth,
        height: targetHeight,
        name: `Custom (${targetWidth}×${targetHeight})`,
        description: `Auto-fitted for ${starter.name} (${scaleMode})`,
        bodyOffsetX: Math.floor((targetWidth - 21) / 2),
        bodyOffsetY: Math.floor((targetHeight - 28) / 2),
      };
      targetGuideOffset = { x: targetPreset.bodyOffsetX, y: targetPreset.bodyOffsetY };
      setActivePreset(targetPreset);
      setGuideOffset(targetGuideOffset);
    }

    const totalPixels = targetWidth * targetHeight;

    if (starter.id === 'starter-empty' || starter.spriteIndex === 0) {
      const blankLayers: Layer[] = [
        {
          id: 'layer-body',
          name: 'Layer 1',
          visible: true,
          opacity: 1,
          locked: false,
          pixels: new Array(totalPixels).fill(''),
          width: targetWidth,
          height: targetHeight,
        },
      ];
      setLayers(blankLayers);
      setActiveLayerId('layer-body');
      pushHistory(blankLayers, 'layer-body', targetPreset, targetGuideOffset);
      addToast({
        title: 'Empty Canvas Created',
        message: 'Blank canvas ready for drawing',
        type: 'info',
        duration: 2500,
      });
      return;
    }

    try {
      const spriteEntry = SPRITE_ATLAS.find(s => s.index === starter.spriteIndex);
      if (!spriteEntry) {
        throw new Error('Sprite not found in atlas');
      }

      const extracted = await extractSpritePixels(spriteEntry, scaleMode);
      const placedPixels = placeSpriteOnCanvas(
        extracted.pixels,
        extracted.width,
        extracted.height,
        targetWidth,
        targetHeight
      );

      const newLayers: Layer[] = [
        {
          id: 'layer-starter-base',
          name: `${starter.name} Base (${scaleMode})`,
          visible: true,
          opacity: 1,
          locked: false,
          pixels: placedPixels,
          width: targetWidth,
          height: targetHeight,
        },
        {
          id: 'layer-starter-overlay',
          name: 'Details / Hat Layer',
          visible: true,
          opacity: 1,
          locked: false,
          pixels: new Array(totalPixels).fill(''),
          width: targetWidth,
          height: targetHeight,
        },
      ];

      setLayers(newLayers);
      setActiveLayerId('layer-starter-overlay');
      pushHistory(newLayers, 'layer-starter-overlay', targetPreset, targetGuideOffset);
      addToast({
        title: `Loaded ${starter.name} (${scaleMode})`,
        message: scaleMode === '1x' ? 'Scaled to 1x canonical wiki proportions (11x10 body)' : 'Loaded at 2x raw template resolution',
        type: 'success',
        icon: 'sparkles',
        duration: 3500,
      });
    } catch (err) {
      console.error('Failed to load starter sprite:', err);
      addToast({
        title: 'Failed to Load Starter',
        message: String(err),
        type: 'error',
        duration: 3500,
      });
    }
  };

  const handleSelectStarterTemplate = (templateId: string) => {
    // If it's a revamped starter id
    const foundRevamped = REVAMPED_STARTER_TEMPLATES.find(t => t.id === templateId);
    if (foundRevamped) {
      handleLoadRevampedStarter(foundRevamped, true, '1x');
      return;
    }

    // Map old legacy IDs to revamped human-drawn equivalents at 1x
    if (templateId === 'noob') {
      const s = REVAMPED_STARTER_TEMPLATES.find(t => t.id === 'starter-noob-1');
      if (s) handleLoadRevampedStarter(s, false, '1x');
      return;
    }
    if (templateId === 'ibot') {
      const s = REVAMPED_STARTER_TEMPLATES.find(t => t.id === 'starter-ibot');
      if (s) handleLoadRevampedStarter(s, false, '1x');
      return;
    }
    if (templateId === 'wireframe') {
      const s = REVAMPED_STARTER_TEMPLATES.find(t => t.id === 'starter-wireframe-r6');
      if (s) handleLoadRevampedStarter(s, false, '1x');
      return;
    }
    if (templateId === 'empty') {
      const s = REVAMPED_STARTER_TEMPLATES.find(t => t.id === 'starter-empty');
      if (s) handleLoadRevampedStarter(s, false, '1x');
      return;
    }

    // Fallback for legacy
    setIsStarterModalOpen(true);
  };

  // Asset Manager Actions: Spawn as dedicated new layer with interactive floating selection bounding box
  const handleInsertSpriteAsNewLayer = (
    sprite: SpriteAtlasEntry,
    extracted: { pixels: string[]; width: number; height: number },
    scaleMode: ScaleMode = '1x'
  ) => {
    // 1. Create a fresh empty layer for this asset
    const newLayerId = `layer-${Date.now()}`;
    const newLayer: Layer = {
      id: newLayerId,
      name: `${sprite.name} (${scaleMode})`,
      visible: true,
      opacity: 1,
      locked: false,
      pixels: new Array(canvasWidth * canvasHeight).fill(''),
      width: canvasWidth,
      height: canvasHeight,
    };
    const updatedLayers = [...layers, newLayer];
    setLayers(updatedLayers);
    setActiveLayerId(newLayerId);

    // 2. Calculate centered spawn coordinates
    const spawnX = Math.floor((canvasWidth - extracted.width) / 2);
    const spawnY = Math.floor((canvasHeight - extracted.height) / 2);

    // 3. Create full draggable bounding box mask (entire rectangular area allows dragging without accidental stamping)
    const floatingMask = new Array(extracted.width * extracted.height).fill(true);

    // 4. Initialize floating selection state
    setSelection({
      active: true,
      type: 'rectangle',
      startX: spawnX,
      startY: spawnY,
      endX: spawnX + extracted.width - 1,
      endY: spawnY + extracted.height - 1,
      floating: true,
      floatingX: spawnX,
      floatingY: spawnY,
      floatingWidth: extracted.width,
      floatingHeight: extracted.height,
      floatingPixels: extracted.pixels,
      floatingMask,
    });

    // 5. Switch active tool to 'select' and ensure modal is closed
    setCurrentTool('select');
    setIsAssetManagerOpen(false);

    // 6. Push history snapshot and show guidance toast
    pushHistory(updatedLayers, newLayerId, activePreset, guideOffset);
    addToast({
      title: `Ready to Stamp: ${sprite.name}`,
      message: 'Drag to position. Use Arrow keys to nudge 1px. Press Enter or click Stamp to place.',
      type: 'info',
      icon: 'layer',
      duration: 5000,
    });
  };

  const handleStampSpriteOntoActiveLayer = (
    sprite: SpriteAtlasEntry,
    placedPixels: string[],
    scaleMode: ScaleMode = '1x'
  ) => {
    const activeLayer = layers.find(l => l.id === activeLayerId);
    if (!activeLayer || activeLayer.locked) {
      addToast({
        title: 'Cannot Stamp',
        message: 'Active layer is locked or not found',
        type: 'warning',
        duration: 3000,
      });
      return;
    }

    const updatedPixels = [...activeLayer.pixels];
    for (let i = 0; i < placedPixels.length; i++) {
      if (placedPixels[i]) {
        updatedPixels[i] = placedPixels[i];
      }
    }

    const updatedLayers = layers.map(l => l.id === activeLayerId ? { ...l, pixels: updatedPixels } : l);
    setLayers(updatedLayers);
    pushHistory(updatedLayers, activeLayerId, activePreset, guideOffset);
    addToast({
      title: 'Stamped onto Layer',
      message: `"${sprite.name}" (${scaleMode}) merged onto ${activeLayer.name}`,
      type: 'success',
      icon: 'sparkles',
      duration: 3000,
    });
  };

  const handleAddSpriteAsFloatingReference = (sprite: SpriteAtlasEntry) => {
    const refId = `ref-${sprite.id}-${Date.now()}`;
    const newRef: ReferenceImage = {
      id: refId,
      name: `${sprite.name} (${sprite.bounds.width}×${sprite.bounds.height})`,
      url: sprite.file,
      width: sprite.bounds.width,
      height: sprite.bounds.height,
      traceMode: false,
      traceOpacity: 0.6,
      traceX: Math.floor((canvasWidth - sprite.bounds.width) / 2),
      traceY: Math.floor((canvasHeight - sprite.bounds.height) / 2),
      traceScale: 1,
      windowOpen: true,
      windowX: 80,
      windowY: 80,
      windowZoom: 4,
      windowWidth: 260,
      windowHeight: 260,
    };
    setReferences(prev => [...prev, newRef]);
    setActiveRefId(refId);
    addToast({
      title: 'Added Reference Window',
      message: `Opened floating reference for ${sprite.name}`,
      type: 'success',
      duration: 3000,
    });
  };

  const handleSetSpriteAsTraceOverlay = (sprite: SpriteAtlasEntry) => {
    const refId = `trace-${sprite.id}-${Date.now()}`;
    const newRef: ReferenceImage = {
      id: refId,
      name: `${sprite.name} [Trace Ghost]`,
      url: sprite.file,
      width: sprite.bounds.width,
      height: sprite.bounds.height,
      traceMode: true,
      traceOpacity: 0.5,
      traceX: Math.floor((canvasWidth - sprite.bounds.width) / 2),
      traceY: Math.floor((canvasHeight - sprite.bounds.height) / 2),
      traceScale: 1,
      windowOpen: false,
    };
    setReferences(prev => [...prev, newRef]);
    setActiveRefId(refId);
    addToast({
      title: 'Trace Ghost Enabled',
      message: `Overlaying ${sprite.name} directly on canvas`,
      type: 'success',
      duration: 3000,
    });
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
  const handleCommitFloatingSelection = useCallback(() => {
    if (!selection.active || !selection.floating) return;
    const activeLayer = layers.find(l => l.id === activeLayerId);
    if (!activeLayer) return;

    const newPixels = [...activeLayer.pixels];
    const { floatingX, floatingY, floatingWidth, floatingHeight, floatingPixels, floatingMask } = selection;

    for (let dy = 0; dy < floatingHeight; dy++) {
      for (let dx = 0; dx < floatingWidth; dx++) {
        const localIdx = dy * floatingWidth + dx;
        if (floatingMask && !floatingMask[localIdx]) continue;
        const color = floatingPixels[localIdx];
        if (color && color !== '') {
          const targetX = floatingX + dx;
          const targetY = floatingY + dy;
          if (targetX >= 0 && targetX < canvasWidth && targetY >= 0 && targetY < canvasHeight) {
            newPixels[targetY * canvasWidth + targetX] = color;
          }
        }
      }
    }

    handleUpdateLayerPixels(activeLayer.id, newPixels, true);
    const newSelectedKeys: string[] = [];
    if (floatingMask) {
      for (let dy = 0; dy < floatingHeight; dy++) {
        for (let dx = 0; dx < floatingWidth; dx++) {
          if (floatingMask[dy * floatingWidth + dx]) {
            newSelectedKeys.push(`${floatingX + dx},${floatingY + dy}`);
          }
        }
      }
    }

    setSelection(prev => ({
      ...prev,
      floating: false,
      startX: floatingX,
      startY: floatingY,
      endX: floatingX + floatingWidth - 1,
      endY: floatingY + floatingHeight - 1,
      selectedPixelKeys: newSelectedKeys.length > 0 ? newSelectedKeys : prev.selectedPixelKeys,
      floatingPixels: [],
      floatingMask: undefined,
    }));
  }, [selection, layers, activeLayerId, canvasWidth, canvasHeight, handleUpdateLayerPixels]);

  const handleDeleteSelection = useCallback(() => {
    if (!selection.active) return;
    const activeLayer = layers.find(l => l.id === activeLayerId);
    if (!activeLayer) return;

    if (selection.floating) {
      // Discard floating pixels without stamping them back down
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
      pushHistory(layers, activeLayer.id);
      return;
    }

    const newPixels = [...activeLayer.pixels];
    if (selection.type === 'lasso' && selection.selectedPixelKeys) {
      const keys = new Set(selection.selectedPixelKeys);
      for (const key of keys) {
        const [xs, ys] = key.split(',');
        const x = parseInt(xs, 10);
        const y = parseInt(ys, 10);
        if (x >= 0 && x < canvasWidth && y >= 0 && y < canvasHeight) {
          newPixels[y * canvasWidth + x] = '';
        }
      }
    } else {
      const minX = Math.min(selection.startX, selection.endX);
      const maxX = Math.max(selection.startX, selection.endX);
      const minY = Math.min(selection.startY, selection.endY);
      const maxY = Math.max(selection.startY, selection.endY);
      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          if (x >= 0 && x < canvasWidth && y >= 0 && y < canvasHeight) {
            newPixels[y * canvasWidth + x] = '';
          }
        }
      }
    }

    handleUpdateLayerPixels(activeLayer.id, newPixels, true);
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
  }, [selection, layers, activeLayerId, canvasWidth, canvasHeight, handleUpdateLayerPixels, pushHistory]);

  const handleClearSelection = useCallback(() => {
    if (selection.floating) {
      handleCommitFloatingSelection();
    }
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
      selectedPixelKeys: undefined,
    });
  }, [selection.floating, handleCommitFloatingSelection]);

  const handleFlipHorizontalSelection = () => {
    if (!selection.active) return;
    const activeLayer = layers.find(l => l.id === activeLayerId);
    if (!activeLayer) return;

    if (selection.floating) {
      const flipped = flipPixelsHorizontal(selection.floatingPixels, selection.floatingWidth, selection.floatingHeight);
      let flippedMask = selection.floatingMask;
      if (flippedMask) {
        const newMask = new Array(selection.floatingWidth * selection.floatingHeight).fill(false);
        for (let y = 0; y < selection.floatingHeight; y++) {
          for (let x = 0; x < selection.floatingWidth; x++) {
            newMask[y * selection.floatingWidth + (selection.floatingWidth - 1 - x)] = flippedMask[y * selection.floatingWidth + x];
          }
        }
        flippedMask = newMask;
      }
      setSelection(prev => ({
        ...prev,
        floatingPixels: flipped,
        floatingMask: flippedMask,
      }));
      return;
    }

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
    if (!selection.active) return;
    const activeLayer = layers.find(l => l.id === activeLayerId);
    if (!activeLayer) return;

    if (selection.floating) {
      const flipped = flipPixelsVertical(selection.floatingPixels, selection.floatingWidth, selection.floatingHeight);
      let flippedMask = selection.floatingMask;
      if (flippedMask) {
        const newMask = new Array(selection.floatingWidth * selection.floatingHeight).fill(false);
        for (let y = 0; y < selection.floatingHeight; y++) {
          for (let x = 0; x < selection.floatingWidth; x++) {
            newMask[(selection.floatingHeight - 1 - y) * selection.floatingWidth + x] = flippedMask[y * selection.floatingWidth + x];
          }
        }
        flippedMask = newMask;
      }
      setSelection(prev => ({
        ...prev,
        floatingPixels: flipped,
        floatingMask: flippedMask,
      }));
      return;
    }

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

  // Active Layer Transform Helpers (for Header Desktop Ribbon)
  const handleFlipActiveLayerH = useCallback(() => {
    const layer = layers.find(l => l.id === activeLayerId);
    if (!layer || layer.locked) return;
    const flipped = flipPixelsHorizontal(layer.pixels, canvasWidth, canvasHeight);
    handleUpdateLayerPixels(activeLayerId, flipped, true);
  }, [layers, activeLayerId, canvasWidth, canvasHeight, handleUpdateLayerPixels]);

  const handleFlipActiveLayerV = useCallback(() => {
    const layer = layers.find(l => l.id === activeLayerId);
    if (!layer || layer.locked) return;
    const flipped = flipPixelsVertical(layer.pixels, canvasWidth, canvasHeight);
    handleUpdateLayerPixels(activeLayerId, flipped, true);
  }, [layers, activeLayerId, canvasWidth, canvasHeight, handleUpdateLayerPixels]);

  const handleCenterActiveLayer = useCallback(() => {
    const layer = layers.find(l => l.id === activeLayerId);
    if (!layer || layer.locked) return;
    let minX = canvasWidth, maxX = -1, minY = canvasHeight, maxY = -1;
    for (let y = 0; y < canvasHeight; y++) {
      for (let x = 0; x < canvasWidth; x++) {
        if (layer.pixels[y * canvasWidth + x]) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < 0) return; // layer is empty
    const contentW = maxX - minX + 1;
    const contentH = maxY - minY + 1;
    const targetX = Math.floor((canvasWidth - contentW) / 2);
    const targetY = Math.floor((canvasHeight - contentH) / 2);
    const dx = targetX - minX;
    const dy = targetY - minY;
    if (dx === 0 && dy === 0) return;

    const newPixels = new Array(canvasWidth * canvasHeight).fill('');
    for (let y = 0; y < canvasHeight; y++) {
      for (let x = 0; x < canvasWidth; x++) {
        const color = layer.pixels[y * canvasWidth + x];
        if (color) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < canvasWidth && ny >= 0 && ny < canvasHeight) {
            newPixels[ny * canvasWidth + nx] = color;
          }
        }
      }
    }
    handleUpdateLayerPixels(activeLayerId, newPixels, true);
  }, [layers, activeLayerId, canvasWidth, canvasHeight, handleUpdateLayerPixels]);

  const handleClearActiveLayer = useCallback(() => {
    const layer = layers.find(l => l.id === activeLayerId);
    if (!layer || layer.locked) return;
    const empty = new Array(canvasWidth * canvasHeight).fill('');
    handleUpdateLayerPixels(activeLayerId, empty, true);
  }, [layers, activeLayerId, canvasWidth, canvasHeight, handleUpdateLayerPixels]);

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
    const safeName = (projectName || 'figuraymaker-sprite').toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    a.download = `${safeName}.json`;
    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addToast({
      title: 'Project File Saved',
      message: `${safeName}.json downloaded successfully`,
      type: 'success',
      icon: 'json',
      duration: 3500,
    });
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
          const normalizedLayers: Layer[] = project.layers.map(l => ({
            ...l,
            width: project.canvasWidth,
            height: project.canvasHeight,
          }));
          setActivePreset(matchedPreset);
          setGuideOffset({ x: loadedOx, y: loadedOy });
          setLayers(normalizedLayers);
          setActiveLayerId(project.activeLayerId || normalizedLayers[0].id);
          if (project.selectedColor) setCurrentColor(project.selectedColor);
          if (project.references) setReferences(project.references);
          const projectTitle = (project as any).name || file.name.replace(/\.json$/i, '') || 'Imported Sprite';
          setProjectName(projectTitle);
          const newLoadedId = generateProjectId();
          setCurrentProjectId(newLoadedId);
          hasChosenProjectRef.current = true;

          // Generate thumbnail & save into IndexedDB immediately
          const thumbnail = generateProjectThumbnail(normalizedLayers, project.canvasWidth, project.canvasHeight);
          saveProjectToDB({
            id: newLoadedId,
            name: projectTitle,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            thumbnailUrl: thumbnail,
            canvasWidth: project.canvasWidth,
            canvasHeight: project.canvasHeight,
            canvasPresetName: matchedPreset.name,
            layers: normalizedLayers,
            activeLayerId: project.activeLayerId || normalizedLayers[0].id,
            references: project.references,
            selectedColor: project.selectedColor,
            bodyOffsetX: loadedOx,
            bodyOffsetY: loadedOy,
          }).catch(err => console.error('Failed to save imported project to IndexedDB:', err));

          pushHistory(normalizedLayers, project.activeLayerId || normalizedLayers[0].id, matchedPreset, { x: loadedOx, y: loadedOy });
        }
      } catch {
        alert('Invalid project file format.');
      }
    };
    reader.readAsText(file);
  };

  // Select existing project from Project Manager
  const handleSelectStoredProject = useCallback((stored: StoredProject) => {
    hasChosenProjectRef.current = true;
    setCurrentProjectId(stored.id);
    setProjectName(stored.name || 'Untitled Sprite');

    const matchedPreset = CANVAS_PRESETS.find(p => p.name === stored.canvasPresetName) || {
      name: `Custom (${stored.canvasWidth} × ${stored.canvasHeight})`,
      width: stored.canvasWidth,
      height: stored.canvasHeight,
      description: 'Custom canvas dimensions',
      bodyOffsetX: stored.bodyOffsetX !== undefined ? stored.bodyOffsetX : Math.floor((stored.canvasWidth - 21) / 2),
      bodyOffsetY: stored.bodyOffsetY !== undefined ? stored.bodyOffsetY : Math.floor((stored.canvasHeight - 28) / 2),
    };
    setActivePreset(matchedPreset);

    const newGuideOffset = {
      x: stored.bodyOffsetX !== undefined ? stored.bodyOffsetX : matchedPreset.bodyOffsetX,
      y: stored.bodyOffsetY !== undefined ? stored.bodyOffsetY : matchedPreset.bodyOffsetY,
    };
    setGuideOffset(newGuideOffset);

    const normalizedLayers: Layer[] = stored.layers.map(l => ({
      ...l,
      width: stored.canvasWidth,
      height: stored.canvasHeight,
    }));
    setLayers(normalizedLayers);
    setActiveLayerId(stored.activeLayerId || normalizedLayers[0]?.id || 'layer-body');
    if (stored.selectedColor) setCurrentColor(stored.selectedColor);
    if (stored.references) setReferences(stored.references);

    pushHistory(normalizedLayers, stored.activeLayerId || normalizedLayers[0]?.id, matchedPreset, newGuideOffset);
    setIsProjectManagerOpen(false);
  }, [pushHistory]);

  // Create new project from Project Manager
  const handleCreateNewProject = useCallback((
    name: string, 
    presetName: string, 
    customW?: number, 
    customH?: number,
    includeDefaultRef: boolean = true
  ) => {
    hasChosenProjectRef.current = true;
    const newId = generateProjectId();
    setCurrentProjectId(newId);
    setProjectName(name);

    let targetPreset: CanvasDimensions;
    if (presetName === 'custom' && customW && customH) {
      targetPreset = {
        name: `Custom (${customW} × ${customH})`,
        width: customW,
        height: customH,
        description: `Custom ${customW}x${customH} canvas dimensions`,
        bodyOffsetX: Math.floor((customW - 21) / 2),
        bodyOffsetY: Math.floor((customH - 28) / 2),
      };
    } else {
      targetPreset = CANVAS_PRESETS.find(p => p.name === presetName) || CANVAS_PRESETS[1];
    }

    setActivePreset(targetPreset);
    const newGuideOffset = { x: targetPreset.bodyOffsetX, y: targetPreset.bodyOffsetY };
    setGuideOffset(newGuideOffset);

    const initialLayers: Layer[] = [
      {
        id: 'layer-body',
        name: 'Layer 1',
        visible: true,
        opacity: 1,
        locked: false,
        pixels: new Array(targetPreset.width * targetPreset.height).fill(''),
        width: targetPreset.width,
        height: targetPreset.height,
      }
    ];
    setLayers(initialLayers);
    setActiveLayerId('layer-body');

    const newReferences = includeDefaultRef ? [createDefaultReferenceImage()] : [];
    setReferences(newReferences);
    setActiveRefId(newReferences[0]?.id || null);

    pushHistory(initialLayers, 'layer-body', targetPreset, newGuideOffset);

    // Initial save in storageDB
    const thumbnail = generateProjectThumbnail(initialLayers, targetPreset.width, targetPreset.height);
    saveProjectToDB({
      id: newId,
      name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      thumbnailUrl: thumbnail,
      canvasWidth: targetPreset.width,
      canvasHeight: targetPreset.height,
      canvasPresetName: targetPreset.name,
      layers: initialLayers,
      activeLayerId: 'layer-body',
      references: newReferences,
      selectedColor: currentColor,
      bodyOffsetX: newGuideOffset.x,
      bodyOffsetY: newGuideOffset.y,
    }).catch(err => console.error('Failed to save newly created project to IndexedDB:', err));

    setIsProjectManagerOpen(false);
  }, [currentColor, pushHistory]);

  // Dismiss / close Project Manager modal
  const handleCloseProjectManager = useCallback(async () => {
    setIsProjectManagerOpen(false);
    if (!hasChosenProjectRef.current) {
      hasChosenProjectRef.current = true;
      try {
        const storedList = await getAllProjectsFromDB();
        if (storedList.length > 0) {
          handleSelectStoredProject(storedList[0]);
        }
      } catch (err) {
        console.error('Failed to load recent project on dismiss:', err);
      }
    }
  }, [handleSelectStoredProject]);

  // Import JSON from modal file picker
  const handleImportJsonFileFromModal = useCallback((file: File) => {
    handleLoadProject(file);
    setIsProjectManagerOpen(false);
  }, []);

  // Debounced Auto-Save Engine
  useEffect(() => {
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      return;
    }

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = window.setTimeout(async () => {
      try {
        const thumbnail = generateProjectThumbnail(layers, canvasWidth, canvasHeight);
        const projectData: StoredProject = {
          id: currentProjectId,
          name: projectName || 'Untitled Sprite',
          updatedAt: Date.now(),
          createdAt: Date.now(),
          thumbnailUrl: thumbnail,
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
        await saveProjectToDB(projectData);
      } catch (err) {
        console.error('Auto-save error:', err);
      }
    }, 1500);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [layers, canvasWidth, canvasHeight, projectName, activePreset, references, currentColor, guideOffset, currentProjectId, activeLayerId]);

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
      } else if (e.key.toLowerCase() === 'q') {
        setCurrentTool('lasso');
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selection.active) {
          e.preventDefault();
          handleDeleteSelection();
        }
      } else if (e.key === 'Enter') {
        if (selection.active && selection.floating) {
          e.preventDefault();
          handleCommitFloatingSelection();
        }
      } else if (e.key === 'Escape') {
        handleClearSelection();
      } else if (selection.active && selection.floating && (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault();
        const dx = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0;
        const dy = e.key === 'ArrowUp' ? -1 : e.key === 'ArrowDown' ? 1 : 0;
        setSelection(prev => ({
          ...prev,
          floatingX: prev.floatingX + dx,
          floatingY: prev.floatingY + dy,
        }));
      } else if (e.key.toLowerCase() === 'g') {
        setShowGrid(g => !g);
      } else if (e.key.toLowerCase() === 'h') {
        setShowGuides(g => !g);
      } else if (e.key.toLowerCase() === 'n') {
        setShowNumbers(n => !n);
      } else if (e.key.toLowerCase() === 's' && !e.ctrlKey && !e.metaKey) {
        setSymmetryActive(s => !s);
      } else if (e.key === '[') {
        setBrushSize(b => Math.max(1, b - 1));
      } else if (e.key === ']') {
        setBrushSize(b => Math.min(32, b + 1));
      } else if (e.key === '?' || (e.key === '/' && e.shiftKey) || e.key === 'F1') {
        e.preventDefault();
        setHelpInitialTab('overview');
        setIsHelpOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, selection.active, selection.floating, handleDeleteSelection, handleCommitFloatingSelection, handleClearSelection]);

  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden bg-app-theme text-primary-theme font-sans select-none ${animationsEnabled ? '' : 'snappy-mode'}`}>
      {/* Top Header */}
      <Header
        canvasPresetName={activePreset.name}
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        onSelectCanvasPreset={handleSelectCanvasPreset}
        onOpenCustomCanvasModal={() => setIsCustomCanvasOpen(true)}
        onSelectStarterTemplate={handleSelectStarterTemplate}
        onOpenStarterModal={() => setIsStarterModalOpen(true)}
        onOpenAssetManager={() => setIsAssetManagerOpen(true)}
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
        onOpenHelpModal={() => {
          setHelpInitialTab('overview');
          setIsHelpOpen(true);
        }}
        onOpenAboutModal={() => setIsAboutOpen(true)}
        onOpenProjectManager={() => setIsProjectManagerOpen(true)}
        onSaveProject={handleSaveProject}
        onLoadProject={handleLoadProject}
        leftCollapsed={leftCollapsed}
        onToggleLeftSidebar={() => setLeftCollapsed(v => !v)}
        rightCollapsed={rightCollapsed}
        onToggleRightSidebar={() => setRightCollapsed(v => !v)}
        animationsEnabled={animationsEnabled}
        onToggleAnimations={handleToggleAnimations}
        headerHeight={headerHeight}
        currentThemeId={currentThemeId}
        onSelectTheme={setCurrentThemeId}
        canvasBg={canvasBg}
        onCycleCanvasBg={handleCycleCanvasBg}
        projectName={projectName}
        onProjectNameChange={setProjectName}
        activeLayerName={layers.find(l => l.id === activeLayerId)?.name || 'Body'}
        currentColor={currentColor}
        onFlipActiveLayerH={handleFlipActiveLayerH}
        onFlipActiveLayerV={handleFlipActiveLayerV}
        onCenterActiveLayer={handleCenterActiveLayer}
        onClearActiveLayer={handleClearActiveLayer}
      />

      {/* Draggable Splitter on bottom edge of Top Bar */}
      <div
        onMouseDown={handleHeaderResizeMouseDown}
        onTouchStart={handleHeaderResizeTouchStart}
        onDoubleClick={() => setHeaderHeight(undefined)}
        title="Drag to resize Top Bar height (Double-click to reset auto-height)"
        className="h-1 hover:h-1.5 cursor-row-resize hover:bg-[var(--text-accent)] active:bg-[var(--text-accent)] transition-all z-40 shrink-0 w-full flex items-center justify-center bg-surface-raised-theme border-b border-ui-theme"
      >
        <div className="h-0.5 w-12 bg-ui-theme hover:bg-[var(--text-accent)] rounded-full" />
      </div>

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
              isFloating={selection.floating}
              onCommitFloatingSelection={handleCommitFloatingSelection}
              onFlipHorizontalSelection={handleFlipHorizontalSelection}
              onFlipVerticalSelection={handleFlipVerticalSelection}
              onDeleteSelection={handleDeleteSelection}
              onClearSelection={handleClearSelection}
              canUndo={historyIndex > 0}
              canRedo={historyIndex < history.length - 1}
              onUndo={handleUndo}
              onRedo={handleRedo}
              width={leftSidebarWidth}
              onCollapse={() => setLeftCollapsed(true)}
              autoSwitchPencil={autoSwitchPencil}
              onToggleAutoSwitchPencil={handleToggleAutoSwitchPencil}
              onOpenAssetManager={() => setIsAssetManagerOpen(true)}
            />
            {/* Draggable Splitter on right edge of Left Toolbar */}
            <div
              onMouseDown={handleLeftResizeMouseDown}
              onTouchStart={handleLeftResizeTouchStart}
              onDoubleClick={() => setLeftSidebarWidth(64)}
              title="Drag to resize Tools Sidebar (Double-click to reset)"
              className="w-1.5 hover:w-2 cursor-col-resize hover:bg-[var(--text-accent)] active:bg-[var(--text-accent)] transition-all z-30 flex items-center justify-center -mr-1"
            >
              <div className="w-0.5 h-7 bg-ui-theme hover:bg-[var(--text-accent)] rounded-full" />
            </div>
          </div>
        ) : (
          /* Floating Reopen Button when Left Sidebar is collapsed */
          <button
            onClick={() => setLeftCollapsed(false)}
            title="Expand Tools Sidebar"
            className="absolute top-3 left-3 z-30 flex items-center gap-1.5 px-2.5 py-1.5 retro-chrome-btn rounded-lg shadow-xl transition-all text-xs font-semibold cursor-pointer text-primary-theme"
          >
            <PanelLeftOpen className="w-4 h-4" style={{ color: 'var(--text-accent)' }} />
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
          onEyedropPick={handleEyedropPick}
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
          onDeleteSelection={handleDeleteSelection}
          onCommitFloatingSelection={handleCommitFloatingSelection}
          onFlipHorizontalSelection={handleFlipHorizontalSelection}
          onFlipVerticalSelection={handleFlipVerticalSelection}
          onClearSelection={handleClearSelection}
          zoom={zoom}
          onZoomChange={setZoom}
          animationsEnabled={animationsEnabled}
          currentThemeId={currentThemeId}
          canvasBg={canvasBg}
          onCycleCanvasBg={handleCycleCanvasBg}
        />

        {/* Right Dock: Mini Preview, Layers, Palette, References */}
        {!rightCollapsed ? (
          <div className="flex shrink-0 h-full relative group/right z-20">
            {/* Draggable Splitter on left edge of Right Panels */}
            <div
              onMouseDown={handleRightResizeMouseDown}
              onTouchStart={handleRightResizeTouchStart}
              onDoubleClick={() => setRightSidebarWidth(320)}
              title="Drag to resize Panels Sidebar (Double-click to reset 320px)"
              className="w-1.5 hover:w-2 cursor-col-resize hover:bg-[var(--text-accent)] active:bg-[var(--text-accent)] transition-all z-30 flex items-center justify-center -ml-1"
            >
              <div className="w-0.5 h-7 bg-ui-theme hover:bg-[var(--text-accent)] rounded-full" />
            </div>

            <aside 
              style={{ width: `${rightSidebarWidth}px` }}
              className="bg-surface-theme border-l border-ui-theme flex flex-col p-3 gap-3 h-full min-h-0 overflow-y-auto overscroll-contain shrink-0 z-20 shadow-2xl transition-colors select-none max-w-[calc(100vw-3rem)]"
            >
              {/* Header with Title and Collapse Button */}
              <div className="flex items-center justify-between pb-1.5 border-b border-ui-theme shrink-0">
                <div className="flex items-center gap-1.5">
                  <LayersIcon className="w-4 h-4" style={{ color: 'var(--text-accent)' }} />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary-theme">Panels & Layers</span>
                </div>
                <button
                  onClick={() => setRightCollapsed(true)}
                  title="Collapse Panels Sidebar"
                  className="retro-chrome-btn p-1 rounded text-primary-theme cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Mini Preview Box */}
              <MiniPreview
                canvasWidth={canvasWidth}
                canvasHeight={canvasHeight}
                layers={layers}
                bgStyle={canvasBg}
                onBgStyleChange={handleSetCanvasBg}
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
                onReorderLayers={handleReorderLayers}
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
                onColorPick={handleEyedropPick}
              />
            </aside>
          </div>
        ) : (
          /* Floating Reopen Button when Right Sidebar is collapsed */
          <button
            onClick={() => setRightCollapsed(false)}
            title="Expand Panels Sidebar"
            className="absolute top-3 right-3 z-30 flex items-center gap-1.5 px-2.5 py-1.5 retro-chrome-btn rounded-lg shadow-xl transition-all text-xs font-semibold cursor-pointer text-primary-theme"
          >
            <PanelRightOpen className="w-4 h-4" style={{ color: 'var(--text-accent)' }} />
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
            onColorPick={handleEyedropPick}
            onUpdateReference={handleUpdateReference}
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
        defaultFilename={projectName}
        onExportSuccess={(filename, width, height) => {
          addToast({
            title: 'PNG Exported Successfully',
            message: `${filename} (${width}×${height}px) downloaded`,
            type: 'success',
            icon: 'png',
            duration: 3500,
          });
        }}
        onCopySuccess={() => {
          addToast({
            title: 'PNG Copied to Clipboard',
            message: 'Sprite copied to system clipboard',
            type: 'success',
            icon: 'copy',
            duration: 3000,
          });
        }}
      />

      {/* Retro Dev Wiki Dimensions & Tutorial Modal */}
      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onLoadTemplate={handleSelectStarterTemplate}
      />

      {/* FigurayMaker Comprehensive Help & Documentation Manual */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        initialTab={helpInitialTab}
      />

      {/* macOS Style About FigurayMaker Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      {/* Custom Canvas Size & Dimensions Modal */}
      <CustomCanvasModal
        isOpen={isCustomCanvasOpen}
        onClose={() => setIsCustomCanvasOpen(false)}
        currentWidth={canvasWidth}
        currentHeight={canvasHeight}
        onApply={handleApplyCustomCanvasSize}
      />

      {/* Pixlr-Style Project Manager & Local Saves Modal */}
      <ProjectManagerModal
        isOpen={isProjectManagerOpen}
        onClose={handleCloseProjectManager}
        onSelectProject={handleSelectStoredProject}
        onCreateNewProject={handleCreateNewProject}
        onImportJsonFile={handleImportJsonFileFromModal}
        onExportJsonSuccess={(filename) => {
          addToast({
            title: 'Project File Exported',
            message: `${filename} downloaded successfully`,
            type: 'success',
            icon: 'json',
            duration: 3500,
          });
        }}
      />

      {/* Revamped Starter Templates Modal (Human-Crafted 1.0, 2.0, iBot, Peter, Skeletons) */}
      <StarterModal
        isOpen={isStarterModalOpen}
        onClose={() => setIsStarterModalOpen(false)}
        onSelectStarter={(starter, autoResize, scaleMode) => handleLoadRevampedStarter(starter, autoResize, scaleMode)}
        currentCanvasWidth={canvasWidth}
        currentCanvasHeight={canvasHeight}
      />

      {/* Full Asset Manager & Toolbox Modal */}
      <AssetManagerModal
        isOpen={isAssetManagerOpen}
        onClose={() => setIsAssetManagerOpen(false)}
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        onInsertAsNewLayer={handleInsertSpriteAsNewLayer}
        onStampOntoActiveLayer={handleStampSpriteOntoActiveLayer}
        onAddAsFloatingReference={handleAddSpriteAsFloatingReference}
        onSetTraceOverlay={handleSetSpriteAsTraceOverlay}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
