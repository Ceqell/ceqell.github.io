import React from 'react';
import { 
  Pencil, 
  Eraser, 
  PaintBucket, 
  Pipette, 
  Minus, 
  Square, 
  Circle, 
  SunMedium, 
  Moon, 
  Sparkles, 
  Scissors, 
  SplitSquareVertical, 
  FlipHorizontal, 
  FlipVertical, 
  Undo2, 
  Redo2, 
  ChevronLeft, 
  LassoSelect, 
  Trash2, 
  Check 
} from 'lucide-react';
import { ToolType } from '../types/sprite';

interface ToolbarProps {
  currentTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  symmetryActive: boolean;
  onToggleSymmetry: () => void;
  hasSelection: boolean;
  isFloating?: boolean;
  onCommitFloatingSelection?: () => void;
  onFlipHorizontalSelection?: () => void;
  onFlipVerticalSelection?: () => void;
  onDeleteSelection?: () => void;
  onClearSelection?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  width?: number;
  onCollapse?: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  currentTool,
  onSelectTool,
  brushSize,
  onBrushSizeChange,
  symmetryActive,
  onToggleSymmetry,
  hasSelection,
  isFloating = false,
  onCommitFloatingSelection,
  onFlipHorizontalSelection,
  onFlipVerticalSelection,
  onDeleteSelection,
  onClearSelection,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  width = 64,
  onCollapse,
}) => {
  const isWide = width >= 125;
  const isMedium = width >= 90 && width < 125;

  const tools = [
    { id: 'pencil' as ToolType, label: 'Pencil (P)', icon: Pencil },
    { id: 'eraser' as ToolType, label: 'Eraser (E)', icon: Eraser },
    { id: 'bucket' as ToolType, label: 'Bucket Fill (B)', icon: PaintBucket },
    { id: 'eyedropper' as ToolType, label: 'Eyedropper (I)', icon: Pipette },
    { id: 'line' as ToolType, label: 'Line (L)', icon: Minus },
    { id: 'rectangle' as ToolType, label: 'Rectangle (U)', icon: Square },
    { id: 'rectangle_fill' as ToolType, label: 'Filled Box', icon: Square, fill: true },
    { id: 'circle' as ToolType, label: 'Circle (C)', icon: Circle },
    { id: 'circle_fill' as ToolType, label: 'Filled Circle', icon: Circle, fill: true },
    { id: 'select' as ToolType, label: 'Box Select (M)', icon: Scissors },
    { id: 'lasso' as ToolType, label: 'Lasso Select (Q)', icon: LassoSelect },
    { id: 'lighten' as ToolType, label: 'Lighten (Dodge)', icon: SunMedium },
    { id: 'darken' as ToolType, label: 'Darken (Burn)', icon: Moon },
    { id: 'replace' as ToolType, label: 'Color Replace', icon: Sparkles },
  ];

  return (
    <div 
      style={{ width: `${width}px` }}
      className="flex flex-col gap-2.5 bg-surface-theme border-r border-ui-theme p-2 items-center shrink-0 z-20 select-none overflow-x-hidden overflow-y-auto shadow-sm transition-colors"
    >
      {/* Collapse button header */}
      <div className="flex items-center justify-between w-full px-0.5">
        {width >= 90 && (
          <span className="text-[10px] uppercase font-bold tracking-wider text-secondary-theme">Tools</span>
        )}
        {onCollapse && (
          <button
            onClick={onCollapse}
            title="Collapse Sidebar"
            className="retro-chrome-btn p-1 rounded text-primary-theme transition-colors ml-auto cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Undo & Redo Shortcuts */}
      <div className={`flex items-center gap-1 w-full justify-center retro-inset-well p-1 rounded-lg ${isWide ? 'px-2' : ''}`}>
        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className={`retro-chrome-btn p-1.5 rounded disabled:opacity-25 disabled:pointer-events-none transition-colors flex items-center justify-center cursor-pointer text-primary-theme ${isWide ? 'flex-1 gap-1 text-xs font-semibold' : ''}`}
        >
          <Undo2 className="w-3.5 h-3.5" />
          {isWide && <span>Undo</span>}
        </button>

        <button
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y / Ctrl+Shift+Z)"
          className={`retro-chrome-btn p-1.5 rounded disabled:opacity-25 disabled:pointer-events-none transition-colors flex items-center justify-center cursor-pointer text-primary-theme ${isWide ? 'flex-1 gap-1 text-xs font-semibold' : ''}`}
        >
          <Redo2 className="w-3.5 h-3.5" />
          {isWide && <span>Redo</span>}
        </button>
      </div>

      <div className="retro-recessed-divider-h my-0.5 shrink-0" />

      {/* Primary Drawing Tools */}
      <div className={`w-full ${isWide ? 'flex flex-col gap-1' : isMedium ? 'grid grid-cols-2 gap-1' : 'flex flex-col gap-1 items-center'}`}>
        {tools.map(tool => {
          const Icon = tool.icon;
          const isActive = currentTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => onSelectTool(tool.id)}
              title={tool.label}
              className={`retro-chrome-btn rounded-lg transition-all flex items-center cursor-pointer ${
                isWide ? 'px-2 py-1.5 gap-2 w-full justify-start' : 'p-2 justify-center'
              } ${
                isActive ? 'active font-bold' : 'text-secondary-theme'
              }`}
              style={isActive ? { color: 'var(--text-accent)' } : undefined}
            >
              <Icon 
                className="w-4 h-4 shrink-0" 
                fill={tool.fill ? 'currentColor' : 'none'} 
                style={isActive ? { color: 'var(--text-accent)' } : undefined}
              />
              
              {isWide ? (
                <span className="text-xs truncate font-medium flex-1 text-left">
                  {tool.label.split(' (')[0]}
                </span>
              ) : (
                <span className="sr-only">{tool.label}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="retro-recessed-divider-h my-0.5 shrink-0" />

      {/* Brush Size */}
      <div className="flex flex-col items-center gap-1.5 w-full">
        <span className="text-[10px] uppercase font-bold tracking-wider text-secondary-theme">Size</span>
        <div className="retro-inset-well p-1 rounded-lg grid grid-cols-2 gap-1 w-full">
          {[1, 2, 3, 4].map(size => (
            <button
              key={size}
              onClick={() => onBrushSizeChange(size)}
              className={`h-6 text-xs font-mono rounded flex items-center justify-center transition-colors cursor-pointer retro-chrome-btn ${
                brushSize === size ? 'active font-bold' : 'text-secondary-theme'
              }`}
              style={brushSize === size ? { color: 'var(--text-accent)' } : undefined}
              title={`Brush size: ${size}px ([ or ])`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="retro-recessed-divider-h my-0.5 shrink-0" />

      {/* Vertical Symmetry Toggle */}
      <button
        onClick={onToggleSymmetry}
        title="Mirror / Vertical Symmetry Mode (Draws on both left & right) (S)"
        className={`retro-chrome-btn p-2 w-full rounded-lg transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
          symmetryActive ? 'active font-bold' : 'text-secondary-theme'
        }`}
      >
        <SplitSquareVertical className="w-4 h-4" style={symmetryActive ? { color: 'var(--text-accent)' } : undefined} />
        <span className="text-[9px] font-mono font-medium" style={symmetryActive ? { color: 'var(--text-accent)' } : undefined}>Mirror</span>
      </button>

      {/* Selection operations if active */}
      {hasSelection && (
        <div className="flex flex-col gap-1 w-full animate-in fade-in duration-200">
          <div className="retro-recessed-divider-h my-1 shrink-0" />
          <span className="text-[9px] font-bold text-center uppercase" style={{ color: 'var(--text-accent)' }}>
            {isFloating ? 'Moving Pixels' : 'Selection'}
          </span>
          
          {isFloating && onCommitFloatingSelection && (
            <button
              onClick={onCommitFloatingSelection}
              title="Stamp / Commit Moved Pixels (Enter)"
              className={`retro-gold-btn p-1.5 rounded flex items-center justify-center transition-all cursor-pointer ${isWide ? 'gap-1.5 px-2 text-xs justify-start' : ''}`}
            >
              <Check className="w-3.5 h-3.5 shrink-0" />
              {isWide && <span>Stamp (Enter)</span>}
            </button>
          )}

          <button
            onClick={onDeleteSelection}
            title="Delete Selected Pixels (Delete / Backspace)"
            className={`retro-chrome-btn p-1.5 text-red-500 hover:text-red-600 rounded flex items-center justify-center transition-colors cursor-pointer ${isWide ? 'gap-1.5 px-2 text-xs justify-start' : ''}`}
          >
            <Trash2 className="w-3.5 h-3.5 shrink-0" />
            {isWide && <span>Delete Pixels</span>}
          </button>

          <div className="grid grid-cols-2 gap-1 w-full">
            <button
              onClick={onFlipHorizontalSelection}
              title="Flip Selection Horizontal"
              className="retro-chrome-btn p-1.5 text-primary-theme rounded flex items-center justify-center transition-colors cursor-pointer"
            >
              <FlipHorizontal className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onFlipVerticalSelection}
              title="Flip Selection Vertical"
              className="retro-chrome-btn p-1.5 text-primary-theme rounded flex items-center justify-center transition-colors cursor-pointer"
            >
              <FlipVertical className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={onClearSelection}
            title="Deselect (Escape)"
            className="retro-chrome-btn text-[10px] py-1 text-secondary-theme rounded transition-colors text-center cursor-pointer"
          >
            {isWide ? 'Deselect (Esc)' : 'Esc'}
          </button>
        </div>
      )}
    </div>
  );
};
