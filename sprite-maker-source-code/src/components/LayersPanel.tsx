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
import { CollapsibleSection } from './CollapsibleSection';

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
    <CollapsibleSection
      id="layers"
      title="Layers"
      icon={<LayersIcon className="w-3.5 h-3.5" style={{ color: 'var(--text-accent)' }} />}
      badge={<span className="text-[10px] text-secondary-theme font-mono">({layers.length})</span>}
      defaultOpen={true}
      headerActions={
        <div className="flex items-center gap-1">
          <button
            onClick={onAddLayer}
            title="New Layer"
            className="retro-chrome-btn p-1 rounded text-primary-theme cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDuplicateLayer(activeLayerId)}
            title="Duplicate Active Layer"
            className="retro-chrome-btn p-1 rounded text-primary-theme cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onMergeDownLayer(activeLayerId)}
            disabled={activeIndex <= 0}
            title="Merge Down"
            className="retro-chrome-btn p-1 rounded text-primary-theme disabled:opacity-25 disabled:pointer-events-none cursor-pointer"
          >
            <Combine className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDeleteLayer(activeLayerId)}
            disabled={layers.length <= 1}
            title="Delete Layer"
            className="retro-chrome-btn p-1 rounded text-red-500 hover:text-red-600 disabled:opacity-25 disabled:pointer-events-none cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      }
    >
      {/* Layer List (stacked top layer first, so reversed array) */}
      <div className="max-h-[260px] overflow-y-auto p-1.5 space-y-1 overscroll-contain">
        {[...layers].reverse().map((layer, index) => {
          const actualIndex = layers.length - 1 - index;
          const isActive = layer.id === activeLayerId;

          return (
            <div
              key={layer.id}
              onClick={() => onSelectLayer(layer.id)}
              className={`group flex items-center gap-2 px-2 py-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
                isActive
                  ? 'bg-surface-raised-theme border-[var(--text-accent)] text-primary-theme shadow-sm font-semibold'
                  : 'bg-surface-theme border-ui-theme hover:bg-surface-raised-theme text-secondary-theme'
              }`}
            >
              {/* Visibility Toggle */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleVisibility(layer.id);
                }}
                className="p-1 rounded text-secondary-theme hover:text-primary-theme"
                title={layer.visible ? 'Hide Layer' : 'Show Layer'}
              >
                {layer.visible ? (
                  <Eye className="w-3.5 h-3.5" style={{ color: 'var(--text-accent)' }} />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 opacity-40" />
                )}
              </button>

              {/* Layer Mini Thumbnail */}
              <div 
                className="w-5 h-5 rounded border border-ui-theme bg-surface-raised-theme overflow-hidden shrink-0 canvas-checkerboard-sm flex items-center justify-center"
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
                      className="bg-surface-raised-theme text-primary-theme text-xs px-1.5 py-0.5 rounded border border-[var(--text-accent)] outline-none w-full"
                    />
                    <button
                      onClick={() => saveRename(layer.id)}
                      className="p-0.5 hover:text-primary-theme cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="truncate">{layer.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startRename(layer);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-secondary-theme hover:text-primary-theme cursor-pointer"
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
                className="p-1 rounded text-secondary-theme hover:text-primary-theme"
                title={layer.locked ? 'Unlock Layer' : 'Lock Layer'}
              >
                {layer.locked ? (
                  <Lock className="w-3 h-3 text-red-500" />
                ) : (
                  <Unlock className="w-3 h-3 opacity-30 group-hover:opacity-80" />
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
                  className="hover:text-primary-theme disabled:opacity-20 cursor-pointer"
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
                  className="hover:text-primary-theme disabled:opacity-20 cursor-pointer"
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
        <div className="px-3 py-2 border-t border-ui-theme bg-surface-raised-theme flex items-center justify-between gap-2 text-xs">
          <span className="text-secondary-theme text-[11px] shrink-0 font-medium">Opacity</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={activeLayer.opacity}
            onChange={(e) => onChangeOpacity(activeLayer.id, parseFloat(e.target.value))}
            className="w-full h-1.5 retro-inset-track rounded-lg cursor-pointer"
            style={{ accentColor: 'var(--text-accent)' }}
          />
          <span className="font-mono text-[11px] text-primary-theme w-8 text-right font-semibold">
            {Math.round(activeLayer.opacity * 100)}%
          </span>
        </div>
      )}
    </CollapsibleSection>
  );
};
