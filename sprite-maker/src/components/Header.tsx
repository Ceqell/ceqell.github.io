import React, { useRef } from 'react';
import { 
  Download, 
  Undo2, 
  Redo2, 
  Grid, 
  Layers, 
  HelpCircle, 
  Save, 
  FolderOpen, 
  ZoomIn, 
  ZoomOut, 
  Maximize2,
  Sparkles,
  LayoutGrid,
  Hash,
  SplitSquareVertical,
  ChevronDown,
  Info
} from 'lucide-react';
import { CANVAS_PRESETS, STARTER_TEMPLATES } from '../constants/retroDev';

interface HeaderProps {
  canvasPresetName: string;
  onSelectCanvasPreset: (presetName: string) => void;
  onSelectStarterTemplate: (templateId: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  showGuides: boolean;
  onToggleGuides: () => void;
  showNumbers: boolean;
  onToggleNumbers: () => void;
  symmetryActive: boolean;
  onToggleSymmetry: () => void;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  onOpenExportModal: () => void;
  onOpenGuideModal: () => void;
  onSaveProject: () => void;
  onLoadProject: (file: File) => void;
}

export const Header: React.FC<HeaderProps> = ({
  canvasPresetName,
  onSelectCanvasPreset,
  onSelectStarterTemplate,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  showGrid,
  onToggleGrid,
  showGuides,
  onToggleGuides,
  showNumbers,
  onToggleNumbers,
  symmetryActive,
  onToggleSymmetry,
  zoom,
  onZoomChange,
  onOpenExportModal,
  onOpenGuideModal,
  onSaveProject,
  onLoadProject,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onLoadProject(file);
    }
  };

  return (
    <header className="h-14 bg-neutral-900 border-b border-neutral-800 px-4 flex items-center justify-between text-neutral-200 select-none z-30 shrink-0">
      {/* Brand & Canvas Dimensions Preset */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {/* Retro Yellow Smiley Avatar icon */}
          <div className="w-8 h-8 rounded-lg bg-amber-400 text-neutral-950 flex items-center justify-center font-bold shadow-md shadow-amber-400/20 font-mono text-base border border-amber-300">
            :)
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-sm tracking-tight text-white">Retro Dev</h1>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded font-semibold">
                Sprite Maker
              </span>
            </div>
            <div className="text-[10px] text-neutral-400 font-mono flex items-center gap-1">
              <span>Body: 9×8 · 11×10 · 5×10</span>
            </div>
          </div>
        </div>

        <div className="h-5 w-px bg-neutral-800 mx-1 hidden sm:block" />

        {/* Canvas Size Preset Selector */}
        <div className="flex items-center gap-1 bg-neutral-950 px-2 py-1 rounded-lg border border-neutral-800">
          <LayoutGrid className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <select
            value={canvasPresetName}
            onChange={(e) => onSelectCanvasPreset(e.target.value)}
            className="bg-transparent text-xs font-mono text-neutral-200 outline-none cursor-pointer"
          >
            {CANVAS_PRESETS.map(preset => (
              <option key={preset.name} value={preset.name} className="bg-neutral-900 text-white">
                {preset.name}
              </option>
            ))}
          </select>
        </div>

        {/* Starter Template quick load dropdown */}
        <div className="hidden lg:flex items-center gap-1 bg-neutral-950 px-2 py-1 rounded-lg border border-neutral-800">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <select
            onChange={(e) => {
              if (e.target.value) {
                onSelectStarterTemplate(e.target.value);
                e.target.value = '';
              }
            }}
            defaultValue=""
            className="bg-transparent text-xs text-neutral-300 outline-none cursor-pointer"
          >
            <option value="" disabled className="bg-neutral-900 text-neutral-400">Load Starter...</option>
            {STARTER_TEMPLATES.map(t => (
              <option key={t.id} value={t.id} className="bg-neutral-900 text-white">
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Middle Controls: Undo/Redo & Toggles */}
      <div className="flex items-center gap-1">
        {/* Undo / Redo */}
        <div className="flex items-center bg-neutral-950 rounded-lg p-0.5 border border-neutral-800">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-5 w-px bg-neutral-800 mx-1" />

        {/* Toggles Group */}
        <div className="flex items-center gap-1 bg-neutral-950 rounded-lg p-0.5 border border-neutral-800">
          {/* Pixel Grid */}
          <button
            onClick={onToggleGrid}
            title={showGrid ? 'Hide Pixel Grid' : 'Show Pixel Grid'}
            className={`p-1.5 rounded transition-colors ${
              showGrid ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
          </button>

          {/* Retro Dev Body Outline Guides */}
          <button
            onClick={onToggleGuides}
            title="Toggle Retro Dev 9x8, 11x10, 5x10 Body Outlines"
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
              showGuides 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium' 
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Guides</span>
          </button>

          {/* Exact Wiki Numbers Overlay (1-8, 11-20, 1-10) */}
          <button
            onClick={onToggleNumbers}
            title="Toggle Dimension Numbers (Matching 1000.png wiki diagram)"
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
              showNumbers 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-medium' 
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Numbers</span>
          </button>

          {/* Mirror / Symmetry */}
          <button
            onClick={onToggleSymmetry}
            title="Toggle Vertical Mirror Symmetry"
            className={`p-1.5 rounded transition-colors ${
              symmetryActive ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-5 w-px bg-neutral-800 mx-1 hidden sm:block" />

        {/* Zoom Controls */}
        <div className="hidden sm:flex items-center gap-1 bg-neutral-950 rounded-lg p-0.5 border border-neutral-800">
          <button
            onClick={() => onZoomChange(Math.max(4, zoom - 2))}
            title="Zoom out"
            className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono text-neutral-300 px-1 w-11 text-center">
            {Math.round((zoom / 16) * 100)}%
          </span>
          <button
            onClick={() => onZoomChange(Math.min(64, zoom + 2))}
            title="Zoom in"
            className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onZoomChange(16)}
            title="Reset Zoom to 100%"
            className="p-1 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded text-[10px]"
          >
            1x
          </button>
        </div>
      </div>

      {/* Right Actions: Guide, Project Save/Load, Export */}
      <div className="flex items-center gap-2">
        {/* Dimensions & Wiki Guide Modal button */}
        <button
          onClick={onOpenGuideModal}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg text-xs font-medium transition-colors"
          title="Open Retro Dev Dimension Wiki Guide"
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">Dimensions</span>
        </button>

        {/* Save / Load JSON Project */}
        <button
          onClick={onSaveProject}
          title="Save Sprite Project (JSON)"
          className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg transition-colors hidden sm:block"
        >
          <Save className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          title="Load Sprite Project (JSON)"
          className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg transition-colors hidden sm:block"
        >
          <FolderOpen className="w-3.5 h-3.5" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          className="hidden"
        />

        {/* Primary Export PNG Button */}
        <button
          onClick={onOpenExportModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-neutral-950 rounded-lg text-xs font-bold shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export PNG</span>
        </button>
      </div>
    </header>
  );
};
