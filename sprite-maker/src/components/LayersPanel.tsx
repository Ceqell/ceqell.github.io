import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Plus, 
  Trash2, 
  Copy, 
  ChevronUp, 
  ChevronDown, 
  Layers as LayersIcon,
  Combine,
  Edit2,
  Check
} from 'lucide-react';
import { Layer } from '../types/sprite';

interface LayersPanelProps {
  layers: Layer[];
  activeLayerId: string;
  onSelectLayer: (id: string) => void;
  onAddLayer: () => void;
  onDeleteLayer: (id: string) => void;
  onDuplicateLayer: (id: string) => void;
  onMergeDownLayer: (id: string) => void;
  onMoveLayer: (id: string, direction: 'up' | 'down') => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onChangeOpacity: (id: string, opacity: number) => void;
  onRenameLayer: (id: string, name: string) => void;
  canvasWidth: number;
  canvasHeight: number;
}

export const LayersPanel: React.FC<LayersPanelProps> = ({
  layers,
  activeLayerId,
  onSelectLayer,
  onAddLayer,
  onDeleteLayer,
  onDuplicateLayer,
  onMergeDownLayer,
  onMoveLayer,
  onToggleVisibility,
  onToggleLock,
  onChangeOpacity,
  onRenameLayer,
  canvasWidth,
  canvasHeight,
}) => {
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const activeLayer = layers.find(l => l.id === activeLayerId);
  const activeIndex = layers.findIndex(l => l.id === activeLayerId);

  const startRename = (layer: Layer) => {
    setEditingLayerId(layer.id);
    setEditingName(layer.name);
  };

  const saveRename = (id: string) => {
    if (editingName.trim()) {
      onRenameLayer(id, editingName.trim());
    }
    setEditingLayerId(null);
  };

  return (
    <div className="flex flex-col bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl text-neutral-200 w-full max-h-[360px]">
      {/* Header & Actions */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-800 bg-neutral-950/60">
        <div className="flex items-center gap-1.5 font-medium text-xs text-neutral-300">
          <LayersIcon className="w-3.5 h-3.5 text-amber-400" />
          <span>Layers</span>
          <span className="text-[10px] text-neutral-500 font-mono">({layers.length})</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onAddLayer}
            title="New Layer"
            className="p-1 hover:bg-neutral-800 text-neutral-400 hover:text-amber-400 rounded transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDuplicateLayer(activeLayerId)}
            title="Duplicate Active Layer"
            className="p-1 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onMergeDownLayer(activeLayerId)}
            disabled={activeIndex <= 0}
            title="Merge Down"
            className="p-1 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <Combine className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDeleteLayer(activeLayerId)}
            disabled={layers.length <= 1}
            title="Delete Layer"
            className="p-1 hover:bg-neutral-800 text-neutral-400 hover:text-red-400 rounded transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Layer List (stacked top layer first, so reversed array) */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
        {[...layers].reverse().map((layer, index) => {
          const actualIndex = layers.length - 1 - index;
          const isActive = layer.id === activeLayerId;

          return (
            <div
              key={layer.id}
              onClick={() => onSelectLayer(layer.id)}
              className={`group flex items-center gap-2 px-2 py-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
                isActive
                  ? 'bg-amber-500/10 border-amber-500/40 text-white shadow-sm'
                  : 'bg-neutral-900/60 border-transparent hover:bg-neutral-800/60 text-neutral-400'
              }`}
            >
              {/* Visibility Toggle */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleVisibility(layer.id);
                }}
                className="p-1 hover:bg-neutral-700/50 rounded text-neutral-400 hover:text-white"
                title={layer.visible ? 'Hide Layer' : 'Show Layer'}
              >
                {layer.visible ? (
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-neutral-600" />
                )}
              </button>

              {/* Layer Mini Thumbnail */}
              <div 
                className="w-5 h-5 rounded border border-neutral-700 bg-neutral-950 overflow-hidden shrink-0 canvas-checkerboard-sm flex items-center justify-center"
              >
                <div 
                  className="w-full h-full"
                  style={{
                    opacity: layer.opacity,
                    backgroundColor: layer.pixels.some(p => p !== '') ? undefined : 'transparent'
                  }}
                />
              </div>

              {/* Name or Rename input */}
              <div className="flex-1 min-w-0">
                {editingLayerId === layer.id ? (
                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && saveRename(layer.id)}
                      autoFocus
                      className="bg-neutral-800 text-neutral-100 text-xs px-1.5 py-0.5 rounded border border-amber-500 outline-none w-full"
                    />
                    <button
                      onClick={() => saveRename(layer.id)}
                      className="p-0.5 hover:text-amber-400"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="truncate font-medium">{layer.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startRename(layer);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-white text-neutral-500"
                      title="Rename"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Lock Toggle */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleLock(layer.id);
                }}
                className="p-1 hover:bg-neutral-700/50 rounded text-neutral-400 hover:text-white"
                title={layer.locked ? 'Unlock Layer' : 'Lock Layer'}
              >
                {layer.locked ? (
                  <Lock className="w-3 h-3 text-red-400" />
                ) : (
                  <Unlock className="w-3 h-3 text-neutral-600 group-hover:text-neutral-400" />
                )}
              </button>

              {/* Layer Reorder */}
              <div className="flex flex-col gap-0.5 opacity-60 group-hover:opacity-100">
                <button
                  type="button"
                  disabled={actualIndex >= layers.length - 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveLayer(layer.id, 'up');
                  }}
                  className="hover:text-white disabled:opacity-20"
                  title="Move Up"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  disabled={actualIndex <= 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveLayer(layer.id, 'down');
                  }}
                  className="hover:text-white disabled:opacity-20"
                  title="Move Down"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Layer Opacity Slider */}
      {activeLayer && (
        <div className="px-3 py-2 border-t border-neutral-800 bg-neutral-950/40 flex items-center justify-between gap-2 text-xs">
          <span className="text-neutral-400 text-[11px] shrink-0">Opacity</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={activeLayer.opacity}
            onChange={(e) => onChangeOpacity(activeLayer.id, parseFloat(e.target.value))}
            className="w-full accent-amber-500 h-1 bg-neutral-800 rounded-lg cursor-pointer"
          />
          <span className="font-mono text-[11px] text-neutral-300 w-8 text-right">
            {Math.round(activeLayer.opacity * 100)}%
          </span>
        </div>
      )}
    </div>
  );
};
