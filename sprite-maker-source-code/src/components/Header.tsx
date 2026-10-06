import React, { useRef } from 'react';
import { 
  Download, 
  Undo2, 
  Redo2, 
  Grid, 
  Layers, 
  HelpCircle, 
  BookOpen,
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
  Zap,
  Palette
} from 'lucide-react';
import { CANVAS_PRESETS, STARTER_TEMPLATES } from '../constants/retroDev';
import { AVAILABLE_THEMES } from '../constants/themes';

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
  onOpenHelpModal?: () => void;
  onSaveProject: () => void;
  onLoadProject: (file: File) => void;
  leftCollapsed?: boolean;
  onToggleLeftSidebar?: () => void;
  rightCollapsed?: boolean;
  onToggleRightSidebar?: () => void;
  animationsEnabled?: boolean;
  onToggleAnimations?: () => void;
  headerHeight?: number;
  currentThemeId?: string;
  onSelectTheme?: (themeId: string) => void;
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
  onOpenHelpModal,
  onSaveProject,
  onLoadProject,
  leftCollapsed = false,
  onToggleLeftSidebar,
  rightCollapsed = false,
  onToggleRightSidebar,
  animationsEnabled = true,
  onToggleAnimations,
  headerHeight,
  currentThemeId,
  onSelectTheme,
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
      style={{ minHeight: headerHeight ? `${headerHeight}px` : undefined }}
      className="bg-surface-theme border-b border-ui-theme px-3 py-2 flex flex-wrap items-center justify-between gap-y-2 gap-x-3 text-primary-theme select-none z-30 shrink-0 w-full shadow-sm transition-colors"
    >
      {/* Brand & Canvas Dimensions Preset */}
      <div className="flex items-center flex-wrap gap-2.5">
        {onToggleLeftSidebar && (
          <button
            onClick={onToggleLeftSidebar}
            title={leftCollapsed ? "Expand Tools Sidebar" : "Collapse Tools Sidebar"}
            className={`retro-chrome-btn p-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
              leftCollapsed ? 'active' : ''
            }`}
          >
            {leftCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" style={{ color: 'var(--text-accent)' }} />
            ) : (
              <PanelLeftClose className="w-4 h-4 text-secondary-theme" />
            )}
          </button>
        )}

        <div className="flex items-center gap-2 shrink-0">
          {/* App Brand Banner */}
          <img 
            src="FigurayMakerBanner4.png" 
            alt="FigurayMaker" 
            className="h-8 md:h-9 object-contain select-none shrink-0" 
            title="FigurayMaker: Make your own custom character sprite!"
          />
        </div>

        <div className="retro-recessed-divider h-6 mx-1 hidden sm:block shrink-0" />

        {/* Canvas Size Preset Selector & Custom Button */}
        <div className="flex items-center gap-1.5 retro-inset-well px-2 py-1 rounded-lg shrink-0">
          <LayoutGrid className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--text-accent)' }} />
          <select
            value={canvasPresetName.startsWith('Custom') ? 'custom' : canvasPresetName}
            onChange={(e) => {
              if (e.target.value === 'custom') {
                onOpenCustomCanvasModal();
              } else {
                onSelectCanvasPreset(e.target.value);
              }
            }}
            className="bg-transparent text-xs font-mono text-primary-theme outline-none cursor-pointer"
          >
            {CANVAS_PRESETS.map(preset => (
              <option key={preset.name} value={preset.name} className="bg-surface-theme text-primary-theme">
                {preset.name}
              </option>
            ))}
            <option value="custom" className="bg-surface-theme font-bold" style={{ color: 'var(--text-accent)' }}>
              Custom Size ({canvasWidth} × {canvasHeight})...
            </option>
          </select>

          {/* Quick Custom Resize Button */}
          <button
            type="button"
            onClick={onOpenCustomCanvasModal}
            title="Open Custom Canvas Size Dialog"
            className="retro-chrome-btn flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors font-semibold shrink-0 cursor-pointer text-primary-theme"
          >
            <Sliders className="w-3 h-3" style={{ color: 'var(--text-accent)' }} />
            <span>Resize</span>
          </button>
        </div>

        {/* Starter Template quick load dropdown */}
        <div className="hidden lg:flex items-center gap-1 retro-inset-well px-2 py-1 rounded-lg shrink-0">
          <Sparkles className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--text-accent)' }} />
          <select
            onChange={(e) => {
              if (e.target.value) {
                onSelectStarterTemplate(e.target.value);
                e.target.value = '';
              }
            }}
            defaultValue=""
            className="bg-transparent text-xs text-secondary-theme outline-none cursor-pointer"
          >
            <option value="" disabled className="bg-surface-theme text-secondary-theme">Load Starter...</option>
            {STARTER_TEMPLATES.map(t => (
              <option key={t.id} value={t.id} className="bg-surface-theme text-primary-theme">
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Middle Controls: Undo/Redo & Toggles */}
      <div className="flex items-center flex-wrap gap-1.5">
        {/* Undo / Redo */}
        <div className="flex items-center retro-inset-well rounded-lg p-0.5 shrink-0">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="retro-chrome-btn flex items-center gap-1.5 px-2 py-1 rounded transition-colors disabled:opacity-25 disabled:pointer-events-none text-xs font-semibold cursor-pointer text-primary-theme"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Undo</span>
          </button>
          <div className="retro-recessed-divider h-4 my-auto mx-0.5" />
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
            className="retro-chrome-btn flex items-center gap-1.5 px-2 py-1 rounded transition-colors disabled:opacity-25 disabled:pointer-events-none text-xs font-semibold cursor-pointer text-primary-theme"
          >
            <Redo2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Redo</span>
          </button>
        </div>

        <div className="retro-recessed-divider h-6 mx-1 shrink-0" />

        {/* Toggles Group */}
        <div className="flex items-center gap-1 retro-inset-well rounded-lg p-0.5 shrink-0">
          {/* Pixel Grid */}
          <button
            onClick={onToggleGrid}
            title={showGrid ? 'Hide Pixel Grid (G)' : 'Show Pixel Grid (G)'}
            className={`retro-chrome-btn p-1.5 rounded transition-colors cursor-pointer ${
              showGrid ? 'active font-bold' : 'text-secondary-theme'
            }`}
          >
            <Grid className="w-3.5 h-3.5" style={showGrid ? { color: 'var(--text-accent)' } : undefined} />
          </button>

          {/* Body Outline Guides */}
          <button
            onClick={onToggleGuides}
            title="Toggle 9x8, 11x10, 5x10 Body Outline Guides (H)"
            className={`retro-chrome-btn flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors cursor-pointer ${
              showGuides ? 'active font-bold' : 'text-secondary-theme'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" style={showGuides ? { color: 'var(--text-accent)' } : undefined} />
            <span className="hidden sm:inline text-[11px]">Guides</span>
          </button>

          {/* Exact Wiki Numbers Overlay (1-8, 11-20, 1-10) */}
          <button
            onClick={onToggleNumbers}
            title="Toggle Dimension Numbers (Matching 1000.png wiki diagram) (N)"
            className={`retro-chrome-btn flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors cursor-pointer ${
              showNumbers ? 'active font-bold' : 'text-secondary-theme'
            }`}
          >
            <Hash className="w-3.5 h-3.5" style={showNumbers ? { color: 'var(--text-accent)' } : undefined} />
            <span className="hidden sm:inline text-[11px]">Numbers</span>
          </button>

          {/* Move / Reposition Guide Toggle */}
          <button
            onClick={onToggleMoveGuide}
            title={isMovingGuide ? "Lock Guide Position (Press to finish)" : "Reposition & Drag Guide and Numbers anywhere on canvas (or Hold Alt+Drag)"}
            className={`retro-chrome-btn flex items-center gap-1 px-2 py-1 text-xs rounded transition-all cursor-pointer ${
              isMovingGuide ? 'active font-bold' : 'text-secondary-theme'
            }`}
          >
            <Move className="w-3.5 h-3.5" style={isMovingGuide ? { color: 'var(--text-accent)' } : undefined} />
            <span className="hidden md:inline text-[11px]">{isMovingGuide ? 'Dragging Guide' : 'Move Guide'}</span>
          </button>

          {/* Mirror / Symmetry */}
          <button
            onClick={onToggleSymmetry}
            title="Toggle Vertical Mirror Symmetry (S)"
            className={`retro-chrome-btn p-1.5 rounded transition-colors cursor-pointer ${
              symmetryActive ? 'active font-bold' : 'text-secondary-theme'
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" style={symmetryActive ? { color: 'var(--text-accent)' } : undefined} />
          </button>

          {/* Snappy / Instant Mode Toggle */}
          {onToggleAnimations && (
            <button
              onClick={onToggleAnimations}
              title={animationsEnabled ? "Animations: ON (Click for Instant Snappy Mode)" : "Snappy Mode: ON (Animations disabled for zero delay)"}
              className={`retro-chrome-btn flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors cursor-pointer ${
                !animationsEnabled ? 'active font-bold' : 'text-secondary-theme'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${!animationsEnabled ? 'animate-pulse' : ''}`} style={!animationsEnabled ? { color: 'var(--text-accent)' } : undefined} />
              <span className="hidden md:inline text-[11px]">{!animationsEnabled ? 'Snappy' : 'Anim'}</span>
            </button>
          )}
        </div>

        <div className="retro-recessed-divider h-6 mx-1 hidden sm:block shrink-0" />

        {/* Zoom Controls */}
        <div className="hidden sm:flex items-center gap-1 retro-inset-well rounded-lg p-0.5 shrink-0">
          <button
            onClick={() => onZoomChange(Math.max(4, zoom - 2))}
            title="Zoom out"
            className="retro-chrome-btn p-1.5 rounded cursor-pointer text-primary-theme"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono text-primary-theme px-1 w-11 text-center font-medium">
            {Math.round((zoom / 16) * 100)}%
          </span>
          <button
            onClick={() => onZoomChange(Math.min(64, zoom + 2))}
            title="Zoom in"
            className="retro-chrome-btn p-1.5 rounded cursor-pointer text-primary-theme"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onZoomChange(16)}
            title="Reset Zoom to 100%"
            className="retro-chrome-btn p-1 rounded text-[10px] cursor-pointer text-primary-theme font-mono"
          >
            1x
          </button>
        </div>
      </div>

      {/* Right Actions: Theme Selector, Guide, Project Save/Load, Export */}
      <div className="flex items-center flex-wrap gap-2 ml-auto">
        {/* Theme Selector */}
        {onSelectTheme && (
          <div className="flex items-center gap-1.5 retro-inset-well px-2 py-1 rounded-lg shrink-0" title="Switch Theme">
            <Palette className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--text-accent)' }} />
            <select
              value={currentThemeId}
              onChange={(e) => onSelectTheme(e.target.value)}
              className="bg-transparent text-xs text-primary-theme font-medium outline-none cursor-pointer"
            >
              {AVAILABLE_THEMES.map(theme => (
                <option key={theme.id} value={theme.id} className="bg-surface-theme text-primary-theme">
                  {theme.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Help & Documentation Modal */}
        {onOpenHelpModal && (
          <button
            onClick={onOpenHelpModal}
            className="retro-chrome-btn flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 cursor-pointer text-primary-theme"
            title="Open Help & Documentation Manual (?)"
          >
            <BookOpen className="w-3.5 h-3.5" style={{ color: 'var(--text-accent)' }} />
            <span className="hidden md:inline">Help & Docs</span>
          </button>
        )}

        {/* Dimensions Wiki Guide Modal */}
        <button
          onClick={onOpenGuideModal}
          className="retro-chrome-btn flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 cursor-pointer text-primary-theme"
          title="Open Sprite Dimensions Wiki Guide"
        >
          <HelpCircle className="w-3.5 h-3.5" style={{ color: 'var(--text-accent)' }} />
          <span className="hidden md:inline">Dimensions</span>
        </button>

        {/* Save / Load JSON Project */}
        <button
          onClick={onSaveProject}
          title="Save Sprite Project (JSON)"
          className="retro-chrome-btn p-1.5 rounded-lg transition-colors hidden sm:block shrink-0 cursor-pointer text-primary-theme"
        >
          <Save className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          title="Load Sprite Project (JSON)"
          className="retro-chrome-btn p-1.5 rounded-lg transition-colors hidden sm:block shrink-0 cursor-pointer text-primary-theme"
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
          className="retro-gold-btn flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export PNG</span>
        </button>

        {onToggleRightSidebar && (
          <button
            onClick={onToggleRightSidebar}
            title={rightCollapsed ? "Expand Panels Sidebar" : "Collapse Panels Sidebar"}
            className={`retro-chrome-btn p-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
              rightCollapsed ? 'active' : ''
            }`}
          >
            {rightCollapsed ? (
              <PanelRightOpen className="w-4 h-4" style={{ color: 'var(--text-accent)' }} />
            ) : (
              <PanelRightClose className="w-4 h-4 text-secondary-theme" />
            )}
          </button>
        )}
      </div>
    </header>
  );
};
