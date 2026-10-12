/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { 
  Layer, 
  ToolType, 
  ReferenceImage, 
  SelectionState, 
  CanvasBgStyle, 
  CanvasDimensions, 
  HistoryEntry 
} from '../types/sprite';
import { CANVAS_PRESETS } from '../constants/retroDev';
import { createDefaultReferenceImage } from '../constants/defaultReference';
import { getDefaultKeybindings } from '../utils/keybindings';
import { KeybindingsMap } from '../types/keybindings';
import { StoredProject, getAllProjectsFromDB, saveProjectToDB } from '../utils/storageDB';
import { 
  RevampedStarter, 
  SpriteAtlasEntry, 
  SPRITE_ATLAS, 
  extractSpritePixels, 
  placeSpriteOnCanvas, 
  ScaleMode 
} from '../utils/spriteAtlas';

export interface SpriteContextType {
  // Canvas Dimensions
  canvasPresetName: string;
  canvasWidth: number;
  canvasHeight: number;
  bodyOffsetX: number;
  bodyOffsetY: number;
  setCanvasGeometry: (width: number, height: number, presetName?: string, anchor?: 'center' | 'top-left' | 'bottom-center', autoCenterGuide?: boolean) => void;

  // Project Info
  projectName: string;
  setProjectName: (name: string) => void;

  // Layers
  layers: Layer[];
  activeLayerId: string;
  activeLayer: Layer | undefined;
  setActiveLayerId: (id: string) => void;
  updateLayerPixels: (layerId: string, newPixels: string[], commitHistory?: boolean) => void;
  addLayer: () => void;
  deleteLayer: (id: string) => void;
  duplicateLayer: (id: string) => void;
  mergeDownLayer: (id: string) => void;
  moveLayer: (id: string, direction: 'up' | 'down') => void;
  reorderLayers: (newLayers: Layer[]) => void;
  toggleLayerVisibility: (id: string) => void;
  toggleLayerLock: (id: string) => void;
  changeLayerOpacity: (id: string, opacity: number) => void;
  renameLayer: (id: string, name: string) => void;
  flipActiveLayerH: () => void;
  flipActiveLayerV: () => void;
  centerActiveLayer: () => void;
  clearActiveLayer: () => void;

  // Tools & Colors
  currentTool: ToolType;
  setCurrentTool: (tool: ToolType) => void;
  currentColor: string;
  setCurrentColor: (color: string) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  autoSwitchPencil: boolean;
  setAutoSwitchPencil: (val: boolean) => void;
  colorHistory: string[];
  customColors: string[];
  addCustomColor: (color: string) => void;
  removeCustomColor: (color: string) => void;

  // View & Guides
  showGrid: boolean;
  setShowGrid: (val: boolean | ((prev: boolean) => boolean)) => void;
  showGuides: boolean;
  setShowGuides: (val: boolean | ((prev: boolean) => boolean)) => void;
  showNumbers: boolean;
  setShowNumbers: (val: boolean | ((prev: boolean) => boolean)) => void;
  isMovingGuide: boolean;
  setIsMovingGuide: (val: boolean | ((prev: boolean) => boolean)) => void;
  symmetryActive: boolean;
  setSymmetryActive: (val: boolean | ((prev: boolean) => boolean)) => void;
  zoom: number;
  setZoom: (z: number | ((prev: number) => number)) => void;
  canvasBg: CanvasBgStyle;
  setCanvasBg: (bg: CanvasBgStyle) => void;
  cycleCanvasBg: () => void;
  guideOffset: { x: number; y: number };
  setGuideOffset: (offset: { x: number; y: number }) => void;
  centerGuide: () => void;

  // Selection
  selection: SelectionState;
  setSelection: (sel: SelectionState) => void;
  commitFloatingSelection: () => void;
  deleteSelection: () => void;
  flipSelectionH: () => void;
  flipSelectionV: () => void;
  clearSelection: () => void;

  // History / Undo / Redo
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  commitHistory: (layerId?: string) => void;

  // References
  references: ReferenceImage[];
  activeRefId: string | null;
  setActiveRefId: (id: string | null) => void;
  addReferences: (newRefs: ReferenceImage[]) => void;
  updateReference: (id: string, updates: Partial<ReferenceImage>) => void;
  deleteReference: (id: string) => void;

  // Keybindings
  keybindings: KeybindingsMap;
  setKeybindings: (bindings: KeybindingsMap) => void;

  // Project Actions
  loadExistingProject: (project: StoredProject) => void;
  createNewProject: (name: string, presetName: string, customWidth?: number, customHeight?: number, includeDefaultRef?: boolean) => void;
  loadStarterTemplate: (starter: RevampedStarter, autoResizeCanvas: boolean, scaleMode: ScaleMode) => Promise<void>;
  insertAssetAsLayer: (sprite: SpriteAtlasEntry, extracted: { pixels: string[]; width: number; height: number }, scaleMode: ScaleMode) => void;
  stampAssetOntoActiveLayer: (sprite: SpriteAtlasEntry, pixels: string[], scaleMode: ScaleMode) => void;

  // Notification Banner
  announcement: string | null;
  showAnnouncement: (msg: string) => void;
  clearAnnouncement: () => void;
}

const SpriteContext = createContext<SpriteContextType | undefined>(undefined);

const MAX_HISTORY = 30;

export const SpriteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Preset defaults
  const initialPreset = CANVAS_PRESETS[1] || CANVAS_PRESETS[0]; // 25x32 Headroom
  const [canvasPresetName, setCanvasPresetName] = useState(initialPreset.name);
  const [canvasWidth, setCanvasWidth] = useState(initialPreset.width);
  const [canvasHeight, setCanvasHeight] = useState(initialPreset.height);
  const [bodyOffsetX, setBodyOffsetX] = useState(initialPreset.bodyOffsetX);
  const [bodyOffsetY, setBodyOffsetY] = useState(initialPreset.bodyOffsetY);

  const [projectName, setProjectName] = useState('My Sprite');

  // Initial layers
  const [layers, setLayers] = useState<Layer[]>(() => {
    const totalPixels = initialPreset.width * initialPreset.height;
    return [
      {
        id: 'layer-bg',
        name: 'Background Base',
        visible: true,
        opacity: 1,
        locked: false,
        pixels: new Array(totalPixels).fill(''),
      },
      {
        id: 'layer-body',
        name: 'Character Sprite',
        visible: true,
        opacity: 1,
        locked: false,
        pixels: new Array(totalPixels).fill(''),
      },
    ];
  });
  const [activeLayerId, setActiveLayerId] = useState<string>('layer-body');

  // Tools & Colors
  const [currentTool, setCurrentTool] = useState<ToolType>('pencil');
  const [currentColor, setCurrentColor] = useState<string>('#000000');
  const [brushSize, setBrushSize] = useState<number>(1);
  const [autoSwitchPencil, setAutoSwitchPencil] = useState<boolean>(false);
  const [colorHistory, setColorHistory] = useState<string[]>(['#000000', '#FFFFFF', '#D0C0B0', '#776655']);
  const [customColors, setCustomColors] = useState<string[]>([]);

  // Views & Guides
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showGuides, setShowGuides] = useState<boolean>(true);
  const [showNumbers, setShowNumbers] = useState<boolean>(false);
  const [isMovingGuide, setIsMovingGuide] = useState<boolean>(false);
  const [symmetryActive, setSymmetryActive] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(16);
  const [canvasBg, setCanvasBg] = useState<CanvasBgStyle>('retro');
  const [guideOffset, setGuideOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

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

  // Reference images
  const [references, setReferences] = useState<ReferenceImage[]>(() => {
    try {
      const def = createDefaultReferenceImage({ windowOpen: false });
      return [def];
    } catch {
      return [];
    }
  });
  const [activeRefId, setActiveRefId] = useState<string | null>(null);

  // Keybindings
  const [keybindings, setKeybindings] = useState<KeybindingsMap>(() => getDefaultKeybindings());

  // Announcement banner
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const announcementTimer = useRef<number | null>(null);

  const showAnnouncement = useCallback((msg: string) => {
    if (announcementTimer.current) clearTimeout(announcementTimer.current);
    setAnnouncement(msg);
    announcementTimer.current = window.setTimeout(() => {
      setAnnouncement(null);
    }, 4500);
  }, []);

  const clearAnnouncement = useCallback(() => {
    if (announcementTimer.current) clearTimeout(announcementTimer.current);
    setAnnouncement(null);
  }, []);

  // History stack
  const [history, setHistory] = useState<HistoryEntry[]>(() => [
    {
      layers: JSON.parse(JSON.stringify(layers)),
      activeLayerId: 'layer-body',
      preset: {
        width: initialPreset.width,
        height: initialPreset.height,
        name: initialPreset.name,
        description: initialPreset.description,
        bodyOffsetX: initialPreset.bodyOffsetX,
        bodyOffsetY: initialPreset.bodyOffsetY,
      },
      guideOffset: { x: 0, y: 0 },
    },
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const commitHistory = useCallback((layerId?: string) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      const entry: HistoryEntry = {
        layers: JSON.parse(JSON.stringify(layers)),
        activeLayerId: layerId || activeLayerId,
        preset: {
          width: canvasWidth,
          height: canvasHeight,
          name: canvasPresetName,
          description: '',
          bodyOffsetX,
          bodyOffsetY,
        },
        guideOffset: { ...guideOffset },
      };
      if (newHistory.length >= MAX_HISTORY) {
        newHistory.shift();
      }
      return [...newHistory, entry];
    });
    setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1));
  }, [layers, activeLayerId, canvasWidth, canvasHeight, canvasPresetName, bodyOffsetX, bodyOffsetY, guideOffset, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;
    const targetIndex = historyIndex - 1;
    const state = history[targetIndex];
    if (state) {
      setLayers(JSON.parse(JSON.stringify(state.layers)));
      setActiveLayerId(state.activeLayerId);
      setCanvasWidth(state.preset.width);
      setCanvasHeight(state.preset.height);
      setCanvasPresetName(state.preset.name);
      setBodyOffsetX(state.preset.bodyOffsetX);
      setBodyOffsetY(state.preset.bodyOffsetY);
      setGuideOffset(state.guideOffset);
      setHistoryIndex(targetIndex);
      showAnnouncement(`Undo step (${targetIndex + 1}/${history.length})`);
    }
  }, [historyIndex, history, showAnnouncement]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const targetIndex = historyIndex + 1;
    const state = history[targetIndex];
    if (state) {
      setLayers(JSON.parse(JSON.stringify(state.layers)));
      setActiveLayerId(state.activeLayerId);
      setCanvasWidth(state.preset.width);
      setCanvasHeight(state.preset.height);
      setCanvasPresetName(state.preset.name);
      setBodyOffsetX(state.preset.bodyOffsetX);
      setBodyOffsetY(state.preset.bodyOffsetY);
      setGuideOffset(state.guideOffset);
      setHistoryIndex(targetIndex);
      showAnnouncement(`Redo step (${targetIndex + 1}/${history.length})`);
    }
  }, [historyIndex, history, showAnnouncement]);

  const activeLayer = layers.find(l => l.id === activeLayerId);

  // Update layer pixels
  const updateLayerPixels = useCallback((layerId: string, newPixels: string[], shouldCommitHistory = false) => {
    setLayers(prev => prev.map(l => (l.id === layerId ? { ...l, pixels: newPixels } : l)));
    if (shouldCommitHistory) {
      commitHistory(layerId);
    }
  }, [commitHistory]);

  // Color history update
  const handleSetCurrentColor = useCallback((color: string) => {
    setCurrentColor(color);
    setColorHistory(prev => {
      const filtered = prev.filter(c => c.toLowerCase() !== color.toLowerCase());
      return [color, ...filtered].slice(0, 24);
    });
  }, []);

  // Add custom color
  const addCustomColor = useCallback((color: string) => {
    setCustomColors(prev => {
      if (prev.includes(color)) return prev;
      return [...prev, color];
    });
  }, []);

  const removeCustomColor = useCallback((color: string) => {
    setCustomColors(prev => prev.filter(c => c !== color));
  }, []);

  // Canvas Geometry
  const setCanvasGeometry = useCallback((
    newW: number, 
    newH: number, 
    presetName?: string, 
    anchor: 'center' | 'top-left' | 'bottom-center' = 'center',
    autoCenterGuide = true
  ) => {
    const clampedW = Math.max(8, Math.min(256, Math.round(newW)));
    const clampedH = Math.max(8, Math.min(256, Math.round(newH)));
    const oldW = canvasWidth;
    const oldH = canvasHeight;

    let offsetX = 0;
    let offsetY = 0;

    if (anchor === 'center') {
      offsetX = Math.floor((clampedW - oldW) / 2);
      offsetY = Math.floor((clampedH - oldH) / 2);
    } else if (anchor === 'bottom-center') {
      offsetX = Math.floor((clampedW - oldW) / 2);
      offsetY = clampedH - oldH;
    }

    // Remap layers
    setLayers(prevLayers => {
      return prevLayers.map(layer => {
        const newPixels = new Array(clampedW * clampedH).fill('');
        for (let y = 0; y < oldH; y++) {
          for (let x = 0; x < oldW; x++) {
            const oldIdx = y * oldW + x;
            const color = layer.pixels[oldIdx];
            if (color && color !== '') {
              const nx = x + offsetX;
              const ny = y + offsetY;
              if (nx >= 0 && nx < clampedW && ny >= 0 && ny < clampedH) {
                newPixels[ny * clampedW + nx] = color;
              }
            }
          }
        }
        return {
          ...layer,
          pixels: newPixels,
          width: clampedW,
          height: clampedH,
        };
      });
    });

    setCanvasWidth(clampedW);
    setCanvasHeight(clampedH);
    setCanvasPresetName(presetName || `${clampedW} × ${clampedH}`);

    if (autoCenterGuide) {
      setBodyOffsetX(Math.max(0, Math.floor((clampedW - 21) / 2)));
      setBodyOffsetY(Math.max(0, Math.floor((clampedH - 28) / 2)));
      setGuideOffset({ x: 0, y: 0 });
    } else {
      setBodyOffsetX(prev => Math.max(0, prev + offsetX));
      setBodyOffsetY(prev => Math.max(0, prev + offsetY));
    }

    commitHistory();
    showAnnouncement(`Canvas resized to ${clampedW} × ${clampedH} pixels.`);
  }, [canvasWidth, canvasHeight, commitHistory, showAnnouncement]);

  // Layer manipulation
  const addLayer = useCallback(() => {
    const id = `layer-${Date.now()}`;
    const name = `Layer ${layers.length + 1}`;
    const newLayer: Layer = {
      id,
      name,
      visible: true,
      opacity: 1,
      locked: false,
      pixels: new Array(canvasWidth * canvasHeight).fill(''),
    };
    setLayers(prev => [...prev, newLayer]);
    setActiveLayerId(id);
    commitHistory(id);
    showAnnouncement(`Created new "${name}".`);
  }, [layers.length, canvasWidth, canvasHeight, commitHistory, showAnnouncement]);

  const deleteLayer = useCallback((id: string) => {
    if (layers.length <= 1) {
      showAnnouncement('Cannot delete the only remaining layer.');
      return;
    }
    setLayers(prev => {
      const next = prev.filter(l => l.id !== id);
      if (activeLayerId === id) {
        setActiveLayerId(next[next.length - 1].id);
      }
      return next;
    });
    commitHistory();
    showAnnouncement('Layer deleted.');
  }, [layers.length, activeLayerId, commitHistory, showAnnouncement]);

  const duplicateLayer = useCallback((id: string) => {
    const target = layers.find(l => l.id === id);
    if (!target) return;
    const newId = `layer-${Date.now()}`;
    const duplicated: Layer = {
      ...target,
      id: newId,
      name: `${target.name} (Copy)`,
      pixels: [...target.pixels],
    };
    const idx = layers.findIndex(l => l.id === id);
    const updated = [...layers];
    updated.splice(idx + 1, 0, duplicated);
    setLayers(updated);
    setActiveLayerId(newId);
    commitHistory(newId);
    showAnnouncement(`Duplicated "${target.name}".`);
  }, [layers, commitHistory, showAnnouncement]);

  const mergeDownLayer = useCallback((id: string) => {
    const idx = layers.findIndex(l => l.id === id);
    if (idx <= 0) {
      showAnnouncement('Cannot merge down the bottom-most layer.');
      return;
    }
    const upper = layers[idx];
    const lower = layers[idx - 1];
    const mergedPixels = [...lower.pixels];
    for (let i = 0; i < upper.pixels.length; i++) {
      const color = upper.pixels[i];
      if (color && color !== '') {
        mergedPixels[i] = color;
      }
    }
    const updatedLower: Layer = {
      ...lower,
      pixels: mergedPixels,
    };
    const newLayers = layers.filter(l => l.id !== id);
    newLayers[idx - 1] = updatedLower;
    setLayers(newLayers);
    setActiveLayerId(updatedLower.id);
    commitHistory(updatedLower.id);
    showAnnouncement(`Merged "${upper.name}" down into "${lower.name}".`);
  }, [layers, commitHistory, showAnnouncement]);

  const moveLayer = useCallback((id: string, direction: 'up' | 'down') => {
    const idx = layers.findIndex(l => l.id === id);
    if (idx === -1) return;
    if (direction === 'up' && idx === layers.length - 1) return;
    if (direction === 'down' && idx === 0) return;
    const targetIdx = direction === 'up' ? idx + 1 : idx - 1;
    const newLayers = [...layers];
    const [removed] = newLayers.splice(idx, 1);
    newLayers.splice(targetIdx, 0, removed);
    setLayers(newLayers);
    commitHistory(id);
  }, [layers, commitHistory]);

  const reorderLayers = useCallback((newLayers: Layer[]) => {
    setLayers(newLayers);
    commitHistory();
  }, [commitHistory]);

  const toggleLayerVisibility = useCallback((id: string) => {
    setLayers(prev => prev.map(l => (l.id === id ? { ...l, visible: !l.visible } : l)));
  }, []);

  const toggleLayerLock = useCallback((id: string) => {
    setLayers(prev => prev.map(l => (l.id === id ? { ...l, locked: !l.locked } : l)));
  }, []);

  const changeLayerOpacity = useCallback((id: string, opacity: number) => {
    setLayers(prev => prev.map(l => (l.id === id ? { ...l, opacity: Math.max(0, Math.min(1, opacity)) } : l)));
  }, []);

  const renameLayer = useCallback((id: string, name: string) => {
    setLayers(prev => prev.map(l => (l.id === id ? { ...l, name } : l)));
  }, []);

  // Active layer transforms
  const flipActiveLayerH = useCallback(() => {
    if (!activeLayer || activeLayer.locked) return;
    const newPixels = new Array(canvasWidth * canvasHeight).fill('');
    for (let y = 0; y < canvasHeight; y++) {
      for (let x = 0; x < canvasWidth; x++) {
        const srcIdx = y * canvasWidth + x;
        const dstIdx = y * canvasWidth + (canvasWidth - 1 - x);
        newPixels[dstIdx] = activeLayer.pixels[srcIdx] || '';
      }
    }
    updateLayerPixels(activeLayer.id, newPixels, true);
    showAnnouncement(`Flipped layer "${activeLayer.name}" horizontally.`);
  }, [activeLayer, canvasWidth, canvasHeight, updateLayerPixels, showAnnouncement]);

  const flipActiveLayerV = useCallback(() => {
    if (!activeLayer || activeLayer.locked) return;
    const newPixels = new Array(canvasWidth * canvasHeight).fill('');
    for (let y = 0; y < canvasHeight; y++) {
      for (let x = 0; x < canvasWidth; x++) {
        const srcIdx = y * canvasWidth + x;
        const dstIdx = (canvasHeight - 1 - y) * canvasWidth + x;
        newPixels[dstIdx] = activeLayer.pixels[srcIdx] || '';
      }
    }
    updateLayerPixels(activeLayer.id, newPixels, true);
    showAnnouncement(`Flipped layer "${activeLayer.name}" vertically.`);
  }, [activeLayer, canvasWidth, canvasHeight, updateLayerPixels, showAnnouncement]);

  const centerActiveLayer = useCallback(() => {
    if (!activeLayer || activeLayer.locked) return;
    let minX = canvasWidth, maxX = -1, minY = canvasHeight, maxY = -1;
    for (let y = 0; y < canvasHeight; y++) {
      for (let x = 0; x < canvasWidth; x++) {
        const color = activeLayer.pixels[y * canvasWidth + x];
        if (color && color !== '') {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX === -1) return; // empty layer
    const bboxW = maxX - minX + 1;
    const bboxH = maxY - minY + 1;
    const targetX = Math.floor((canvasWidth - bboxW) / 2);
    const targetY = Math.floor((canvasHeight - bboxH) / 2);
    const dx = targetX - minX;
    const dy = targetY - minY;
    if (dx === 0 && dy === 0) return;

    const newPixels = new Array(canvasWidth * canvasHeight).fill('');
    for (let y = 0; y < canvasHeight; y++) {
      for (let x = 0; x < canvasWidth; x++) {
        const color = activeLayer.pixels[y * canvasWidth + x];
        if (color && color !== '') {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < canvasWidth && ny >= 0 && ny < canvasHeight) {
            newPixels[ny * canvasWidth + nx] = color;
          }
        }
      }
    }
    updateLayerPixels(activeLayer.id, newPixels, true);
    showAnnouncement(`Centered contents of layer "${activeLayer.name}".`);
  }, [activeLayer, canvasWidth, canvasHeight, updateLayerPixels, showAnnouncement]);

  const clearActiveLayer = useCallback(() => {
    if (!activeLayer || activeLayer.locked) return;
    const emptyPixels = new Array(canvasWidth * canvasHeight).fill('');
    updateLayerPixels(activeLayer.id, emptyPixels, true);
    showAnnouncement(`Cleared layer "${activeLayer.name}".`);
  }, [activeLayer, canvasWidth, canvasHeight, updateLayerPixels, showAnnouncement]);

  // Selection actions
  const commitFloatingSelection = useCallback(() => {
    if (!selection.active || !selection.floating || !activeLayer || activeLayer.locked) return;
    const newPixels = [...activeLayer.pixels];
    const fw = selection.floatingWidth;
    const fh = selection.floatingHeight;
    for (let fy = 0; fy < fh; fy++) {
      for (let fx = 0; fx < fw; fx++) {
        const fIdx = fy * fw + fx;
        if (selection.floatingMask && !selection.floatingMask[fIdx]) continue;
        const color = selection.floatingPixels[fIdx];
        if (color && color !== '') {
          const cx = selection.floatingX + fx;
          const cy = selection.floatingY + fy;
          if (cx >= 0 && cx < canvasWidth && cy >= 0 && cy < canvasHeight) {
            newPixels[cy * canvasWidth + cx] = color;
          }
        }
      }
    }
    updateLayerPixels(activeLayer.id, newPixels, true);
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
    showAnnouncement('Committed moved selection pixels.');
  }, [selection, activeLayer, canvasWidth, canvasHeight, updateLayerPixels, showAnnouncement]);

  const deleteSelection = useCallback(() => {
    if (!selection.active || !activeLayer || activeLayer.locked) return;
    if (selection.floating) {
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
      showAnnouncement('Deleted floating selection.');
      return;
    }
    const newPixels = [...activeLayer.pixels];
    if (selection.selectedPixelKeys && selection.selectedPixelKeys.length > 0) {
      for (const key of selection.selectedPixelKeys) {
        const [x, y] = key.split(',').map(Number);
        if (x >= 0 && x < canvasWidth && y >= 0 && y < canvasHeight) {
          newPixels[y * canvasWidth + x] = '';
        }
      }
    } else {
      const minX = Math.max(0, Math.min(selection.startX, selection.endX));
      const maxX = Math.min(canvasWidth - 1, Math.max(selection.startX, selection.endX));
      const minY = Math.max(0, Math.min(selection.startY, selection.endY));
      const maxY = Math.min(canvasHeight - 1, Math.max(selection.startY, selection.endY));
      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          newPixels[y * canvasWidth + x] = '';
        }
      }
    }
    updateLayerPixels(activeLayer.id, newPixels, true);
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
    showAnnouncement('Erased pixels in selection.');
  }, [selection, activeLayer, canvasWidth, canvasHeight, updateLayerPixels, showAnnouncement]);

  const flipSelectionH = useCallback(() => {
    if (!selection.active || !selection.floating) return;
    const fw = selection.floatingWidth;
    const fh = selection.floatingHeight;
    const flippedPix = new Array(fw * fh).fill('');
    const flippedMask = new Array(fw * fh).fill(false);
    for (let y = 0; y < fh; y++) {
      for (let x = 0; x < fw; x++) {
        const src = y * fw + x;
        const dst = y * fw + (fw - 1 - x);
        flippedPix[dst] = selection.floatingPixels[src] || '';
        if (selection.floatingMask) {
          flippedMask[dst] = selection.floatingMask[src];
        }
      }
    }
    setSelection(prev => ({
      ...prev,
      floatingPixels: flippedPix,
      floatingMask: selection.floatingMask ? flippedMask : undefined,
    }));
  }, [selection]);

  const flipSelectionV = useCallback(() => {
    if (!selection.active || !selection.floating) return;
    const fw = selection.floatingWidth;
    const fh = selection.floatingHeight;
    const flippedPix = new Array(fw * fh).fill('');
    const flippedMask = new Array(fw * fh).fill(false);
    for (let y = 0; y < fh; y++) {
      for (let x = 0; x < fw; x++) {
        const src = y * fw + x;
        const dst = (fh - 1 - y) * fw + x;
        flippedPix[dst] = selection.floatingPixels[src] || '';
        if (selection.floatingMask) {
          flippedMask[dst] = selection.floatingMask[src];
        }
      }
    }
    setSelection(prev => ({
      ...prev,
      floatingPixels: flippedPix,
      floatingMask: selection.floatingMask ? flippedMask : undefined,
    }));
  }, [selection]);

  const clearSelection = useCallback(() => {
    if (selection.floating) {
      commitFloatingSelection();
    } else {
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
    }
  }, [selection.floating, commitFloatingSelection]);

  // Center guide
  const centerGuide = useCallback(() => {
    setGuideOffset({ x: 0, y: 0 });
    showAnnouncement('Anatomical body guide re-centered.');
  }, [showAnnouncement]);

  // Canvas background cycling
  const cycleCanvasBg = useCallback(() => {
    const list: CanvasBgStyle[] = ['retro', 'dark-checker', 'light-checker', 'dark'];
    const curIdx = list.indexOf(canvasBg);
    const nextBg = list[(curIdx + 1) % list.length];
    setCanvasBg(nextBg);
    showAnnouncement(`Canvas background switched to: ${nextBg}`);
  }, [canvasBg, showAnnouncement]);

  // Reference management
  const addReferences = useCallback((newRefs: ReferenceImage[]) => {
    setReferences(prev => [...prev, ...newRefs]);
    showAnnouncement(`Imported ${newRefs.length} reference image(s).`);
  }, [showAnnouncement]);

  const updateReference = useCallback((id: string, updates: Partial<ReferenceImage>) => {
    setReferences(prev => prev.map(r => (r.id === id ? { ...r, ...updates } : r)));
  }, []);

  const deleteReference = useCallback((id: string) => {
    setReferences(prev => prev.filter(r => r.id !== id));
    showAnnouncement('Reference image removed.');
  }, [showAnnouncement]);

  // Load project from IndexedDB
  const loadExistingProject = useCallback((project: StoredProject) => {
    setProjectName(project.name);
    setCanvasWidth(project.canvasWidth);
    setCanvasHeight(project.canvasHeight);
    setCanvasPresetName(project.canvasPresetName || `${project.canvasWidth} × ${project.canvasHeight}`);
    setLayers(JSON.parse(JSON.stringify(project.layers)));
    setActiveLayerId(project.activeLayerId || project.layers[0]?.id || 'layer-body');
    if (project.bodyOffsetX !== undefined) setBodyOffsetX(project.bodyOffsetX);
    if (project.bodyOffsetY !== undefined) setBodyOffsetY(project.bodyOffsetY);
    if (project.references) setReferences(project.references);
    if (project.selectedColor) setCurrentColor(project.selectedColor);
    setGuideOffset({ x: 0, y: 0 });
    setHistoryIndex(0);
    setHistory([
      {
        layers: JSON.parse(JSON.stringify(project.layers)),
        activeLayerId: project.activeLayerId || project.layers[0]?.id || 'layer-body',
        preset: {
          width: project.canvasWidth,
          height: project.canvasHeight,
          name: project.canvasPresetName || `${project.canvasWidth} × ${project.canvasHeight}`,
          description: '',
          bodyOffsetX: project.bodyOffsetX ?? 0,
          bodyOffsetY: project.bodyOffsetY ?? 0,
        },
        guideOffset: { x: 0, y: 0 },
      },
    ]);
    showAnnouncement(`Loaded project: "${project.name}".`);
  }, [showAnnouncement]);

  // Create new project
  const createNewProject = useCallback((
    name: string,
    presetName: string,
    customW?: number,
    customH?: number,
    includeDefaultRef = true
  ) => {
    const foundPreset = CANVAS_PRESETS.find(p => p.name === presetName);
    const w = foundPreset ? foundPreset.width : customW || 25;
    const h = foundPreset ? foundPreset.height : customH || 32;
    const bx = foundPreset ? foundPreset.bodyOffsetX : Math.max(0, Math.floor((w - 21) / 2));
    const by = foundPreset ? foundPreset.bodyOffsetY : Math.max(0, Math.floor((h - 28) / 2));

    const totalPixels = w * h;
    const initialLayers: Layer[] = [
      {
        id: 'layer-bg',
        name: 'Background Base',
        visible: true,
        opacity: 1,
        locked: false,
        pixels: new Array(totalPixels).fill(''),
      },
      {
        id: 'layer-body',
        name: 'Character Sprite',
        visible: true,
        opacity: 1,
        locked: false,
        pixels: new Array(totalPixels).fill(''),
      },
    ];

    setProjectName(name || 'Untitled Sprite');
    setCanvasWidth(w);
    setCanvasHeight(h);
    setCanvasPresetName(presetName);
    setBodyOffsetX(bx);
    setBodyOffsetY(by);
    setGuideOffset({ x: 0, y: 0 });
    setLayers(initialLayers);
    setActiveLayerId('layer-body');

    if (includeDefaultRef) {
      setReferences([createDefaultReferenceImage({ windowOpen: false })]);
    } else {
      setReferences([]);
    }

    setHistoryIndex(0);
    setHistory([
      {
        layers: JSON.parse(JSON.stringify(initialLayers)),
        activeLayerId: 'layer-body',
        preset: { width: w, height: h, name: presetName, description: '', bodyOffsetX: bx, bodyOffsetY: by },
        guideOffset: { x: 0, y: 0 },
      },
    ]);
    showAnnouncement(`Created new project: "${name}".`);
  }, [showAnnouncement]);

  // Load starter template
  const loadStarterTemplate = useCallback(async (
    starter: RevampedStarter,
    autoResize: boolean,
    scaleMode: ScaleMode
  ) => {
    const targetW = autoResize 
      ? (scaleMode === '1x' ? starter.recommendedWidth1x : starter.recommendedWidth2x)
      : canvasWidth;
    const targetH = autoResize 
      ? (scaleMode === '1x' ? starter.recommendedHeight1x : starter.recommendedHeight2x)
      : canvasHeight;

    const starterSprite = SPRITE_ATLAS.find(s => s.index === starter.spriteIndex);
    let placedPixels = new Array(targetW * targetH).fill('');
    if (starterSprite) {
      const extracted = await extractSpritePixels(starterSprite, scaleMode);
      placedPixels = placeSpriteOnCanvas(
        extracted.pixels,
        extracted.width,
        extracted.height,
        targetW,
        targetH
      );
    }

    const newLayers: Layer[] = [
      {
        id: `layer-${Date.now()}-starter`,
        name: starter.name,
        visible: true,
        opacity: 1,
        locked: false,
        pixels: placedPixels,
      },
    ];

    if (autoResize) {
      setCanvasWidth(targetW);
      setCanvasHeight(targetH);
      setCanvasPresetName(`${starter.name} (${targetW} × ${targetH})`);
      setBodyOffsetX(Math.max(0, Math.floor((targetW - 21) / 2)));
      setBodyOffsetY(Math.max(0, Math.floor((targetH - 28) / 2)));
    }

    setLayers(newLayers);
    setActiveLayerId(newLayers[0].id);
    commitHistory(newLayers[0].id);
    showAnnouncement(`Installed starter template: "${starter.name}".`);
  }, [canvasWidth, canvasHeight, commitHistory, showAnnouncement]);

  // Insert asset as new layer
  const insertAssetAsLayer = useCallback((
    sprite: SpriteAtlasEntry,
    extracted: { pixels: string[]; width: number; height: number },
    scaleMode: ScaleMode
  ) => {
    const placedPixels = placeSpriteOnCanvas(
      extracted.pixels,
      extracted.width,
      extracted.height,
      canvasWidth,
      canvasHeight
    );

    const newLayerId = `layer-${Date.now()}-${sprite.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const newLayer: Layer = {
      id: newLayerId,
      name: `${sprite.name} (${scaleMode})`,
      visible: true,
      opacity: 1,
      locked: false,
      pixels: placedPixels,
    };

    setLayers(prev => [...prev, newLayer]);
    setActiveLayerId(newLayerId);
    commitHistory(newLayerId);
    showAnnouncement(`Added asset "${sprite.name}" as new layer.`);
  }, [canvasWidth, canvasHeight, commitHistory, showAnnouncement]);

  // Stamp asset onto active layer
  const stampAssetOntoActiveLayer = useCallback((
    sprite: SpriteAtlasEntry,
    stampedPixels: string[],
    scaleMode: ScaleMode
  ) => {
    if (!activeLayer || activeLayer.locked) {
      showAnnouncement('Cannot stamp asset: active layer is locked or missing.');
      return;
    }
    const merged = [...activeLayer.pixels];
    for (let i = 0; i < stampedPixels.length; i++) {
      const color = stampedPixels[i];
      if (color && color !== '') {
        merged[i] = color;
      }
    }
    updateLayerPixels(activeLayer.id, merged, true);
    showAnnouncement(`Stamped asset "${sprite.name}" onto "${activeLayer.name}".`);
  }, [activeLayer, updateLayerPixels, showAnnouncement]);

  const value: SpriteContextType = {
    canvasPresetName,
    canvasWidth,
    canvasHeight,
    bodyOffsetX,
    bodyOffsetY,
    setCanvasGeometry,
    projectName,
    setProjectName,
    layers,
    activeLayerId,
    activeLayer,
    setActiveLayerId,
    updateLayerPixels,
    addLayer,
    deleteLayer,
    duplicateLayer,
    mergeDownLayer,
    moveLayer,
    reorderLayers,
    toggleLayerVisibility,
    toggleLayerLock,
    changeLayerOpacity,
    renameLayer,
    flipActiveLayerH,
    flipActiveLayerV,
    centerActiveLayer,
    clearActiveLayer,
    currentTool,
    setCurrentTool,
    currentColor,
    setCurrentColor: handleSetCurrentColor,
    brushSize,
    setBrushSize,
    autoSwitchPencil,
    setAutoSwitchPencil,
    colorHistory,
    customColors,
    addCustomColor,
    removeCustomColor,
    showGrid,
    setShowGrid,
    showGuides,
    setShowGuides,
    showNumbers,
    setShowNumbers,
    isMovingGuide,
    setIsMovingGuide,
    symmetryActive,
    setSymmetryActive,
    zoom,
    setZoom,
    canvasBg,
    setCanvasBg,
    cycleCanvasBg,
    guideOffset,
    setGuideOffset,
    centerGuide,
    selection,
    setSelection,
    commitFloatingSelection,
    deleteSelection,
    flipSelectionH,
    flipSelectionV,
    clearSelection,
    canUndo,
    canRedo,
    undo,
    redo,
    commitHistory,
    references,
    activeRefId,
    setActiveRefId,
    addReferences,
    updateReference,
    deleteReference,
    keybindings,
    setKeybindings,
    loadExistingProject,
    createNewProject,
    loadStarterTemplate,
    insertAssetAsLayer,
    stampAssetOntoActiveLayer,
    announcement,
    showAnnouncement,
    clearAnnouncement,
  };

  return <SpriteContext.Provider value={value}>{children}</SpriteContext.Provider>;
};

export const useSpriteContext = (): SpriteContextType => {
  const context = useContext(SpriteContext);
  if (!context) {
    throw new Error('useSpriteContext must be used within a SpriteProvider');
  }
  return context;
};
