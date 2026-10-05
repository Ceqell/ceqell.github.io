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
      className="flex flex-col gap-2.5 bg-neutral-900 border-r border-neutral-800 p-2 items-center shrink-0 z-20 select-none overflow-y-auto"
    >
      {/* Collapse button header */}
      <div className="flex items-center justify-between w-full px-0.5">
        {width >= 90 && (
          <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Tools</span>
        )}
        {onCollapse && (
          <button
            onClick={onCollapse}
            title="Collapse Sidebar"
            className="p-1 rounded text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors ml-auto"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Undo & Redo Shortcuts */}
      <div className={`flex items-center gap-1 w-full justify-center bg-neutral-950 p-1 rounded-lg border border-neutral-800/80 ${isWide ? 'px-2' : ''}`}>
        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className={`relative p-1.5 rounded text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 disabled:opacity-20 disabled:pointer-events-none transition-colors group flex items-center justify-center ${isWide ? 'flex-1 gap-1 text-xs' : ''}`}
        >
          <Undo2 className="w-3.5 h-3.5" />
          {isWide && <span>Undo</span>}
          {!isWide && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-neutral-800 text-neutral-100 text-xs rounded border border-neutral-700 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl">
              Undo (Ctrl+Z)
            </div>
          )}
        </button>

        <button
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y / Ctrl+Shift+Z)"
          className={`relative p-1.5 rounded text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 disabled:opacity-20 disabled:pointer-events-none transition-colors group flex items-center justify-center ${isWide ? 'flex-1 gap-1 text-xs' : ''}`}
        >
          <Redo2 className="w-3.5 h-3.5" />
          {isWide && <span>Redo</span>}
          {!isWide && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-neutral-800 text-neutral-100 text-xs rounded border border-neutral-700 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl">
              Redo (Ctrl+Y)
            </div>
          )}
        </button>
      </div>

      <div className="w-full h-px bg-neutral-800" />

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
              className={`relative rounded-lg transition-all flex items-center group ${
                isWide ? 'px-2 py-1.5 gap-2 w-full justify-start' : 'p-2 justify-center'
              } ${
                isActive
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow-lg shadow-amber-500/20'
                  : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800'
              }`}
            >
              <Icon 
                className="w-4 h-4 shrink-0" 
                fill={tool.fill ? 'currentColor' : 'none'} 
              />
              
              {isWide ? (
                <span className="text-xs truncate font-medium flex-1 text-left">
                  {tool.label.split(' (')[0]}
                </span>
              ) : (
                <span className="sr-only">{tool.label}</span>
              )}
              
              {/* Tooltip for narrow modes */}
              {!isWide && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-neutral-800 text-neutral-100 text-xs rounded border border-neutral-700 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl">
                  {tool.label}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="w-full h-px bg-neutral-800 my-1" />

      {/* Brush Size */}
      <div className="flex flex-col items-center gap-1.5 w-full">
        <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500">Size</span>
        <div className="grid grid-cols-2 gap-1 w-full">
          {[1, 2, 3, 4].map(size => (
            <button
              key={size}
              onClick={() => onBrushSizeChange(size)}
              className={`h-6 text-xs font-mono rounded flex items-center justify-center transition-colors ${
                brushSize === size
                  ? 'bg-amber-500 text-neutral-950 font-bold'
                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
              title={`Brush size: ${size}px`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full h-px bg-neutral-800 my-1" />

      {/* Vertical Symmetry Toggle */}
      <button
        onClick={onToggleSymmetry}
        title="Mirror / Vertical Symmetry Mode"
        className={`relative p-2 w-full rounded-lg transition-all flex flex-col items-center justify-center gap-0.5 group ${
          symmetryActive
            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-sm'
            : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800'
        }`}
      >
        <SplitSquareVertical className="w-4 h-4" />
        <span className="text-[9px] font-mono font-medium">Mirror</span>
        <div className="absolute left-full ml-2 px-2 py-1 bg-neutral-800 text-neutral-100 text-xs rounded border border-neutral-700 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl">
          Vertical Mirror / Symmetry Mode (Draws on both left & right)
        </div>
      </button>

      {/* Selection operations if active */}
      {hasSelection && (
        <div className="flex flex-col gap-1 w-full animate-in fade-in duration-200">
          <div className="w-full h-px bg-neutral-800 my-1" />
          <span className="text-[9px] font-bold text-amber-400 text-center uppercase">
            {isFloating ? 'Moving Pixels' : 'Selection'}
          </span>
          
          {isFloating && onCommitFloatingSelection && (
            <button
              onClick={onCommitFloatingSelection}
              title="Stamp / Commit Moved Pixels (Enter)"
              className={`p-1.5 text-neutral-950 bg-amber-400 hover:bg-amber-300 font-bold rounded flex items-center justify-center transition-colors shadow ${isWide ? 'gap-1.5 px-2 text-xs justify-start' : ''}`}
            >
              <Check className="w-3.5 h-3.5 shrink-0" />
              {isWide && <span>Stamp (Enter)</span>}
            </button>
          )}

          <button
            onClick={onDeleteSelection}
            title="Delete Selected Pixels (Delete / Backspace)"
            className={`p-1.5 text-red-400 hover:text-red-200 hover:bg-red-500/20 rounded flex items-center justify-center transition-colors border border-red-500/30 ${isWide ? 'gap-1.5 px-2 text-xs justify-start' : ''}`}
          >
            <Trash2 className="w-3.5 h-3.5 shrink-0" />
            {isWide && <span>Delete Pixels</span>}
          </button>

          <div className="grid grid-cols-2 gap-1 w-full">
            <button
              onClick={onFlipHorizontalSelection}
              title="Flip Selection Horizontal"
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded flex items-center justify-center transition-colors"
            >
              <FlipHorizontal className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onFlipVerticalSelection}
              title="Flip Selection Vertical"
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded flex items-center justify-center transition-colors"
            >
              <FlipVertical className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={onClearSelection}
            title="Deselect (Escape)"
            className="text-[10px] py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded transition-colors text-center"
          >
            {isWide ? 'Deselect (Esc)' : 'Esc'}
          </button>
        </div>
      )}
    </div>
  );
};
