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
  Info,
  Move,
  Sliders,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Zap
} from 'lucide-react';
import { CANVAS_PRESETS, STARTER_TEMPLATES } from '../constants/retroDev';

interface HeaderProps {
  canvasPresetName: string;
  canvasWidth: number;
  canvasHeight: number;
  onSelectCanvasPreset: (presetName: string) => void;
  onOpenCustomCanvasModal: () => void;
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
  isMovingGuide: boolean;
  onToggleMoveGuide: () => void;
  symmetryActive: boolean;
  onToggleSymmetry: () => void;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  onOpenExportModal: () => void;
  onOpenGuideModal: () => void;
  onSaveProject: () => void;
  onLoadProject: (file: File) => void;
  leftCollapsed?: boolean;
  onToggleLeftSidebar?: () => void;
  rightCollapsed?: boolean;
  onToggleRightSidebar?: () => void;
  animationsEnabled?: boolean;
  onToggleAnimations?: () => void;
  headerHeight?: number;
}

export const Header: React.FC<HeaderProps> = ({
  canvasPresetName,
  canvasWidth,
  canvasHeight,
  onSelectCanvasPreset,
  onOpenCustomCanvasModal,
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
  isMovingGuide,
  onToggleMoveGuide,
  symmetryActive,
  onToggleSymmetry,
  zoom,
  onZoomChange,
  onOpenExportModal,
  onOpenGuideModal,
  onSaveProject,
  onLoadProject,
  leftCollapsed = false,
  onToggleLeftSidebar,
  rightCollapsed = false,
  onToggleRightSidebar,
  animationsEnabled = true,
  onToggleAnimations,
  headerHeight = 56,
}) => {
  const headerRef = useRef<HTMLElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onLoadProject(file);
    }
  };

  // Convert vertical mouse scroll into horizontal header scroll on non-touch devices
  const handleHeaderWheel = (e: React.WheelEvent) => {
    if (headerRef.current && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      headerRef.current.scrollLeft += e.deltaY;
    }
  };

  return (
    <header 
      ref={headerRef}
      onWheel={handleHeaderWheel}
      style={{ height: `${headerHeight}px` }}
      className="bg-neutral-900 border-b border-neutral-800 px-3 flex items-center justify-between gap-3 text-neutral-200 select-none z-30 shrink-0 overflow-x-auto overflow-y-hidden header-scrollbar scroll-smooth w-full"
    >
      {/* Brand & Canvas Dimensions Preset */}
      <div className="flex items-center gap-2.5 shrink-0 whitespace-nowrap">
        {onToggleLeftSidebar && (
          <button
            onClick={onToggleLeftSidebar}
            title={leftCollapsed ? "Expand Tools Sidebar" : "Collapse Tools Sidebar"}
            className={`p-1.5 rounded-lg border transition-colors shrink-0 ${
              leftCollapsed
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800 border-neutral-800/80'
            }`}
          >
            {leftCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        )}

        <div className="flex items-center gap-2 shrink-0">
          {/* App Brand Icon */}
          <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shadow-md shadow-pink-500/20 border border-neutral-700/80 bg-neutral-950 shrink-0">
            <img 
              src="FigurayMaker.png" 
              alt="FigurayMaker Icon" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="shrink-0">
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <h1 className="font-bold text-sm tracking-tight text-white whitespace-nowrap">Retro Dev</h1>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded font-semibold whitespace-nowrap">
                Sprite Maker
              </span>
            </div>
            <div className="text-[10px] text-neutral-400 font-mono flex items-center gap-1 whitespace-nowrap">
              <span>Body: 9×8 · 11×10 · 5×10</span>
            </div>
          </div>
        </div>

        <div className="h-5 w-px bg-neutral-800 mx-1 hidden sm:block shrink-0" />

        {/* Canvas Size Preset Selector & Custom Button */}
        <div className="flex items-center gap-1.5 bg-neutral-950 px-2 py-1 rounded-lg border border-neutral-800 shrink-0">
          <LayoutGrid className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <select
            value={canvasPresetName.startsWith('Custom') ? 'custom' : canvasPresetName}
            onChange={(e) => {
              if (e.target.value === 'custom') {
                onOpenCustomCanvasModal();
              } else {
                onSelectCanvasPreset(e.target.value);
              }
            }}
            className="bg-transparent text-xs font-mono text-neutral-200 outline-none cursor-pointer"
          >
            {CANVAS_PRESETS.map(preset => (
              <option key={preset.name} value={preset.name} className="bg-neutral-900 text-white">
                {preset.name}
              </option>
            ))}
            <option value="custom" className="bg-neutral-900 text-amber-300 font-bold">
              Custom Size ({canvasWidth} × {canvasHeight})...
            </option>
          </select>

          {/* Quick Custom Resize Button */}
          <button
            type="button"
            onClick={onOpenCustomCanvasModal}
            title="Open Custom Canvas Size Dialog"
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-neutral-700 transition-colors font-semibold shrink-0 cursor-pointer"
          >
            <Sliders className="w-3 h-3 text-amber-400" />
            <span>Resize</span>
          </button>
        </div>

        {/* Starter Template quick load dropdown */}
        <div className="hidden lg:flex items-center gap-1 bg-neutral-950 px-2 py-1 rounded-lg border border-neutral-800 shrink-0">
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
      <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
        {/* Undo / Redo */}
        <div className="flex items-center bg-neutral-950 rounded-lg p-0.5 border border-neutral-800 shrink-0">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="flex items-center gap-1.5 px-2 py-1 hover:bg-neutral-800 text-neutral-300 hover:text-amber-400 rounded transition-colors disabled:opacity-25 disabled:pointer-events-none text-xs font-medium cursor-pointer"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Undo</span>
          </button>
          <div className="w-px h-3.5 bg-neutral-800 my-auto" />
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
            className="flex items-center gap-1.5 px-2 py-1 hover:bg-neutral-800 text-neutral-300 hover:text-amber-400 rounded transition-colors disabled:opacity-25 disabled:pointer-events-none text-xs font-medium cursor-pointer"
          >
            <Redo2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Redo</span>
          </button>
        </div>

        <div className="h-5 w-px bg-neutral-800 mx-1 shrink-0" />

        {/* Toggles Group */}
        <div className="flex items-center gap-1 bg-neutral-950 rounded-lg p-0.5 border border-neutral-800 shrink-0">
          {/* Pixel Grid */}
          <button
            onClick={onToggleGrid}
            title={showGrid ? 'Hide Pixel Grid' : 'Show Pixel Grid'}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              showGrid ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
          </button>

          {/* Retro Dev Body Outline Guides */}
          <button
            onClick={onToggleGuides}
            title="Toggle Retro Dev 9x8, 11x10, 5x10 Body Outlines"
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors cursor-pointer ${
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
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors cursor-pointer ${
              showNumbers 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-medium' 
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Numbers</span>
          </button>

          {/* Move / Reposition Guide Toggle */}
          <button
            onClick={onToggleMoveGuide}
            title={isMovingGuide ? "Lock Guide Position (Press to finish)" : "Reposition & Drag Guide and Numbers anywhere on canvas"}
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-all cursor-pointer ${
              isMovingGuide
                ? 'bg-amber-400 text-neutral-950 font-bold shadow-md shadow-amber-400/20 animate-pulse'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Move className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px]">{isMovingGuide ? 'Dragging Guide' : 'Move Guide'}</span>
          </button>

          {/* Mirror / Symmetry */}
          <button
            onClick={onToggleSymmetry}
            title="Toggle Vertical Mirror Symmetry"
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              symmetryActive ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
          </button>

          {/* Snappy / Instant Mode Toggle */}
          {onToggleAnimations && (
            <button
              onClick={onToggleAnimations}
              title={animationsEnabled ? "Animations: ON (Click for Instant Snappy Mode)" : "Snappy Mode: ON (Animations disabled for zero delay)"}
              className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors cursor-pointer ${
                !animationsEnabled
                  ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40 font-semibold shadow-sm shadow-amber-500/10'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${!animationsEnabled ? 'fill-amber-400 text-amber-400 animate-pulse' : ''}`} />
              <span className="hidden md:inline text-[11px]">{!animationsEnabled ? 'Snappy' : 'Anim'}</span>
            </button>
          )}
        </div>

        <div className="h-5 w-px bg-neutral-800 mx-1 hidden sm:block shrink-0" />

        {/* Zoom Controls */}
        <div className="hidden sm:flex items-center gap-1 bg-neutral-950 rounded-lg p-0.5 border border-neutral-800 shrink-0">
          <button
            onClick={() => onZoomChange(Math.max(4, zoom - 2))}
            title="Zoom out"
            className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono text-neutral-300 px-1 w-11 text-center">
            {Math.round((zoom / 16) * 100)}%
          </span>
          <button
            onClick={() => onZoomChange(Math.min(64, zoom + 2))}
            title="Zoom in"
            className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onZoomChange(16)}
            title="Reset Zoom to 100%"
            className="p-1 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded text-[10px] cursor-pointer"
          >
            1x
          </button>
        </div>
      </div>

      {/* Right Actions: Guide, Project Save/Load, Export */}
      <div className="flex items-center gap-2 shrink-0 whitespace-nowrap ml-auto">
        {/* Dimensions Wiki Guide Modal */}
        <button
          onClick={onOpenGuideModal}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg text-xs font-medium transition-colors shrink-0 cursor-pointer"
          title="Open Retro Dev Dimension Wiki Guide"
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">Dimensions</span>
        </button>

        {/* Save / Load JSON Project */}
        <button
          onClick={onSaveProject}
          title="Save Sprite Project (JSON)"
          className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg transition-colors hidden sm:block shrink-0 cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          title="Load Sprite Project (JSON)"
          className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg transition-colors hidden sm:block shrink-0 cursor-pointer"
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
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-neutral-950 rounded-lg text-xs font-bold shadow-lg shadow-amber-500/20 transition-all cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export PNG</span>
        </button>

        {onToggleRightSidebar && (
          <button
            onClick={onToggleRightSidebar}
            title={rightCollapsed ? "Expand Panels Sidebar" : "Collapse Panels Sidebar"}
            className={`p-1.5 rounded-lg border transition-colors shrink-0 ${
              rightCollapsed
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800 border-neutral-800/80'
            }`}
          >
            {rightCollapsed ? <PanelRightOpen className="w-4 h-4" /> : <PanelRightClose className="w-4 h-4" />}
          </button>
        )}
      </div>
    </header>
  );
};
