/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
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

export default function App() {
  // Canvas Size Preset
  const [activePreset, setActivePreset] = useState<CanvasDimensions>(CANVAS_PRESETS[0]);
  const canvasWidth = activePreset.width;
  const canvasHeight = activePreset.height;
  const bodyOffsetX = activePreset.bodyOffsetX;
  const bodyOffsetY = activePreset.bodyOffsetY;

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

  // Save history state
  const pushHistory = useCallback((newLayers: Layer[], newActiveId = activeLayerId) => {
    setHistory(prev => {
      const sliced = prev.slice(0, historyIndex + 1);
      return [...sliced, { layers: JSON.parse(JSON.stringify(newLayers)), activeLayerId: newActiveId }].slice(-30);
    });
    setHistoryIndex(prev => Math.min(29, prev + 1));
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
  const handleUpdateLayerPixels = (layerId: string, newPixels: string[]) => {
    const updated = layers.map(l => l.id === layerId ? { ...l, pixels: newPixels } : l);
    setLayers(updated);
    pushHistory(updated, layerId);
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

    if (window.confirm(`Switch to canvas "${preset.name}"? This will adapt your layers to the new dimensions (${preset.width}×${preset.height}).`)) {
      setActivePreset(preset);
      // Remap layers to new size
      const newLayers = layers.map(l => {
        const newPixels = new Array(preset.width * preset.height).fill('');
        for (let y = 0; y < Math.min(canvasHeight, preset.height); y++) {
          for (let x = 0; x < Math.min(canvasWidth, preset.width); x++) {
            newPixels[y * preset.width + x] = l.pixels[y * canvasWidth + x];
          }
        }
        return {
          ...l,
          pixels: newPixels,
        };
      });
      setLayers(newLayers);
      pushHistory(newLayers, activeLayerId);
    }
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

    handleUpdateLayerPixels(activeLayer.id, newPixels);
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

    handleUpdateLayerPixels(activeLayer.id, newPixels);
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
          const matchedPreset = CANVAS_PRESETS.find(p => p.name === project.canvasPresetName) || {
            name: `Custom (${project.canvasWidth} × ${project.canvasHeight})`,
            width: project.canvasWidth,
            height: project.canvasHeight,
            description: 'Custom canvas loaded from project',
            bodyOffsetX: 0,
            bodyOffsetY: 0,
          };
          setActivePreset(matchedPreset);
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
        onSelectCanvasPreset={handleSelectCanvasPreset}
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
        symmetryActive={symmetryActive}
        onToggleSymmetry={() => setSymmetryActive(s => !s)}
        zoom={zoom}
        onZoomChange={setZoom}
        onOpenExportModal={() => setIsExportOpen(true)}
        onOpenGuideModal={() => setIsGuideOpen(true)}
        onSaveProject={handleSaveProject}
        onLoadProject={handleLoadProject}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Toolbar */}
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
        />

        {/* Central Drawing Canvas Area */}
        <CanvasArea
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          layers={layers}
          activeLayerId={activeLayerId}
          onUpdateLayerPixels={handleUpdateLayerPixels}
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
          references={references}
          selection={selection}
          onUpdateSelection={setSelection}
          zoom={zoom}
          onZoomChange={setZoom}
        />

        {/* Right Dock: Mini Preview, Layers, Palette, References */}
        <aside className="w-80 bg-neutral-900 border-l border-neutral-800 flex flex-col p-3 gap-3 overflow-y-auto shrink-0 z-20 shadow-2xl">
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
    </div>
  );
}
