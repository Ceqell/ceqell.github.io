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
  Search,
  Eye,
  Package,
  Palette
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: HelpTabId;
}

export type HelpTabId = 'overview' | 'tools' | 'selection' | 'guides' | 'layers-refs' | 'assets' | 'shortcuts';

interface TabDefinition {
  id: HelpTabId;
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}

const TABS: TabDefinition[] = [
  { id: 'overview', label: 'Overview', icon: BookOpen },
  { id: 'tools', label: 'Drawing Tools', icon: Pencil },
  { id: 'selection', label: 'Selection & Transform', icon: Scissors },
  { id: 'guides', label: 'Guides & Dimensions', icon: Hash },
  { id: 'layers-refs', label: 'Layers & References', icon: LayersIcon },
  { id: 'assets', label: 'Toolbox & Starters', icon: Package },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="bg-surface-theme border border-ui-theme rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[92vh] text-primary-theme transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-ui-theme bg-surface-raised-theme shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg retro-inset-well flex items-center justify-center" style={{ color: 'var(--text-accent)' }}>
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-primary-theme flex items-center gap-2">
                <span>FigurayMaker Manual & Guide</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded retro-inset-well" style={{ color: 'var(--text-accent)' }}>
                  Docs
                </span>
              </h2>
              <p className="text-[11px] text-secondary-theme">
                Complete guide to drawing, body guides, shortcuts, layers, and references
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="retro-chrome-btn p-1.5 rounded-lg text-primary-theme cursor-pointer"
            title="Close Manual (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 px-4 py-2 bg-surface-theme border-b border-ui-theme shrink-0 overflow-x-auto header-scrollbar">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`retro-chrome-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'active font-bold'
                    : 'text-secondary-theme'
                }`}
                style={isActive ? { color: 'var(--text-accent)' } : undefined}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" style={isActive ? { color: 'var(--text-accent)' } : undefined} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-secondary-theme text-xs leading-relaxed">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 rounded-xl border border-ui-theme bg-surface-raised-theme retro-inset-well space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm" style={{ color: 'var(--text-accent)' }}>
                  <Sparkles className="w-4 h-4" />
                  <span>Welcome to FigurayMaker</span>
                </div>
                <p className="text-primary-theme text-xs leading-relaxed">
                  <strong>FigurayMaker</strong> is a precision pixel art creation studio designed specifically for authoring authentic 
                  <strong> Retro Dev</strong> character sprites and avatars. It combines traditional pixel editing tools with official proportional 
                  body guides, real-time avatar previews, multi-layer compositing, and reference image tracing.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div className="p-3.5 bg-surface-raised-theme rounded-xl border border-ui-theme retro-inset-well space-y-2">
                  <div className="flex items-center gap-2 font-bold text-primary-theme text-xs">
                    <div className="w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] retro-chrome-btn" style={{ color: 'var(--text-accent)' }}>1</div>
                    <span>Proportional Guides</span>
                  </div>
                  <p className="text-secondary-theme text-[11px] leading-relaxed">
                    Designed around the standard Retro Dev body spec (Head 9×8, Torso 11×10, Arms 5×10, Legs 11×10). Guides can be dragged anywhere using <code className="px-1.5 py-0.5 rounded retro-inset-well font-mono text-[10px] font-bold" style={{ color: 'var(--text-accent)' }}>Alt + Drag</code>.
                  </p>
                </div>

                <div className="p-3.5 bg-surface-raised-theme rounded-xl border border-ui-theme retro-inset-well space-y-2">
                  <div className="flex items-center gap-2 font-bold text-primary-theme text-xs">
                    <div className="w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] retro-chrome-btn" style={{ color: 'var(--text-accent)' }}>2</div>
                    <span>Multi-Layer Workflow</span>
                  </div>
                  <p className="text-secondary-theme text-[11px] leading-relaxed">
                    Separate your character into independent layers: Base Skin, Hair, Clothing, Outlines, and Accessories. Reorder, hide, lock, adjust opacity, and merge layers down.
                  </p>
                </div>

                <div className="p-3.5 bg-surface-raised-theme rounded-xl border border-ui-theme retro-inset-well space-y-2">
                  <div className="flex items-center gap-2 font-bold text-primary-theme text-xs">
                    <div className="w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] retro-chrome-btn" style={{ color: 'var(--text-accent)' }}>3</div>
                    <span>Export & Formats</span>
                  </div>
                  <p className="text-secondary-theme text-[11px] leading-relaxed">
                    Export crystal-clear pixel-perfect PNGs (1x to 64x scale or custom resolution) with transparency, solid colors, or dimension numbers, as well as JSON project files.
                  </p>
                </div>
              </div>

              {/* Core Workflow Tips */}
              <div className="border border-ui-theme rounded-xl bg-surface-raised-theme retro-inset-well p-4 space-y-3">
                <h3 className="font-bold text-primary-theme text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Recommended Creation Workflow</span>
                </h3>
                <ol className="list-decimal list-inside space-y-1.5 text-secondary-theme text-xs pl-1">
                  <li><strong className="text-primary-theme font-semibold">Select a Canvas Preset</strong>: Start with default 21×28 or 25×32, or create custom dimensions via the header dropdown.</li>
                  <li><strong className="text-primary-theme font-semibold">Sketch the Head & Body</strong>: Turn on the body guides (<code className="px-1.5 py-0.5 rounded retro-inset-well font-mono text-[10px] font-bold" style={{ color: 'var(--text-accent)' }}>H</code>) to match the official head, torso, arm, and leg boundaries.</li>
                  <li><strong className="text-primary-theme font-semibold">Enable Mirroring</strong>: Press <code className="px-1.5 py-0.5 rounded retro-inset-well font-mono text-[10px] font-bold" style={{ color: 'var(--text-accent)' }}>S</code> for symmetrical bodies and faces to paint both left and right sides simultaneously.</li>
                  <li><strong className="text-primary-theme font-semibold">Use Shading Tools</strong>: Use Lighten (<strong className="text-primary-theme font-semibold">Dodge</strong>) and Darken (<strong className="text-primary-theme font-semibold">Burn</strong>) to add depth, highlights, and shadow gradients.</li>
                  <li><strong className="text-primary-theme font-semibold">Import References</strong>: Add reference photos or character sheets in the References panel to trace or sample color palettes directly.</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 2: DRAWING TOOLS */}
          {activeTab === 'tools' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <p className="text-secondary-theme text-xs">
                FigurayMaker provides 14 dedicated drawing and editing tools accessible from the left toolbar or via keyboard shortcuts:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-surface-raised-theme rounded-xl border border-ui-theme retro-inset-well flex items-start gap-3">
                  <div className="p-2 rounded-lg shrink-0 mt-0.5 retro-chrome-btn" style={{ color: 'var(--text-accent)' }}>
                    <Pencil className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-primary-theme text-xs flex items-center gap-1.5">
                      <span>Pencil</span>
                      <span className="font-mono text-[10px]" style={{ color: 'var(--text-accent)' }}>(P)</span>
                    </div>
                    <p className="text-secondary-theme text-[11px] mt-0.5">
                      Standard pixel drawing pen. Click or drag to draw pixels. Supports brush sizes from 1px to 4px using the size buttons or <code className="px-1 py-0.5 rounded retro-inset-well font-mono text-[10px] text-primary-theme">[</code> and <code className="px-1 py-0.5 rounded retro-inset-well font-mono text-[10px] text-primary-theme">]</code>.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-surface-raised-theme rounded-xl border border-ui-theme retro-inset-well flex items-start gap-3">
                  <div className="p-2 rounded-lg shrink-0 mt-0.5 retro-chrome-btn text-red-500">
                    <Eraser className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-primary-theme text-xs flex items-center gap-1.5">
                      <span>Eraser</span>
                      <span className="font-mono text-[10px] text-red-500">(E)</span>
                    </div>
                    <p className="text-secondary-theme text-[11px] mt-0.5">
                      Clears pixels to transparent on the active layer. Does not erase pixels on other layers.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-surface-raised-theme rounded-xl border border-ui-theme retro-inset-well flex items-start gap-3">
                  <div className="p-2 rounded-lg shrink-0 mt-0.5 retro-chrome-btn" style={{ color: 'var(--text-accent)' }}>
                    <PaintBucket className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-primary-theme text-xs flex items-center gap-1.5">
                      <span>Bucket Fill</span>
                      <span className="font-mono text-[10px]" style={{ color: 'var(--text-accent)' }}>(B)</span>
                    </div>
                    <p className="text-secondary-theme text-[11px] mt-0.5">
                      Flood-fills contiguous pixels of the same color or empty space with the currently selected color.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-surface-raised-theme rounded-xl border border-ui-theme retro-inset-well flex items-start gap-3">
                  <div className="p-2 rounded-lg shrink-0 mt-0.5 retro-chrome-btn" style={{ color: 'var(--text-accent)' }}>
                    <Pipette className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-primary-theme text-xs flex items-center gap-1.5">
                      <span>Eyedropper</span>
                      <span className="font-mono text-[10px]" style={{ color: 'var(--text-accent)' }}>(I)</span>
                    </div>
                    <p className="text-secondary-theme text-[11px] mt-0.5">
                      Sample any color from visible layers on the canvas. Automatically updates your active color swatch.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-surface-raised-theme rounded-xl border border-ui-theme retro-inset-well flex items-start gap-3">
                  <div className="p-2 rounded-lg shrink-0 mt-0.5 retro-chrome-btn" style={{ color: 'var(--text-accent)' }}>
                    <Minus className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-primary-theme text-xs flex items-center gap-1.5">
                      <span>Line</span>
                      <span className="font-mono text-[10px]" style={{ color: 'var(--text-accent)' }}>(L)</span>
                    </div>
                    <p className="text-secondary-theme text-[11px] mt-0.5">
                      Draws clean straight lines using Bresenham's pixel algorithm. Click and drag to position.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-surface-raised-theme rounded-xl border border-ui-theme retro-inset-well flex items-start gap-3">
                  <div className="p-2 rounded-lg shrink-0 mt-0.5 retro-chrome-btn" style={{ color: 'var(--text-accent)' }}>
                    <Square className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-primary-theme text-xs flex items-center gap-1.5">
                      <span>Rectangle & Filled Box</span>
                      <span className="font-mono text-[10px]" style={{ color: 'var(--text-accent)' }}>(U)</span>
                    </div>
                    <p className="text-secondary-theme text-[11px] mt-0.5">
                      Draws hollow pixel box outlines or solid filled rectangles. Drag to set dimensions.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-surface-raised-theme rounded-xl border border-ui-theme retro-inset-well flex items-start gap-3">
                  <div className="p-2 rounded-lg shrink-0 mt-0.5 retro-chrome-btn" style={{ color: 'var(--text-accent)' }}>
                    <Circle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-primary-theme text-xs flex items-center gap-1.5">
                      <span>Circle & Filled Circle</span>
                      <span className="font-mono text-[10px]" style={{ color: 'var(--text-accent)' }}>(C)</span>
                    </div>
                    <p className="text-secondary-theme text-[11px] mt-0.5">
                      Draws hollow pixel circles or solid filled ellipses. Drag from corner to opposite corner.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-surface-raised-theme rounded-xl border border-ui-theme retro-inset-well flex items-start gap-3">
                  <div className="p-2 rounded-lg shrink-0 mt-0.5 retro-chrome-btn" style={{ color: 'var(--text-accent)' }}>
                    <SunMedium className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-primary-theme text-xs">Lighten (Dodge) & Darken (Burn)</div>
                    <p className="text-secondary-theme text-[11px] mt-0.5">
                      Click existing pixels to progressively lighten or darken their shading without needing to change your color palette.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-surface-raised-theme rounded-xl border border-ui-theme retro-inset-well flex items-start gap-3 md:col-span-2">
                  <div className="p-2 rounded-lg shrink-0 mt-0.5 retro-chrome-btn" style={{ color: 'var(--text-accent)' }}>
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-primary-theme text-xs">Color Replace</div>
                    <p className="text-secondary-theme text-[11px] mt-0.5">
                      Click any pixel to replace all matching occurrences of that color across the entire active layer with the currently selected color in a single click.
                    </p>
                  </div>
                </div>
              </div>

              {/* Toolbar Option: Auto Switch to Pencil after Eyedropper */}
              <div className="p-3.5 bg-surface-raised-theme rounded-xl border border-ui-theme retro-inset-well flex items-start gap-3">
                <div className="p-2 rounded-lg shrink-0 mt-0.5 retro-chrome-btn" style={{ color: 'var(--text-accent)' }}>
                  <Pipette className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-primary-theme text-xs flex items-center gap-2">
                    <span>Auto Switch to Pencil after Eyedropper</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded retro-inset-well font-semibold" style={{ color: 'var(--text-accent)' }}>
                      Toolbar Checkbox (Off by default)
                    </span>
                  </div>
                  <p className="text-secondary-theme text-[11px] leading-relaxed">
                    Located as a toggle checkbox at the very bottom of the tools sidebar in the left panel (<span className="font-mono text-primary-theme font-medium">Auto P</span> / <span className="font-mono text-primary-theme font-medium">Auto Pencil</span>). When enabled, whenever you sample a color with the Eyedropper—whether clicking pixels on the canvas, sampling from an open Floating Reference Window, or using the browser picker—your active tool automatically resets back to the <strong className="text-primary-theme font-semibold">Pencil</strong> pen. This lets you pick colors and immediately continue drawing in a single fluid gesture.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SELECTION & TRANSFORM */}
          {activeTab === 'selection' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3.5 bg-surface-raised-theme rounded-xl border border-ui-theme retro-inset-well space-y-2">
                <div className="font-bold text-primary-theme text-xs flex items-center gap-2" style={{ color: 'var(--text-accent)' }}>
                  <Scissors className="w-4 h-4" />
                  <span>How Selection & Pixel Manipulation Works</span>
                </div>
                <p className="text-secondary-theme text-[11px]">
                  Selections allow you to cut, move, transform, and delete regions of pixels on the active layer without affecting other layers.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-surface-raised-theme rounded-xl border border-ui-theme retro-inset-well flex items-start gap-3">
                  <div className="p-2 rounded-lg shrink-0 retro-chrome-btn" style={{ color: 'var(--text-accent)' }}>
                    <Scissors className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-primary-theme text-xs">
                      Box Select <span className="font-mono" style={{ color: 'var(--text-accent)' }}>(M)</span> & Freehand Lasso <span className="font-mono" style={{ color: 'var(--text-accent)' }}>(Q)</span>
                    </div>
                    <p className="text-secondary-theme text-[11px] mt-1">
                      Drag a rectangular marquee or draw any custom freehand lasso outline around pixels you wish to isolate.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-surface-raised-theme rounded-xl border border-ui-theme retro-inset-well flex items-start gap-3">
                  <div className="p-2 rounded-lg shrink-0 retro-chrome-btn" style={{ color: 'var(--text-accent)' }}>
                    <Move className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-primary-theme text-xs">Moving & Floating Pixels</div>
                    <p className="text-secondary-theme text-[11px] mt-1">
                      Click and drag inside any active selection to "lift" the pixels into a floating state. You can also use the 
                      <strong className="text-primary-theme font-semibold"> Arrow Keys</strong> (<code className="px-1.5 py-0.5 rounded retro-inset-well font-mono text-[10px] font-bold" style={{ color: 'var(--text-accent)' }}>↑ ↓ ← →</code>) to nudge floating pixels by exact 1-pixel increments.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-surface-raised-theme rounded-xl border border-ui-theme retro-inset-well flex items-start gap-3">
                  <div className="p-2 rounded-lg shrink-0 retro-chrome-btn text-emerald-500">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-primary-theme text-xs">
                      Stamping & Committing <span className="font-mono text-emerald-500">(Enter)</span>
                    </div>
                    <p className="text-secondary-theme text-[11px] mt-1">
                      Once you have positioned your floating pixels, press <code className="px-1.5 py-0.5 rounded retro-inset-well font-mono text-[10px] font-bold text-emerald-500">Enter</code> or click the 
                      <strong className="text-primary-theme font-semibold"> Stamp</strong> button in the left toolbar or floating action bar to commit the pixels back into the active layer.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-surface-raised-theme rounded-xl border border-ui-theme retro-inset-well flex items-start gap-3">
                  <div className="p-2 rounded-lg shrink-0 retro-chrome-btn" style={{ color: 'var(--text-accent)' }}>
                    <FlipHorizontal className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-primary-theme text-xs">Horizontal & Vertical Flipping</div>
                    <p className="text-secondary-theme text-[11px] mt-1">
                      Use the flip buttons in the toolbar while a selection is active to mirror the selected sprite segment (perfect for flipping weapons, arms, or eyes).
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-surface-raised-theme rounded-xl border border-ui-theme retro-inset-well flex items-start gap-3">
                  <div className="p-2 rounded-lg shrink-0 retro-chrome-btn text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-primary-theme text-xs">
                      Deleting Selected Pixels <span className="font-mono text-red-500">(Delete / Backspace)</span>
                    </div>
                    <p className="text-secondary-theme text-[11px] mt-1">
                      Press <code className="px-1.5 py-0.5 rounded retro-inset-well font-mono text-[10px] font-bold text-red-500">Delete</code> or <code className="px-1.5 py-0.5 rounded retro-inset-well font-mono text-[10px] font-bold text-red-500">Backspace</code> to erase all pixels inside the active selection. Press <code className="px-1.5 py-0.5 rounded retro-inset-well font-mono text-[10px] text-primary-theme">Esc</code> to deselect.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GUIDES & DIMENSIONS */}
          {activeTab === 'guides' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3.5 bg-surface-raised-theme border border-ui-theme border-l-4 rounded-xl space-y-1.5 retro-inset-well" style={{ borderLeftColor: 'var(--text-accent)' }}>
                <div className="font-bold text-xs" style={{ color: 'var(--text-accent)' }}>Official Retro Dev Specification</div>
                <p className="italic text-primary-theme text-[11px]">
                  "The process of making a character sprite's body parts are very easy. 
                  The legs and torso are 11x10 pixels, the arms are 5x10 and the head is 9x8. 
                  After you are done with the body, design on the accessories begins."
                </p>
              </div>

              {/* Dimension Breakdown Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                <div className="p-3 bg-surface-raised-theme rounded-xl border border-ui-theme retro-inset-well">
                  <div className="text-[10px] uppercase font-mono font-bold text-amber-500">Head</div>
                  <div className="text-lg font-bold font-mono text-primary-theme mt-0.5">9 × 8</div>
                  <div className="text-[10px] text-secondary-theme mt-1 leading-snug">
                    Round contour (3px top, 7px row 2, 9px center, 7px bottom, 5px neck).
                  </div>
                </div>

                <div className="p-3 bg-surface-raised-theme rounded-xl border border-ui-theme retro-inset-well">
                  <div className="text-[10px] uppercase font-mono font-bold text-sky-500">Torso</div>
                  <div className="text-lg font-bold font-mono text-primary-theme mt-0.5">11 × 10</div>
                  <div className="text-[10px] text-secondary-theme mt-1 leading-snug">
                    Main upper body block (aligned between arms).
                  </div>
                </div>

                <div className="p-3 bg-surface-raised-theme rounded-xl border border-ui-theme retro-inset-well">
                  <div className="text-[10px] uppercase font-mono font-bold text-amber-500">Arms (L / R)</div>
                  <div className="text-lg font-bold font-mono text-primary-theme mt-0.5">5 × 10 each</div>
                  <div className="text-[10px] text-secondary-theme mt-1 leading-snug">
                    Flank torso on left and right, top-aligned with shoulders.
                  </div>
                </div>

                <div className="p-3 bg-surface-raised-theme rounded-xl border border-ui-theme retro-inset-well">
                  <div className="text-[10px] uppercase font-mono font-bold text-emerald-500">Legs</div>
                  <div className="text-lg font-bold font-mono text-primary-theme mt-0.5">11 × 10</div>
                  <div className="text-[10px] text-secondary-theme mt-1 leading-snug">
                    Lower body block (split into two 5px legs with 1px seam divider).
                  </div>
                </div>
              </div>

              {/* Moving Guides Instruction Box */}
              <div className="p-3.5 bg-surface-raised-theme rounded-xl border border-ui-theme retro-inset-well space-y-2">
                <div className="font-bold text-primary-theme text-xs flex items-center gap-2">
                  <Move className="w-4 h-4" style={{ color: 'var(--text-accent)' }} />
                  <span>How to Move & Reposition Body Guides</span>
                </div>
                <div className="space-y-1.5 text-secondary-theme text-xs">
                  <p>
                    Body guides are not locked in place! You can reposition them anywhere on the canvas:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-secondary-theme text-[11px] pl-1">
                    <li>
                      <strong className="text-primary-theme font-semibold">Hold Alt and Drag on Canvas</strong>: While holding <code className="px-1 py-0.5 rounded retro-inset-well font-mono text-[10px]" style={{ color: 'var(--text-accent)' }}>Alt</code>, click anywhere over the body guides and drag to slide them freely.
                    </li>
                    <li>
                      <strong className="text-primary-theme font-semibold">Move Guide Button (Top Bar)</strong>: Click the <code className="px-1 py-0.5 rounded retro-inset-well font-mono text-[10px]" style={{ color: 'var(--text-accent)' }}>Move Guide</code> toggle in the header, drag or nudge the guides with pixel arrows, and click Done when finished.
                    </li>
                    <li>
                      <strong className="text-primary-theme font-semibold">Center Guide</strong>: Click the <code className="px-1 py-0.5 rounded retro-inset-well font-mono text-[10px] text-primary-theme">Center Guide</code> button in the floating guide controller to instantly snap the guide back to the canvas center.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Symmetry */}
              <div className="p-3.5 bg-surface-raised-theme rounded-xl border border-ui-theme retro-inset-well space-y-2">
                <div className="font-bold text-primary-theme text-xs flex items-center gap-2">
                  <SplitSquareVertical className="w-4 h-4" style={{ color: 'var(--text-accent)' }} />
                  <span>Vertical Symmetry / Mirror Mode (S)</span>
                </div>
                <p className="text-secondary-theme text-[11px]">
                  Press <code className="px-1 py-0.5 rounded retro-inset-well font-mono text-[10px] font-bold" style={{ color: 'var(--text-accent)' }}>S</code> to activate symmetry mode. A dashed vertical axis line appears down the center of the character's torso. Every pixel drawn, erased, or shaded on one side is automatically reflected on the opposite side in real time.
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: LAYERS & REFERENCES */}
          {activeTab === 'layers-refs' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Layers Section */}
              <div className="p-3.5 bg-surface-raised-theme rounded-xl border border-ui-theme retro-inset-well space-y-2">
                <div className="font-bold text-primary-theme text-xs flex items-center gap-2">
                  <LayersIcon className="w-4 h-4" style={{ color: 'var(--text-accent)' }} />
                  <span>Layers Panel Workflow</span>
                </div>
                <p className="text-secondary-theme text-[11px]">
                  Layers stack on top of each other from bottom to top. Working with multiple layers allows you to paint clothing and accessories over body outlines without damaging previous work.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className="p-2 bg-surface-theme border border-ui-theme rounded-lg">
                    <span className="font-bold text-primary-theme">Add & Duplicate:</span> Create fresh empty layers or clone your active layer to test alternative colors.
                  </div>
                  <div className="p-2 bg-surface-theme border border-ui-theme rounded-lg">
                    <span className="font-bold text-primary-theme">Merge Down:</span> Flattens the active layer into the layer immediately below it.
                  </div>
                  <div className="p-2 bg-surface-theme border border-ui-theme rounded-lg">
                    <span className="font-bold text-primary-theme">Lock Layer:</span> Prevents accidental edits, bucket fills, or erasing on protected layers.
                  </div>
                  <div className="p-2 bg-surface-theme border border-ui-theme rounded-lg">
                    <span className="font-bold text-primary-theme">Opacity Slider:</span> Fade out reference outlines or sketch layers while detailing the final sprite.
                  </div>
                </div>
              </div>

              {/* References Section */}
              <div className="p-3.5 bg-surface-raised-theme rounded-xl border border-ui-theme retro-inset-well space-y-2">
                <div className="font-bold text-primary-theme text-xs flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" style={{ color: 'var(--text-accent)' }} />
                  <span>Reference Images & Tracing</span>
                </div>
                <p className="text-secondary-theme text-[11px]">
                  Import your own PNGs, JPEGs, or WebP images using the References panel. FigurayMaker offers two ways to use reference images:
                </p>

                <div className="space-y-2 text-[11px]">
                  <div className="p-2.5 bg-surface-theme rounded-lg border border-ui-theme">
                    <div className="font-bold text-xs" style={{ color: 'var(--text-accent)' }}>1. Built-in Reference Template (DavidBlxTemplate)</div>
                    <p className="text-secondary-theme mt-0.5 leading-relaxed">
                      Every new project comes loaded with a comprehensive built-in reference template (<strong className="text-primary-theme">Robloxian 2.0, Skeleton, iBot, Peter, and classic skin/part color templates</strong>). You can toggle this on or off when creating a project in the Project Manager (<em className="text-primary-theme">"Show default reference image"</em>), or restore it anytime with the <strong className="text-primary-theme">Template</strong> button.
                    </p>
                  </div>

                  <div className="p-2.5 bg-surface-theme rounded-lg border border-ui-theme">
                    <div className="font-bold text-xs" style={{ color: 'var(--text-accent)' }}>2. Floating Reference Window (Resizable Popout)</div>
                    <p className="text-secondary-theme mt-0.5 leading-relaxed">
                      Open a movable, freely <strong className="text-primary-theme">resizable window</strong> displaying your image. Resize from any edge or corner with the diagonal retro grip handle, double-click the header or click the <strong className="text-primary-theme">Maximize/Restore</strong> icon, click the zoom percentage to <strong className="text-primary-theme">Fit to Window</strong>, and click directly anywhere on the reference image to <strong className="text-primary-theme">eyedrop and sample its colors</strong> into your active palette! Custom window positions and sizes are automatically saved.
                    </p>
                  </div>

                  <div className="p-2.5 bg-surface-theme rounded-lg border border-ui-theme">
                    <div className="font-bold text-xs" style={{ color: 'var(--text-accent)' }}>3. In-Canvas Tracing Overlay Mode</div>
                    <p className="text-secondary-theme mt-0.5">
                      Toggle <strong className="text-primary-theme">Trace Mode</strong> to project your reference image directly onto your pixel drawing canvas with custom opacity (e.g. 45%), scale, and X/Y offset sliders. Trace pixel-by-pixel over reference sketches with ease.
                    </p>
                  </div>
                </div>
              </div>

              {/* Real-time Preview & Canvas Background Section */}
              <div className="p-3.5 bg-surface-raised-theme rounded-xl border border-ui-theme retro-inset-well space-y-2">
                <div className="font-bold text-primary-theme text-xs flex items-center gap-2">
                  <Eye className="w-4 h-4" style={{ color: 'var(--text-accent)' }} />
                  <span>Real-time Preview & Canvas Backgrounds</span>
                </div>
                <p className="text-secondary-theme text-[11px] leading-relaxed">
                  The <strong className="text-primary-theme font-semibold">Real-time Preview</strong> panel renders your sprite simultaneously at both 1x original resolution and 3x scale. By default across all themes, <strong className="text-primary-theme font-semibold">Dark-Checker</strong> is enabled to provide clear contrast against character sprites (including bright skin tones and the default Noob template). Using the <code className="px-1.5 py-0.5 rounded retro-inset-well font-mono text-[10px] font-bold" style={{ color: 'var(--text-accent)' }}>BG</code> toggle button in the preview header, bottom canvas indicator, or top bar, you can cycle backgrounds:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-surface-theme border border-ui-theme rounded-lg">
                    <strong className="text-primary-theme">Dark-Checker (Default):</strong> Deep obsidian and charcoal dark checkerboard pattern, constant across all themes for optimal sprite contrast.
                  </div>
                  <div className="p-2 bg-surface-theme border border-ui-theme rounded-lg">
                    <strong className="text-primary-theme">Light-Checker:</strong> High-contrast crisp light grey and white checkerboard pattern, constant across all themes.
                  </div>
                  <div className="p-2 bg-surface-theme border border-ui-theme rounded-lg">
                    <strong className="text-primary-theme">Retro:</strong> Authentic solid neutral grey (<code className="font-mono text-[10px]">#404044</code>) background matching classic sprite dev sheets.
                  </div>
                  <div className="p-2 bg-surface-theme border border-ui-theme rounded-lg">
                    <strong className="text-primary-theme">Dark:</strong> Pure solid dark (<code className="font-mono text-[10px]">#121318</code>) background for checking neon and light character silhouettes.
                  </div>
                </div>
                <p className="text-secondary-theme text-[10px] italic">
                  Background settings seamlessly apply to both the mini preview box and the central drawing canvas stage simultaneously.
                </p>
              </div>
            </div>
          )}

          {/* TAB 6: TOOLBOX ASSET MANAGER & STARTER TEMPLATES */}
          {activeTab === 'assets' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Intro Banner */}
              <div className="p-4 rounded-xl border border-ui-theme bg-surface-raised-theme retro-inset-well space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-bold text-sm" style={{ color: 'var(--text-accent)' }}>
                    <Package className="w-4 h-4" />
                    <span>Asset Manager (Toolbox) & Authentic Community Starters</span>
                  </div>
                  <span className="font-mono text-[10px] text-secondary-theme px-2 py-0.5 rounded retro-chrome-btn">
                    Art by @garlicnibbler2024
                  </span>
                </div>
                <p className="text-primary-theme text-xs leading-relaxed">
                  FigurayMaker includes a built-in <strong>54-sprite library</strong> harvested from authentic community pixel art 
                  (the renowned <em>DavidBlxTemplate</em> atlas). You can insert whole characters, modular body parts, armor plating, 
                  and accessories into your project in seconds, or load full hand-drawn package templates with auto-sized canvases.
                </p>
              </div>

              {/* Artwork Attribution & Provenance Card */}
              <div className="p-3 bg-surface-theme rounded-xl border border-ui-theme flex items-start gap-2.5 text-[11px]">
                <Palette className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-primary-theme flex items-center gap-1.5 flex-wrap">
                    <span>Original Sprite Atlas Artwork (2021)</span>
                    <span className="px-1.5 py-0.2 rounded font-mono text-[9.5px] bg-surface-raised-theme border border-ui-theme font-bold" style={{ color: 'var(--text-accent)' }}>
                      @garlicnibbler2024 (ROBLOX: @DJQ2BLUE25)
                    </span>
                  </div>
                  <p className="text-secondary-theme leading-relaxed">
                    The hand-drawn character turnaround sheet and sprite atlas (<code className="font-mono text-[10px]">DavidBlxTemplate.png</code>) was originally drawn in 2021 by <strong className="text-primary-theme font-semibold">@garlicnibbler2024</strong> (ROBLOX handle <strong className="text-primary-theme font-semibold">@DJQ2BLUE25</strong>). While the artist moved accounts and could not be reached for refreshed permission (last recorded message in the TDS Discord server in 2025), their original artwork and community contribution are respectfully credited and honored here.
                  </p>
                </div>
              </div>

              {/* Section 1: The 54-Sprite Atlas */}
              <div className="p-3.5 bg-surface-raised-theme rounded-xl border border-ui-theme retro-inset-well space-y-3">
                <div className="font-bold text-primary-theme text-xs flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" style={{ color: 'var(--text-accent)' }} />
                    <span>Categorized Sprite Atlas Overview</span>
                  </span>
                  <span className="font-mono text-[10px] text-secondary-theme px-2 py-0.5 rounded retro-chrome-btn">54 Total Assets</span>
                </div>
                <p className="text-secondary-theme text-[11px] leading-relaxed">
                  Every asset is organized by anatomical category and package origin:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-[11px]">
                  <div className="p-2.5 bg-surface-theme border border-ui-theme rounded-lg space-y-1">
                    <strong className="text-primary-theme block font-bold text-xs" style={{ color: 'var(--text-accent)' }}>Full Characters</strong>
                    <p className="text-secondary-theme text-[10.5px]">
                      Complete assembled outfits including Robloxian 2.0, Classic 1.0 Noob, Guest, iBot Cybernetic, Classic Skeleton, Peter, Witch, and Steampunk.
                    </p>
                  </div>
                  <div className="p-2.5 bg-surface-theme border border-ui-theme rounded-lg space-y-1">
                    <strong className="text-primary-theme block font-bold text-xs" style={{ color: 'var(--text-accent)' }}>Heads & Faces</strong>
                    <p className="text-secondary-theme text-[10.5px]">
                      Authentic 9×8 heads featuring standard smiley faces, robot visors, skeleton skulls, glasses, and expression variations.
                    </p>
                  </div>
                  <div className="p-2.5 bg-surface-theme border border-ui-theme rounded-lg space-y-1">
                    <strong className="text-primary-theme block font-bold text-xs" style={{ color: 'var(--text-accent)' }}>Torsos & Chestplates</strong>
                    <p className="text-secondary-theme text-[10.5px]">
                      11×10 torsos with authentic shading, ribcages, high-tech chestplates, jackets, and guest insignia stripes.
                    </p>
                  </div>
                  <div className="p-2.5 bg-surface-theme border border-ui-theme rounded-lg space-y-1">
                    <strong className="text-primary-theme block font-bold text-xs" style={{ color: 'var(--text-accent)' }}>Arms & Shoulders</strong>
                    <p className="text-secondary-theme text-[10.5px]">
                      5×10 limb blocks for Left and Right arms, robotic joints, bone limbs, sleeves, and gauntlets.
                    </p>
                  </div>
                  <div className="p-2.5 bg-surface-theme border border-ui-theme rounded-lg space-y-1">
                    <strong className="text-primary-theme block font-bold text-xs" style={{ color: 'var(--text-accent)' }}>Legs & Boots</strong>
                    <p className="text-secondary-theme text-[11px]">
                      11×10 lower body sprites with center seam dividers, robotic treads, pants, and boots.
                    </p>
                  </div>
                  <div className="p-2.5 bg-surface-theme border border-ui-theme rounded-lg space-y-1">
                    <strong className="text-primary-theme block font-bold text-xs" style={{ color: 'var(--text-accent)' }}>Accessories & Hats</strong>
                    <p className="text-secondary-theme text-[10.5px]">
                      Modular headgear, hair, visors, wings, swords, and equipment designed to layer over standard heads.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 2: Canonical 1x Scaling vs 4x High-Res Toggle */}
              <div className="p-3.5 bg-surface-raised-theme rounded-xl border border-ui-theme retro-inset-well space-y-2.5">
                <div className="font-bold text-primary-theme text-xs flex items-center gap-2">
                  <Hash className="w-4 h-4" style={{ color: 'var(--text-accent)' }} />
                  <span>Canonical 1x Scaling vs 4x High-Res Template Mode</span>
                </div>
                <p className="text-secondary-theme text-[11px] leading-relaxed">
                  In community character lore, official character proportions specify: 
                  <strong className="text-primary-theme"> Head 9×8, Torso 11×10, Arms 5×10, and Legs 11×10</strong> (body total 21×28). 
                  However, the raw source sheet (<em>DavidBlxTemplate.png</em>) was drawn at a 4x magnified raster scale.
                </p>
                <div className="p-3 bg-surface-theme rounded-lg border border-ui-theme space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-primary-theme">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span>The Dimensions Toggle (Located in Asset Manager Top Right)</span>
                  </div>
                  <p className="text-secondary-theme text-[11px] leading-relaxed">
                    By default, <strong className="text-primary-theme">1x Canonical (Exact Wiki)</strong> is enabled, automatically downscaling all atlas assets to their pure community dimensions so they fit the wireframe guides like a glove. 
                    If you prefer the raw, ultra-detailed magnified pixel art, toggle to <strong className="text-primary-theme">4x Template Scale</strong> to import full-resolution assets into larger canvases (e.g. 100×120+).
                  </p>
                </div>
              </div>

              {/* Section 3: 4 Integration Actions */}
              <div className="p-3.5 bg-surface-raised-theme rounded-xl border border-ui-theme retro-inset-well space-y-3">
                <div className="font-bold text-primary-theme text-xs flex items-center gap-2">
                  <Sliders className="w-4 h-4" style={{ color: 'var(--text-accent)' }} />
                  <span>4 Ways to Use Any Asset</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
                  <div className="p-2.5 bg-surface-theme rounded-lg border border-ui-theme space-y-1">
                    <div className="font-bold text-primary-theme flex items-center gap-1.5">
                      <LayersIcon className="w-3.5 h-3.5 text-blue-400" />
                      <span>1. Add as New Layer</span>
                    </div>
                    <p className="text-secondary-theme text-[10.5px] leading-relaxed">
                      Creates a dedicated, transparent layer named after the sprite. The asset is automatically centered on the canvas according to its anatomical origin.
                    </p>
                  </div>

                  <div className="p-2.5 bg-surface-theme rounded-lg border border-ui-theme space-y-1">
                    <div className="font-bold text-primary-theme flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>2. Stamp onto Active Layer</span>
                    </div>
                    <p className="text-secondary-theme text-[10.5px] leading-relaxed">
                      Directly merges the sprite pixels into whatever layer you currently have selected, preserving existing artwork beneath transparent regions.
                    </p>
                  </div>

                  <div className="p-2.5 bg-surface-theme rounded-lg border border-ui-theme space-y-1">
                    <div className="font-bold text-primary-theme flex items-center gap-1.5">
                      <Maximize2 className="w-3.5 h-3.5 text-purple-400" />
                      <span>3. Open Floating Reference PIP</span>
                    </div>
                    <p className="text-secondary-theme text-[10.5px] leading-relaxed">
                      Pops the sprite into a draggable, resizable floating reference window over your canvas. You can zoom, pan, and click directly on the sprite to sample authentic hex colors!
                    </p>
                  </div>

                  <div className="p-2.5 bg-surface-theme rounded-lg border border-ui-theme space-y-1">
                    <div className="font-bold text-primary-theme flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <span>4. Set as Canvas Trace Ghost</span>
                    </div>
                    <p className="text-secondary-theme text-[10.5px] leading-relaxed">
                      Overlays the sprite with 45% transparency directly onto your main drawing canvas stage. Trace over the lines or recolor parts by hand with pixel precision.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 4: Revamped Load Starter Menu */}
              <div className="p-3.5 bg-surface-raised-theme rounded-xl border border-ui-theme retro-inset-well space-y-2.5">
                <div className="font-bold text-primary-theme text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Revamped "Load Starter" Modal</span>
                </div>
                <p className="text-secondary-theme text-[11px] leading-relaxed">
                  Accessed by clicking <strong className="text-primary-theme">Load Starter</strong> in the top header. Instead of synthetic procedural blocks, starters load real human-drawn packages extracted from the David Blocks template:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-surface-theme border border-ui-theme rounded-lg">
                    <strong className="text-primary-theme">Authentic Community Packages:</strong> Classic Noob, Guest (with striped torso), Robloxian 2.0 Modern, iBot Cybernetic Package, Classic Skeleton, Peter, and BluuDude Hacker.
                  </div>
                  <div className="p-2 bg-surface-theme border border-ui-theme rounded-lg">
                    <strong className="text-primary-theme">Smart Canvas Auto-Resize:</strong> Check the <em>"Auto-resize canvas"</em> box to automatically expand your canvas dimensions to accommodate hats, hair, or wide packages.
                  </div>
                </div>
              </div>

              {/* Section 5: Access Shortcuts */}
              <div className="p-3 bg-surface-theme rounded-xl border border-ui-theme text-[11px] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary-theme" />
                  <span className="font-semibold text-primary-theme">Quick Access:</span>
                  <span className="text-secondary-theme">Click <strong>Toolbox</strong> in the top header or <strong>Toolbox Assets</strong> in the left toolbar anytime.</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: KEYBOARD SHORTCUTS */}
          {activeTab === 'shortcuts' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-secondary-theme absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter keyboard shortcuts (e.g. pencil, select, alt, zoom)..."
                  value={shortcutSearch}
                  onChange={e => setShortcutSearch(e.target.value)}
                  className="w-full bg-surface-raised-theme border border-ui-theme rounded-xl pl-9 pr-3 py-2 text-xs text-primary-theme placeholder:text-secondary-theme focus:outline-none focus:border-[var(--text-accent)]"
                />
              </div>

              {/* Shortcuts Table */}
              <div className="border border-ui-theme rounded-xl overflow-hidden retro-inset-well bg-surface-theme">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-raised-theme border-b border-ui-theme text-[10px] uppercase font-bold tracking-wider text-secondary-theme">
                    <tr>
                      <th className="px-4 py-2 w-44">Shortcut Key</th>
                      <th className="px-4 py-2">Action</th>
                      <th className="px-4 py-2 w-28 text-right">Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ui-theme font-mono text-[11px]">
                    {filteredShortcuts.map((s, idx) => (
                      <tr key={idx} className="hover:bg-surface-raised-theme/70 transition-colors">
                        <td className="px-4 py-2">
                          <kbd className="retro-chrome-btn px-2.5 py-0.5 rounded font-mono text-xs font-bold shadow-sm inline-block" style={{ color: 'var(--text-accent)' }}>
                            {s.key}
                          </kbd>
                        </td>
                        <td className="px-4 py-2 text-primary-theme font-sans text-xs">
                          {s.action}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <span className="text-[10px] px-2 py-0.5 rounded retro-inset-well text-secondary-theme border border-ui-theme font-sans">
                            {s.category}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredShortcuts.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-6 text-center text-secondary-theme font-sans">
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
        <div className="flex items-center justify-between px-5 py-3 border-t border-ui-theme bg-surface-raised-theme shrink-0 text-[11px] text-secondary-theme">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" style={{ color: 'var(--text-accent)' }} />
            <span>Press <kbd className="px-1.5 py-0.5 rounded retro-chrome-btn font-mono text-[10px] font-bold" style={{ color: 'var(--text-accent)' }}>?</kbd> anywhere to open this manual</span>
          </div>
          <button
            onClick={onClose}
            className="retro-gold-btn px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
