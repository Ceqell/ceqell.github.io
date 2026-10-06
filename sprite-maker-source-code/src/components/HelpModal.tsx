import React, { useState } from 'react';
import { 
  X, 
  HelpCircle, 
  Pencil, 
  PaintBucket, 
  Pipette, 
  Eraser, 
  Scissors, 
  LassoSelect, 
  Sparkles, 
  SunMedium, 
  Moon, 
  Square, 
  Circle, 
  Minus, 
  Move, 
  FlipHorizontal, 
  FlipVertical, 
  Check, 
  Trash2, 
  Layers as LayersIcon, 
  Image as ImageIcon, 
  Grid, 
  Hash, 
  SplitSquareVertical, 
  Undo2, 
  Redo2, 
  Download, 
  Save, 
  FolderOpen, 
  BookOpen, 
  Keyboard, 
  Info, 
  Sliders, 
  CheckCircle2,
  Maximize2,
  Search
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: HelpTabId;
}

export type HelpTabId = 'overview' | 'tools' | 'selection' | 'guides' | 'layers-refs' | 'shortcuts';

interface TabDefinition {
  id: HelpTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: TabDefinition[] = [
  { id: 'overview', label: 'Overview', icon: BookOpen },
  { id: 'tools', label: 'Drawing Tools', icon: Pencil },
  { id: 'selection', label: 'Selection & Transform', icon: Scissors },
  { id: 'guides', label: 'Guides & Dimensions', icon: Hash },
  { id: 'layers-refs', label: 'Layers & References', icon: LayersIcon },
  { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: Keyboard },
];

export const HelpModal: React.FC<HelpModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'overview',
}) => {
  const [activeTab, setActiveTab] = useState<HelpTabId>(initialTab);
  const [shortcutSearch, setShortcutSearch] = useState('');

  if (!isOpen) return null;

  const shortcutsList = [
    { key: 'P', action: 'Pencil Tool', category: 'Tools' },
    { key: 'E', action: 'Eraser Tool', category: 'Tools' },
    { key: 'B', action: 'Bucket Fill Tool', category: 'Tools' },
    { key: 'I', action: 'Eyedropper Tool', category: 'Tools' },
    { key: 'L', action: 'Line Tool', category: 'Tools' },
    { key: 'U', action: 'Rectangle Tool', category: 'Tools' },
    { key: 'C', action: 'Circle Tool', category: 'Tools' },
    { key: 'M', action: 'Box Select Tool', category: 'Selection' },
    { key: 'Q', action: 'Freehand Lasso Select Tool', category: 'Selection' },
    { key: '[', action: 'Decrease Brush Size', category: 'Brushes' },
    { key: ']', action: 'Increase Brush Size', category: 'Brushes' },
    { key: 'G', action: 'Toggle Pixel Grid', category: 'Canvas' },
    { key: 'H', action: 'Toggle Retro Dev Body Guides', category: 'Canvas' },
    { key: 'N', action: 'Toggle Row & Column Number Headers', category: 'Canvas' },
    { key: 'S', action: 'Toggle Vertical Mirror / Symmetry Mode', category: 'Canvas' },
    { key: 'Alt + Drag', action: 'Drag & Move Character Body Guides anywhere on Canvas', category: 'Guides' },
    { key: 'Space + Drag', action: 'Pan Canvas (Middle-Click Drag also pans)', category: 'Canvas' },
    { key: 'Ctrl + Z / ⌘Z', action: 'Undo last stroke, layer action, or resize', category: 'History' },
    { key: 'Ctrl + Y / Ctrl+Shift+Z', action: 'Redo undone action', category: 'History' },
    { key: 'Arrow Keys', action: 'Nudge floating selection 1 pixel (Left/Right/Up/Down)', category: 'Selection' },
    { key: 'Enter', action: 'Stamp / Commit floating selection back to active layer', category: 'Selection' },
    { key: 'Escape', action: 'Clear / Cancel active selection or dismiss dialogs', category: 'Selection' },
    { key: 'Delete / Backspace', action: 'Delete all selected pixels in active selection', category: 'Selection' },
    { key: '?', action: 'Open this Help & Documentation Manual', category: 'General' },
  ];

  const filteredShortcuts = shortcutsList.filter(s => 
    s.key.toLowerCase().includes(shortcutSearch.toLowerCase()) ||
    s.action.toLowerCase().includes(shortcutSearch.toLowerCase()) ||
    s.category.toLowerCase().includes(shortcutSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-700/80 rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[92vh] text-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800 bg-neutral-950/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>FigurayMaker Manual & Guide</span>
                <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Docs
                </span>
              </h2>
              <p className="text-[11px] text-neutral-400">
                Complete guide to drawing, body guides, shortcuts, layers, and references
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Close Manual (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 py-2 bg-neutral-950 border-b border-neutral-800 shrink-0 overflow-x-auto header-scrollbar">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/20'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-neutral-300 text-xs leading-relaxed">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-xl space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-400 text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>Welcome to FigurayMaker</span>
                </div>
                <p className="text-neutral-300 text-xs leading-relaxed">
                  <strong>FigurayMaker</strong> is a precision pixel art creation studio designed specifically for authoring authentic 
                  <strong> Retro Dev</strong> character sprites and avatars. It combines traditional pixel editing tools with official proportional 
                  body guides, real-time avatar previews, multi-layer compositing, and reference image tracing.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-white text-xs">
                    <div className="p-1 bg-amber-500/20 text-amber-400 rounded">1</div>
                    <span>Proportional Guides</span>
                  </div>
                  <p className="text-neutral-400 text-[11px] leading-relaxed">
                    Designed around the standard Retro Dev body spec (Head 9×8, Torso 11×10, Arms 5×10, Legs 11×10). Guides can be dragged anywhere using <code className="text-amber-300 font-mono">Alt + Drag</code>.
                  </p>
                </div>

                <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-white text-xs">
                    <div className="p-1 bg-cyan-500/20 text-cyan-400 rounded">2</div>
                    <span>Multi-Layer Workflow</span>
                  </div>
                  <p className="text-neutral-400 text-[11px] leading-relaxed">
                    Separate your character into independent layers: Base Skin, Hair, Clothing, Outlines, and Accessories. Reorder, hide, lock, adjust opacity, and merge layers down.
                  </p>
                </div>

                <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-white text-xs">
                    <div className="p-1 bg-pink-500/20 text-pink-400 rounded">3</div>
                    <span>Export & Formats</span>
                  </div>
                  <p className="text-neutral-400 text-[11px] leading-relaxed">
                    Export high-res upscaled PNGs (1x to 32x), SVG vectors, sprite sheet grids, animated turnaround GIFs, JSON project files, and raw data arrays for game engines.
                  </p>
                </div>
              </div>

              {/* Core Workflow Tips */}
              <div className="border border-neutral-800 rounded-xl bg-neutral-950/60 p-4 space-y-3">
                <h3 className="font-bold text-white text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Recommended Creation Workflow</span>
                </h3>
                <ol className="list-decimal list-inside space-y-1.5 text-neutral-300 text-xs pl-1">
                  <li><strong>Select a Canvas Preset</strong>: Start with default 21×28 or 24×32, or create custom dimensions via the header dropdown.</li>
                  <li><strong>Sketch the Head & Body</strong>: Turn on the body guides (<code className="text-amber-300 font-mono">H</code>) to match the official head, torso, arm, and leg boundaries.</li>
                  <li><strong>Enable Mirroring</strong>: Press <code className="text-cyan-300 font-mono">S</code> for symmetrical bodies and faces to paint both left and right sides simultaneously.</li>
                  <li><strong>Use Shading Tools</strong>: Use Lighten (<code className="text-amber-300 font-mono">Dodge</code>) and Darken (<code className="text-amber-300 font-mono">Burn</code>) to add depth, highlights, and shadow gradients.</li>
                  <li><strong>Import References</strong>: Add reference photos or character sheets in the References panel to trace or sample color palettes directly.</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 2: DRAWING TOOLS */}
          {activeTab === 'tools' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <p className="text-neutral-400 text-xs">
                FigurayMaker provides 14 dedicated drawing and editing tools accessible from the left toolbar or via keyboard shortcuts:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-start gap-3">
                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg shrink-0 mt-0.5">
                    <Pencil className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs flex items-center gap-1.5">
                      <span>Pencil</span>
                      <span className="font-mono text-[10px] text-amber-400">(P)</span>
                    </div>
                    <p className="text-neutral-400 text-[11px] mt-0.5">
                      Standard pixel drawing pen. Click or drag to draw pixels. Supports brush sizes from 1px to 32px using the size buttons or <code className="text-neutral-200 font-mono">[</code> and <code className="text-neutral-200 font-mono">]</code>.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-start gap-3">
                  <div className="p-2 bg-red-500/10 text-red-400 rounded-lg shrink-0 mt-0.5">
                    <Eraser className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs flex items-center gap-1.5">
                      <span>Eraser</span>
                      <span className="font-mono text-[10px] text-red-400">(E)</span>
                    </div>
                    <p className="text-neutral-400 text-[11px] mt-0.5">
                      Clears pixels to transparent on the active layer. Does not erase pixels on other layers.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-start gap-3">
                  <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg shrink-0 mt-0.5">
                    <PaintBucket className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs flex items-center gap-1.5">
                      <span>Bucket Fill</span>
                      <span className="font-mono text-[10px] text-blue-400">(B)</span>
                    </div>
                    <p className="text-neutral-400 text-[11px] mt-0.5">
                      Flood-fills contiguous pixels of the same color or empty space with the currently selected color.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-start gap-3">
                  <div className="p-2 bg-yellow-500/10 text-yellow-400 rounded-lg shrink-0 mt-0.5">
                    <Pipette className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs flex items-center gap-1.5">
                      <span>Eyedropper</span>
                      <span className="font-mono text-[10px] text-yellow-400">(I)</span>
                    </div>
                    <p className="text-neutral-400 text-[11px] mt-0.5">
                      Sample any color from visible layers on the canvas. Automatically switches back to your pen once a color is chosen.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-start gap-3">
                  <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg shrink-0 mt-0.5">
                    <Minus className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs flex items-center gap-1.5">
                      <span>Line</span>
                      <span className="font-mono text-[10px] text-purple-400">(L)</span>
                    </div>
                    <p className="text-neutral-400 text-[11px] mt-0.5">
                      Draws clean straight lines using Bresenham's pixel algorithm. Click and drag to position.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-start gap-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0 mt-0.5">
                    <Square className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs flex items-center gap-1.5">
                      <span>Rectangle & Filled Box</span>
                      <span className="font-mono text-[10px] text-emerald-400">(U)</span>
                    </div>
                    <p className="text-neutral-400 text-[11px] mt-0.5">
                      Draws hollow pixel box outlines or solid filled rectangles. Drag to set dimensions.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-start gap-3">
                  <div className="p-2 bg-teal-500/10 text-teal-400 rounded-lg shrink-0 mt-0.5">
                    <Circle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs flex items-center gap-1.5">
                      <span>Circle & Filled Circle</span>
                      <span className="font-mono text-[10px] text-teal-400">(C)</span>
                    </div>
                    <p className="text-neutral-400 text-[11px] mt-0.5">
                      Draws hollow pixel circles or solid filled ellipses. Drag from corner to opposite corner.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-start gap-3">
                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg shrink-0 mt-0.5">
                    <SunMedium className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">Lighten (Dodge) & Darken (Burn)</div>
                    <p className="text-neutral-400 text-[11px] mt-0.5">
                      Click existing pixels to progressively lighten or darken their shading without needing to change your color palette.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-start gap-3 md:col-span-2">
                  <div className="p-2 bg-pink-500/10 text-pink-400 rounded-lg shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">Color Replace</div>
                    <p className="text-neutral-400 text-[11px] mt-0.5">
                      Click any pixel to replace all matching occurrences of that color across the entire active layer with the currently selected color in a single click.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SELECTION & TRANSFORM */}
          {activeTab === 'selection' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
                <div className="font-bold text-white text-xs flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-amber-400" />
                  <span>How Selection & Pixel Manipulation Works</span>
                </div>
                <p className="text-neutral-400 text-[11px]">
                  Selections allow you to cut, move, transform, and delete regions of pixels on the active layer without affecting other layers.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-neutral-950/80 rounded-xl border border-neutral-800 flex items-start gap-3">
                  <div className="p-2 bg-neutral-800 text-amber-400 rounded-lg shrink-0">
                    <Scissors className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">Box Select <span className="font-mono text-amber-400">(M)</span> & Freehand Lasso <span className="font-mono text-amber-400">(Q)</span></div>
                    <p className="text-neutral-400 text-[11px] mt-1">
                      Drag a rectangular marquee or draw any custom freehand lasso outline around pixels you wish to isolate.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-neutral-950/80 rounded-xl border border-neutral-800 flex items-start gap-3">
                  <div className="p-2 bg-neutral-800 text-cyan-400 rounded-lg shrink-0">
                    <Move className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">Moving & Floating Pixels</div>
                    <p className="text-neutral-400 text-[11px] mt-1">
                      Click and drag inside any active selection to "lift" the pixels into a floating state. You can also use the 
                      <strong className="text-white"> Arrow Keys</strong> (<code className="text-cyan-300 font-mono">↑ ↓ ← →</code>) to nudge floating pixels by exact 1-pixel increments.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-neutral-950/80 rounded-xl border border-neutral-800 flex items-start gap-3">
                  <div className="p-2 bg-neutral-800 text-emerald-400 rounded-lg shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">Stamping & Committing <span className="font-mono text-emerald-400">(Enter)</span></div>
                    <p className="text-neutral-400 text-[11px] mt-1">
                      Once you have positioned your floating pixels, press <code className="text-emerald-300 font-mono">Enter</code> or click the green 
                      <strong> Stamp</strong> button in the left toolbar to bake the pixels back into the active layer.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-neutral-950/80 rounded-xl border border-neutral-800 flex items-start gap-3">
                  <div className="p-2 bg-neutral-800 text-pink-400 rounded-lg shrink-0">
                    <FlipHorizontal className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">Horizontal & Vertical Flipping</div>
                    <p className="text-neutral-400 text-[11px] mt-1">
                      Use the flip buttons in the toolbar while a selection is active to mirror the selected sprite segment (perfect for flipping weapons, arms, or eyes).
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-neutral-950/80 rounded-xl border border-neutral-800 flex items-start gap-3">
                  <div className="p-2 bg-neutral-800 text-red-400 rounded-lg shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">Deleting Selected Pixels <span className="font-mono text-red-400">(Delete / Backspace)</span></div>
                    <p className="text-neutral-400 text-[11px] mt-1">
                      Press <code className="text-red-300 font-mono">Delete</code> or <code className="text-red-300 font-mono">Backspace</code> to erase all pixels inside the active selection. Press <code className="text-neutral-200 font-mono">Esc</code> to deselect.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GUIDES & DIMENSIONS */}
          {activeTab === 'guides' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1.5">
                <div className="font-bold text-amber-400 text-xs">Official Retro Dev Specification</div>
                <p className="italic text-neutral-300 text-[11px]">
                  "The process of making a character sprite's body parts are very easy. 
                  The legs and torso are 11x10 pixels, the arms are 5x10 and the head is 9x8. 
                  After you are done with the body, design on the accessories begins."
                </p>
              </div>

              {/* Dimension Breakdown Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                <div className="p-3 bg-neutral-950 rounded-xl border border-yellow-500/30">
                  <div className="text-[10px] uppercase font-mono font-bold text-yellow-400">Head</div>
                  <div className="text-lg font-bold font-mono text-white mt-0.5">9 × 8</div>
                  <div className="text-[10px] text-neutral-400 mt-1 leading-snug">
                    Round contour (3px top, 7px row 2, 9px center, 7px bottom, 5px neck).
                  </div>
                </div>

                <div className="p-3 bg-neutral-950 rounded-xl border border-cyan-500/30">
                  <div className="text-[10px] uppercase font-mono font-bold text-cyan-400">Torso</div>
                  <div className="text-lg font-bold font-mono text-white mt-0.5">11 × 10</div>
                  <div className="text-[10px] text-neutral-400 mt-1 leading-snug">
                    Main upper body block (aligned between arms).
                  </div>
                </div>

                <div className="p-3 bg-neutral-950 rounded-xl border border-yellow-500/30">
                  <div className="text-[10px] uppercase font-mono font-bold text-yellow-400">Arms (L / R)</div>
                  <div className="text-lg font-bold font-mono text-white mt-0.5">5 × 10 each</div>
                  <div className="text-[10px] text-neutral-400 mt-1 leading-snug">
                    Flank torso on left and right, top-aligned with shoulders.
                  </div>
                </div>

                <div className="p-3 bg-neutral-950 rounded-xl border border-cyan-500/30">
                  <div className="text-[10px] uppercase font-mono font-bold text-cyan-400">Legs</div>
                  <div className="text-lg font-bold font-mono text-white mt-0.5">11 × 10</div>
                  <div className="text-[10px] text-neutral-400 mt-1 leading-snug">
                    Lower body block (can be split into two 5px legs with 1px gap).
                  </div>
                </div>
              </div>

              {/* Moving Guides Instruction Box */}
              <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
                <div className="font-bold text-white text-xs flex items-center gap-2">
                  <Move className="w-4 h-4 text-amber-400" />
                  <span>How to Move & Reposition Body Guides</span>
                </div>
                <div className="space-y-1.5 text-neutral-300 text-xs">
                  <p>
                    Body guides are not locked in place! You can reposition them anywhere on the canvas:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-neutral-400 text-[11px] pl-1">
                    <li>
                      <strong className="text-white">Hold Alt and Drag on Canvas</strong>: While holding <code className="text-amber-300 font-mono">Alt</code>, click anywhere over the body guides and drag to slide them freely.
                    </li>
                    <li>
                      <strong className="text-white">Move Guide Button (Top Bar)</strong>: Click the <code className="text-amber-300 font-mono">Guide</code> icon in the header to toggle guide-moving mode, drag the guides, and click again when done.
                    </li>
                    <li>
                      <strong className="text-white">Center Guide</strong>: Click the <code className="text-neutral-200 font-mono">Center</code> button next to the guide controls in the header to instantly snap the guide back to the canvas center.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Symmetry */}
              <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
                <div className="font-bold text-white text-xs flex items-center gap-2">
                  <SplitSquareVertical className="w-4 h-4 text-cyan-400" />
                  <span>Vertical Symmetry / Mirror Mode (S)</span>
                </div>
                <p className="text-neutral-400 text-[11px]">
                  Press <code className="text-cyan-300 font-mono">S</code> to activate symmetry mode. A dashed vertical axis line appears down the center of the canvas. Every pixel drawn, erased, or shaded on one side is automatically reflected on the opposite side in real time.
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: LAYERS & REFERENCES */}
          {activeTab === 'layers-refs' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Layers Section */}
              <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
                <div className="font-bold text-white text-xs flex items-center gap-2">
                  <LayersIcon className="w-4 h-4 text-amber-400" />
                  <span>Layers Panel Workflow</span>
                </div>
                <p className="text-neutral-400 text-[11px]">
                  Layers stack on top of each other from bottom to top. Working with multiple layers allows you to paint clothing and accessories over body outlines without damaging previous work.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className="p-2 bg-neutral-900 rounded-lg">
                    <span className="font-bold text-white">Add & Duplicate:</span> Create fresh empty layers or clone your active layer to test alternative colors.
                  </div>
                  <div className="p-2 bg-neutral-900 rounded-lg">
                    <span className="font-bold text-white">Merge Down:</span> Flattens the active layer into the layer immediately below it.
                  </div>
                  <div className="p-2 bg-neutral-900 rounded-lg">
                    <span className="font-bold text-white">Lock Layer:</span> Prevents accidental edits, bucket fills, or erasing on protected layers.
                  </div>
                  <div className="p-2 bg-neutral-900 rounded-lg">
                    <span className="font-bold text-white">Opacity Slider:</span> Fade out reference outlines or sketch layers while detailing the final sprite.
                  </div>
                </div>
              </div>

              {/* References Section */}
              <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
                <div className="font-bold text-white text-xs flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-pink-400" />
                  <span>Reference Images & Tracing</span>
                </div>
                <p className="text-neutral-400 text-[11px]">
                  Import your own PNGs, JPEGs, or WebP images using the References panel. FigurayMaker offers two ways to use reference images:
                </p>

                <div className="space-y-2 text-[11px]">
                  <div className="p-2.5 bg-neutral-900 rounded-lg border border-neutral-800">
                    <div className="font-bold text-pink-300">1. Floating Reference Window (Popout)</div>
                    <p className="text-neutral-400 mt-0.5">
                      Open a movable popout window displaying your image. You can zoom in and out, and click anywhere directly on the reference image to <strong>eyedrop and sample its colors</strong> into your active palette!
                    </p>
                  </div>

                  <div className="p-2.5 bg-neutral-900 rounded-lg border border-neutral-800">
                    <div className="font-bold text-amber-300">2. In-Canvas Tracing Overlay Mode</div>
                    <p className="text-neutral-400 mt-0.5">
                      Toggle <strong>Trace Mode</strong> to project your reference image directly underneath or over your pixel drawing canvas with custom opacity (e.g. 45%), scale, and X/Y offset sliders. Trace pixel-by-pixel over reference sketches with ease.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: KEYBOARD SHORTCUTS */}
          {activeTab === 'shortcuts' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter keyboard shortcuts (e.g. pencil, select, alt, zoom)..."
                  value={shortcutSearch}
                  onChange={e => setShortcutSearch(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400/60"
                />
              </div>

              {/* Shortcuts Table */}
              <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-950">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-900/80 border-b border-neutral-800 text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                    <tr>
                      <th className="px-4 py-2 w-44">Shortcut Key</th>
                      <th className="px-4 py-2">Action</th>
                      <th className="px-4 py-2 w-28 text-right">Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 font-mono text-[11px]">
                    {filteredShortcuts.map((s, idx) => (
                      <tr key={idx} className="hover:bg-neutral-900/50 transition-colors">
                        <td className="px-4 py-2">
                          <kbd className="px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-amber-300 font-bold shadow-sm inline-block">
                            {s.key}
                          </kbd>
                        </td>
                        <td className="px-4 py-2 text-neutral-200 font-sans text-xs">
                          {s.action}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">
                            {s.category}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredShortcuts.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-6 text-center text-neutral-500 font-sans">
                          No shortcuts found matching "{shortcutSearch}"
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-neutral-800 bg-neutral-950/80 shrink-0 text-[11px] text-neutral-400">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-400" />
            <span>Press <kbd className="px-1.5 py-0.2 rounded bg-neutral-800 border border-neutral-700 text-amber-300 font-mono text-[10px]">?</kbd> anywhere to open this manual</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-lg text-xs transition-colors cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
