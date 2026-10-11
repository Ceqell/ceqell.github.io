import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Keyboard, 
  X, 
  Search, 
  RotateCcw, 
  AlertCircle, 
  Check, 
  Pencil, 
  Eraser, 
  PaintBucket, 
  Pipette, 
  Minus, 
  Square, 
  Circle, 
  BoxSelect, 
  LassoSelect, 
  SunMedium, 
  Moon, 
  Sparkles, 
  Grid, 
  SplitSquareVertical, 
  Hash, 
  ZoomIn, 
  ZoomOut, 
  Undo2, 
  Redo2, 
  BookOpen, 
  Package, 
  HelpCircle,
  CornerDownLeft,
  Layers as LayersIcon,
  Trash2,
  Copy,
  FolderOpen,
  Download,
  User,
  Maximize2,
  Info,
  FlipHorizontal,
  FlipVertical,
  AlignCenter,
  Sliders
} from 'lucide-react';
import { 
  SHORTCUT_DEFINITIONS, 
  saveKeybindings, 
  resetKeybindingsToDefaults, 
  formatKeyEvent 
} from '../utils/keybindings';
import { ShortcutActionId, KeybindingsMap, ShortcutCategory } from '../types/keybindings';

interface KeybindingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  keybindings: KeybindingsMap;
  onUpdateKeybindings: (newBindings: KeybindingsMap) => void;
}

// Icon mapper for actions
const getActionIcon = (actionId: ShortcutActionId) => {
  switch (actionId) {
    case 'tool_pencil': return Pencil;
    case 'tool_eraser': return Eraser;
    case 'tool_bucket': return PaintBucket;
    case 'tool_eyedropper': return Pipette;
    case 'tool_line': return Minus;
    case 'tool_rectangle':
    case 'tool_rectangle_fill': return Square;
    case 'tool_circle':
    case 'tool_circle_fill': return Circle;
    case 'tool_select': return BoxSelect;
    case 'tool_lasso': return LassoSelect;
    case 'tool_lighten': return SunMedium;
    case 'tool_darken': return Moon;
    case 'tool_replace': return Sparkles;
    case 'toggle_grid': return Grid;
    case 'toggle_guides': return HelpCircle;
    case 'toggle_numbers': return Hash;
    case 'toggle_symmetry': return SplitSquareVertical;
    case 'zoom_in': return ZoomIn;
    case 'zoom_out': return ZoomOut;
    case 'zoom_reset': return RotateCcw;
    case 'undo': return Undo2;
    case 'redo': return Redo2;
    case 'brush_decrease': return Minus;
    case 'brush_increase': return Sliders;
    case 'open_help': return BookOpen;
    case 'open_assets': return Package;
    case 'open_shortcuts': return Keyboard;
    case 'open_dimensions': return HelpCircle;
    case 'open_projects': return FolderOpen;
    case 'open_export': return Download;
    case 'open_starters': return User;
    case 'open_custom_canvas': return Maximize2;
    case 'open_about': return Info;
    case 'stamp_selection': return CornerDownLeft;
    case 'clear_selection': return X;
    case 'delete_selection': return Trash2;
    case 'flip_selection_h': return FlipHorizontal;
    case 'flip_selection_v': return FlipVertical;
    case 'select_all': return BoxSelect;
    case 'layer_new': return LayersIcon;
    case 'layer_delete': return Trash2;
    case 'layer_duplicate': return Copy;
    case 'layer_merge_down': return LayersIcon;
    case 'layer_flip_h': return FlipHorizontal;
    case 'layer_flip_v': return FlipVertical;
    case 'layer_center': return AlignCenter;
    case 'layer_clear': return Eraser;
    default: return Keyboard;
  }
};

export const KeybindingsModal: React.FC<KeybindingsModalProps> = ({
  isOpen,
  onClose,
  keybindings,
  onUpdateKeybindings,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ShortcutCategory | 'All'>('All');
  const [recordingActionId, setRecordingActionId] = useState<ShortcutActionId | null>(null);
  const [conflictNotice, setConflictNotice] = useState<string | null>(null);

  const conflictTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Close modal on Escape if not currently recording a key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (recordingActionId) {
        e.preventDefault();
        e.stopPropagation();

        if (e.key === 'Escape') {
          setRecordingActionId(null);
          return;
        }

        const newKey = formatKeyEvent(e);
        if (!newKey) return; // Modifier pressed alone, wait for main key

        // Check if another action already used this exact key
        const conflictingAction = SHORTCUT_DEFINITIONS.find(
          def => def.id !== recordingActionId && keybindings[def.id]?.toLowerCase() === newKey.toLowerCase()
        );

        const updated: KeybindingsMap = { ...keybindings, [recordingActionId]: newKey };

        if (conflictingAction) {
          // Clear conflict from old action to avoid duplicate executions
          updated[conflictingAction.id] = '';
          setConflictNotice(`"${newKey}" was previously bound to ${conflictingAction.label} (unbound).`);
          if (conflictTimerRef.current) clearTimeout(conflictTimerRef.current);
          conflictTimerRef.current = setTimeout(() => setConflictNotice(null), 4000);
        } else {
          setConflictNotice(null);
        }

        onUpdateKeybindings(updated);
        saveKeybindings(updated);
        setRecordingActionId(null);
        return;
      }

      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, recordingActionId, keybindings, onUpdateKeybindings, onClose]);

  // Filter actions by category and search term
  const filteredActions = useMemo(() => {
    return SHORTCUT_DEFINITIONS.filter(def => {
      const matchesCat = selectedCategory === 'All' || def.category === selectedCategory;
      const currentKey = keybindings[def.id] || '';
      const matchesSearch = 
        searchQuery === '' ||
        def.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        def.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        currentKey.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery, keybindings]);

  // Categories list
  const categories: (ShortcutCategory | 'All')[] = [
    'All',
    'Tools',
    'Canvas & Overlays',
    'Selection',
    'Layers',
    'History',
    'Brushes',
    'Panels & Windows',
  ];

  // Reset single action to its default
  const handleResetSingle = (def: typeof SHORTCUT_DEFINITIONS[0]) => {
    const updated = { ...keybindings, [def.id]: def.defaultKey };
    onUpdateKeybindings(updated);
    saveKeybindings(updated);
  };

  // Reset all to defaults
  const handleResetAll = () => {
    const defaults = resetKeybindingsToDefaults();
    onUpdateKeybindings(defaults);
    setConflictNotice('All keyboard shortcuts have been reset to factory defaults.');
    if (conflictTimerRef.current) clearTimeout(conflictTimerRef.current);
    conflictTimerRef.current = setTimeout(() => setConflictNotice(null), 3000);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none"
      onClick={() => {
        if (!recordingActionId) onClose();
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-theme border border-ui-theme rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh] text-primary-theme transition-colors select-none"
      >
        {/* Title Bar with Retro Chrome styling */}
        <div className="flex items-center justify-between px-4 py-3 bg-surface-raised-theme border-b border-ui-theme shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 retro-inset-well rounded-lg text-primary-theme">
              <Keyboard className="w-5 h-5" style={{ color: 'var(--text-accent)' }} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-primary-theme flex items-center gap-2">
                Keyboard Shortcuts Remapper
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded retro-inset-well" style={{ color: 'var(--text-accent)' }}>
                  Configurable
                </span>
              </h2>
              <p className="text-[11px] text-secondary-theme">
                Click any key badge to record a new key. Settings are saved to your browser.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="retro-chrome-btn p-1.5 rounded-lg text-primary-theme cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Search input, Category pills & Reset button */}
        <div className="px-4 py-2.5 bg-surface-theme border-b border-ui-theme flex flex-wrap items-center justify-between gap-2 shrink-0">
          {/* Search box */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-secondary-theme pointer-events-none" />
            <input
              type="text"
              placeholder="Search actions or keys..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-raised-theme border border-ui-theme rounded-lg pl-8 pr-3 py-1 text-xs text-primary-theme placeholder-secondary-theme focus:outline-none focus:border-[var(--text-accent)] transition-colors"
            />
          </div>

          {/* Reset All Button */}
          <button
            onClick={handleResetAll}
            className="retro-chrome-btn px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer text-secondary-theme hover:text-primary-theme transition-all"
            title="Reset all shortcuts to defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="px-4 py-1.5 bg-surface-raised-theme border-b border-ui-theme flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {categories.map(cat => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`retro-chrome-btn px-2.5 py-0.5 text-[11px] font-semibold rounded-md transition-all whitespace-nowrap cursor-pointer ${
                  isActive ? 'active font-bold' : 'text-secondary-theme hover:text-primary-theme'
                }`}
                style={isActive ? { color: 'var(--text-accent)' } : undefined}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Conflict Notice Toast */}
        {conflictNotice && (
          <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-amber-400 text-xs flex items-center gap-2 shrink-0 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span className="flex-1 font-medium">{conflictNotice}</span>
            <button
              onClick={() => setConflictNotice(null)}
              className="p-1 hover:text-amber-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Action List Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 select-none">
          {filteredActions.length === 0 ? (
            <div className="p-8 text-center text-secondary-theme text-xs flex flex-col items-center justify-center gap-2">
              <AlertCircle className="w-6 h-6 opacity-40" />
              <span>No actions found matching "{searchQuery}"</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {filteredActions.map(def => {
                const Icon = getActionIcon(def.id);
                const currentKey = keybindings[def.id] || '';
                const isRecording = recordingActionId === def.id;
                const isModified = currentKey !== def.defaultKey;

                return (
                  <div
                    key={def.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      isRecording
                        ? 'border-amber-400 bg-amber-500/10 ring-2 ring-amber-400/30'
                        : 'border-ui-theme bg-surface-raised-theme hover:border-[var(--text-accent)]'
                    }`}
                  >
                    {/* Action Icon & Info */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-3">
                      <div className="p-1.5 retro-inset-well rounded-lg shrink-0 text-primary-theme">
                        <Icon className="w-4 h-4" style={{ color: 'var(--text-accent)' }} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-primary-theme truncate">
                          {def.label}
                        </div>
                        <div className="text-[10px] text-secondary-theme truncate">
                          {def.description}
                        </div>
                      </div>
                    </div>

                    {/* Key Button / Recording Trigger */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isRecording ? (
                        <div className="px-2.5 py-1 rounded-lg bg-amber-500 text-black text-xs font-mono font-bold animate-pulse shadow-md">
                          Press Key...
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setRecordingActionId(def.id)}
                          title="Click to record new shortcut key"
                          className={`retro-chrome-btn px-2.5 py-1 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                            currentKey
                              ? isModified
                                ? 'text-[var(--text-accent)] font-extrabold border-[var(--text-accent)]'
                                : 'text-primary-theme'
                              : 'text-secondary-theme italic border-dashed'
                          }`}
                        >
                          {currentKey || 'None'}
                        </button>
                      )}

                      {/* Reset Single Key to Default Button */}
                      {isModified && !isRecording && (
                        <button
                          type="button"
                          onClick={() => handleResetSingle(def)}
                          title={`Reset to default (${def.defaultKey})`}
                          className="retro-chrome-btn p-1 rounded-md text-secondary-theme hover:text-primary-theme cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-3 bg-surface-raised-theme border-t border-ui-theme flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-secondary-theme flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Shortcuts apply dynamically to all workspace tools and menus.</span>
          </div>

          <button
            onClick={onClose}
            className="retro-blue-btn px-4 py-1.5 text-xs font-bold rounded-lg text-white cursor-pointer shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
