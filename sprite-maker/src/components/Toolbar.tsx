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
  FlipVertical
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
  onFlipHorizontalSelection?: () => void;
  onFlipVerticalSelection?: () => void;
  onClearSelection?: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  currentTool,
  onSelectTool,
  brushSize,
  onBrushSizeChange,
  symmetryActive,
  onToggleSymmetry,
  hasSelection,
  onFlipHorizontalSelection,
  onFlipVerticalSelection,
  onClearSelection,
}) => {
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
    { id: 'select' as ToolType, label: 'Select Area (M)', icon: Scissors },
    { id: 'lighten' as ToolType, label: 'Lighten (Dodge)', icon: SunMedium },
    { id: 'darken' as ToolType, label: 'Darken (Burn)', icon: Moon },
    { id: 'replace' as ToolType, label: 'Color Replace', icon: Sparkles },
  ];

  return (
    <div className="flex flex-col gap-3 bg-neutral-900 border-r border-neutral-800 p-2.5 w-16 items-center shrink-0 z-20 select-none">
      {/* Primary Drawing Tools */}
      <div className="flex flex-col gap-1 w-full items-center">
        {tools.map(tool => {
          const Icon = tool.icon;
          const isActive = currentTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => onSelectTool(tool.id)}
              title={tool.label}
              className={`relative p-2 rounded-lg transition-all flex items-center justify-center group ${
                isActive
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow-lg shadow-amber-500/20'
                  : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800'
              }`}
            >
              <Icon 
                className="w-4 h-4" 
                fill={tool.fill ? 'currentColor' : 'none'} 
              />
              <span className="sr-only">{tool.label}</span>
              
              {/* Tooltip */}
              <div className="absolute left-full ml-2 px-2 py-1 bg-neutral-800 text-neutral-100 text-xs rounded border border-neutral-700 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl">
                {tool.label}
              </div>
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
          <span className="text-[9px] font-bold text-amber-400 text-center uppercase">Select</span>
          <button
            onClick={onFlipHorizontalSelection}
            title="Flip Selection Horizontal"
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded flex items-center justify-center"
          >
            <FlipHorizontal className="w-4 h-4" />
          </button>
          <button
            onClick={onFlipVerticalSelection}
            title="Flip Selection Vertical"
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded flex items-center justify-center"
          >
            <FlipVertical className="w-4 h-4" />
          </button>
          <button
            onClick={onClearSelection}
            title="Deselect"
            className="text-[10px] py-1 bg-neutral-800 text-neutral-300 hover:text-white rounded"
          >
            Esc
          </button>
        </div>
      )}
    </div>
  );
};
