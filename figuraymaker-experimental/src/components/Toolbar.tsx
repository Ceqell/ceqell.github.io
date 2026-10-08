import React, { useState, useEffect } from 'react';
import { 
  Pencil, 
  Eraser, 
  PaintBucket, 
  Pipette, 
  Minus, 
  Plus, 
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
  Check,
  Package
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
  autoSwitchPencil?: boolean;
  onToggleAutoSwitchPencil?: (val: boolean) => void;
  onOpenAssetManager?: () => void;
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
  autoSwitchPencil = false,
  onToggleAutoSwitchPencil,
  onOpenAssetManager,
}) => {
  const isWide = width >= 125;
  const isMedium = width >= 90 && width < 125;
  const isSingleColumn = width < 80;

  const [inputValue, setInputValue] = useState<string>(String(brushSize));

  useEffect(() => {
    setInputValue(String(brushSize));
  }, [brushSize]);

  const commitValue = (val: string) => {
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed)) {
      const clamped = Math.max(1, Math.min(32, parsed));
      onBrushSizeChange(clamped);
      setInputValue(String(clamped));
    } else {
      setInputValue(String(brushSize));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputValue(raw);
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 32) {
      onBrushSizeChange(parsed);
    }
  };

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
      className={`flex flex-col gap-2 h-full bg-surface-theme border-r border-ui-theme ${
        width < 60 ? 'px-1 py-1.5' : 'p-2'
      } items-center shrink-0 z-20 select-none overflow-x-hidden overflow-y-auto shadow-sm transition-colors`}
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

      {/* Undo & Redo Shortcuts: Stacked vertically when sidebar is narrow so they never go out of bounds */}
      <div className={`flex ${isSingleColumn ? 'flex-col' : 'flex-row'} items-center gap-1 w-full justify-center retro-inset-well p-1 rounded-lg ${isWide ? 'px-2' : ''}`}>
        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className={`retro-chrome-btn p-1.5 rounded disabled:opacity-25 disabled:pointer-events-none transition-colors flex items-center justify-center cursor-pointer text-primary-theme ${
            isWide ? 'flex-1 gap-1 text-xs font-semibold' : 'w-full'
          }`}
        >
          <Undo2 className="w-3.5 h-3.5" />
          {isWide && <span>Undo</span>}
        </button>

        <button
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y / Ctrl+Shift+Z)"
          className={`retro-chrome-btn p-1.5 rounded disabled:opacity-25 disabled:pointer-events-none transition-colors flex items-center justify-center cursor-pointer text-primary-theme ${
            isWide ? 'flex-1 gap-1 text-xs font-semibold' : 'w-full'
          }`}
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
                isWide ? 'px-2 py-1.5 gap-2 w-full justify-start' : 'p-2 justify-center w-full'
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

      {/* Asset Manager / Toolbox Quick Button */}
      {onOpenAssetManager && (
        <div className="w-full">
          <button
            type="button"
            onClick={onOpenAssetManager}
            title="Open Toolbox & Asset Manager (54 Human-Drawn Sprites)"
            className={`retro-chrome-btn rounded-lg transition-all flex items-center cursor-pointer text-primary-theme ${
              isWide ? 'px-2 py-1.5 gap-2 w-full justify-start' : 'p-2 justify-center w-full'
            }`}
          >
            <Package className="w-4 h-4 shrink-0" style={{ color: 'var(--text-accent)' }} />
            {isWide && (
              <span className="text-xs truncate font-medium flex-1 text-left">
                Toolbox Assets
              </span>
            )}
          </button>
        </div>
      )}

      <div className="retro-recessed-divider-h my-0.5 shrink-0" />

      {/* Brush Size Controls: Editable px textbox and non-squished Minus / Plus buttons */}
      <div className="flex flex-col items-center gap-1.5 w-full">
        {width >= 60 && (
          <span className="text-[10px] uppercase font-bold tracking-wider text-secondary-theme">Size</span>
        )}

        {/* Editable px Textbox */}
        <div 
          className="retro-inset-well flex items-center justify-center px-1.5 py-1 rounded-lg w-full bg-surface-theme focus-within:ring-1 focus-within:ring-amber-500 transition-all cursor-text"
          title="Brush size: Click to type (1 - 32 px)"
        >
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={() => commitValue(inputValue)}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter') {
                commitValue(inputValue);
                (e.target as HTMLInputElement).blur();
              } else if (e.key === 'Escape') {
                setInputValue(String(brushSize));
                (e.target as HTMLInputElement).blur();
              }
            }}
            className="w-7 text-right text-xs font-mono font-bold bg-transparent outline-none select-text text-center"
            style={{ color: 'var(--text-accent)' }}
            aria-label="Brush size in pixels"
          />
          <span className="text-[10px] font-mono font-semibold text-secondary-theme select-none ml-0.5">px</span>
        </div>

        {/* Stepper buttons (- / +): Stacked vertically in narrow mode so they never share crowded space */}
        <div className={`flex ${isSingleColumn ? 'flex-col' : 'flex-row'} items-center gap-1 w-full justify-center`}>
          <button
            type="button"
            onClick={() => onBrushSizeChange(Math.max(1, brushSize - 1))}
            disabled={brushSize <= 1}
            title="Decrease brush size ([)"
            className={`retro-chrome-btn rounded disabled:opacity-25 disabled:pointer-events-none transition-colors flex items-center justify-center cursor-pointer text-primary-theme ${
              isSingleColumn ? 'w-full h-7' : 'flex-1 h-6'
            }`}
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onBrushSizeChange(Math.min(32, brushSize + 1))}
            disabled={brushSize >= 32}
            title="Increase brush size (])"
            className={`retro-chrome-btn rounded disabled:opacity-25 disabled:pointer-events-none transition-colors flex items-center justify-center cursor-pointer text-primary-theme ${
              isSingleColumn ? 'w-full h-7' : 'flex-1 h-6'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Custom Range Slider (1 to 32px) when space allows */}
        {width >= 80 && (
          <div className="w-full flex items-center gap-1.5 px-0.5 mt-0.5">
            <input
              type="range"
              min={1}
              max={32}
              value={brushSize}
              onChange={(e) => onBrushSizeChange(Math.max(1, Math.min(32, Number(e.target.value))))}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-[var(--border-ui)] accent-amber-500"
              title={`Custom size slider: ${brushSize}px (1-32px)`}
            />
          </div>
        )}
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
        <SplitSquareVertical className="w-4 h-4 shrink-0" style={symmetryActive ? { color: 'var(--text-accent)' } : undefined} />
        {width >= 64 && (
          <span className="text-[9px] font-mono font-medium truncate" style={symmetryActive ? { color: 'var(--text-accent)' } : undefined}>Mirror</span>
        )}
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
              className={`retro-gold-btn p-1.5 rounded flex items-center justify-center transition-all cursor-pointer ${isWide ? 'gap-1.5 px-2 text-xs justify-start' : 'w-full'}`}
            >
              <Check className="w-3.5 h-3.5 shrink-0" />
              {isWide && <span>Stamp (Enter)</span>}
            </button>
          )}

          <button
            onClick={onDeleteSelection}
            title="Delete Selected Pixels (Delete / Backspace)"
            className={`retro-chrome-btn p-1.5 text-red-500 hover:text-red-600 rounded flex items-center justify-center transition-colors cursor-pointer ${isWide ? 'gap-1.5 px-2 text-xs justify-start' : 'w-full'}`}
          >
            <Trash2 className="w-3.5 h-3.5 shrink-0" />
            {isWide && <span>Delete Pixels</span>}
          </button>

          <div className={`${isSingleColumn ? 'flex flex-col' : 'grid grid-cols-2'} gap-1 w-full`}>
            <button
              onClick={onFlipHorizontalSelection}
              title="Flip Selection Horizontal"
              className="retro-chrome-btn p-1.5 text-primary-theme rounded flex items-center justify-center transition-colors cursor-pointer w-full"
            >
              <FlipHorizontal className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onFlipVerticalSelection}
              title="Flip Selection Vertical"
              className="retro-chrome-btn p-1.5 text-primary-theme rounded flex items-center justify-center transition-colors cursor-pointer w-full"
            >
              <FlipVertical className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={onClearSelection}
            title="Deselect (Escape)"
            className="retro-chrome-btn text-[10px] py-1 text-secondary-theme rounded transition-colors text-center cursor-pointer w-full"
          >
            {isWide ? 'Deselect (Esc)' : 'Esc'}
          </button>
        </div>
      )}

      {/* Auto Switch to Pencil after Eyedropper Option */}
      <div className="mt-auto pt-2 flex flex-col items-center w-full shrink-0">
        <div className="retro-recessed-divider-h my-1 shrink-0 w-full" />
        <label 
          className="flex flex-col items-center justify-center cursor-pointer select-none py-1 px-0.5 rounded-lg hover:bg-surface-raised-theme transition-colors text-secondary-theme hover:text-primary-theme w-full group"
          title="Auto switch tool back to pencil after eyedropper color pick"
        >
          <div className="flex items-center gap-1.5 justify-center">
            <input
              type="checkbox"
              checked={autoSwitchPencil}
              onChange={(e) => onToggleAutoSwitchPencil?.(e.target.checked)}
              className="w-3.5 h-3.5 rounded-xs accent-[var(--text-accent)] cursor-pointer shrink-0"
            />
            {width >= 80 && (
              <span className="text-[10px] font-mono leading-tight truncate">
                {isWide ? 'Auto Pencil on Pick' : 'Auto Pencil'}
              </span>
            )}
          </div>
          {width < 80 && (
            <span className="text-[8px] font-mono leading-none text-secondary-theme group-hover:text-primary-theme mt-0.5 tracking-tighter truncate text-center font-medium">
              Auto P
            </span>
          )}
        </label>
      </div>
    </div>
  );
};
