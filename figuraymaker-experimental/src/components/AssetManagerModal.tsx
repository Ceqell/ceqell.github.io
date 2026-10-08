import React, { useState, useMemo, useEffect } from 'react';
import { 
  Package, 
  X, 
  Search, 
  Layers, 
  Eye, 
  Check, 
  Plus, 
  Maximize2 
} from 'lucide-react';
import { SPRITE_ATLAS, SpriteAtlasEntry, extractSpritePixels, placeSpriteOnCanvas, ScaleMode } from '../utils/spriteAtlas';

interface AssetManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasWidth: number;
  canvasHeight: number;
  onInsertAsNewLayer: (sprite: SpriteAtlasEntry, pixels: string[], scaleMode: ScaleMode) => void;
  onStampOntoActiveLayer: (sprite: SpriteAtlasEntry, pixels: string[], scaleMode: ScaleMode) => void;
  onAddAsFloatingReference: (sprite: SpriteAtlasEntry) => void;
  onSetTraceOverlay: (sprite: SpriteAtlasEntry) => void;
}

export const AssetManagerModal: React.FC<AssetManagerModalProps> = ({
  isOpen,
  onClose,
  canvasWidth,
  canvasHeight,
  onInsertAsNewLayer,
  onStampOntoActiveLayer,
  onAddAsFloatingReference,
  onSetTraceOverlay,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPackage, setSelectedPackage] = useState<string>('all');
  const [scaleMode, setScaleMode] = useState<ScaleMode>('1x'); // 1x default canonical wiki scale
  const [selectedSpriteId, setSelectedSpriteId] = useState<string>(SPRITE_ATLAS[0]?.id || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Available categories & packages
  const categories = useMemo(() => {
    const list: string[] = ['all'];
    const cats = new Set(SPRITE_ATLAS.map(s => s.category));
    cats.forEach(c => list.push(c));
    return list;
  }, []);

  const packages = useMemo(() => {
    const list: string[] = ['all'];
    const pkgs = new Set(SPRITE_ATLAS.map(s => s.package));
    pkgs.forEach(p => list.push(p));
    return list;
  }, []);

  // Filtered sprite results
  const filteredSprites = useMemo(() => {
    return SPRITE_ATLAS.filter(sprite => {
      if (selectedCategory !== 'all' && sprite.category !== selectedCategory) {
        return false;
      }
      if (selectedPackage !== 'all' && sprite.package !== selectedPackage) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = sprite.name.toLowerCase().includes(query);
        const matchesCategory = sprite.category.toLowerCase().includes(query);
        const matchesPackage = sprite.package.toLowerCase().includes(query);
        const matchesTags = sprite.tags.some(t => t.toLowerCase().includes(query));
        if (!matchesName && !matchesCategory && !matchesPackage && !matchesTags) {
          return false;
        }
      }
      return true;
    });
  }, [searchQuery, selectedCategory, selectedPackage]);

  const activeSprite = useMemo(() => {
    return SPRITE_ATLAS.find(s => s.id === selectedSpriteId) || filteredSprites[0] || SPRITE_ATLAS[0];
  }, [selectedSpriteId, filteredSprites]);

  const showFeedback = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => {
      setActionSuccessMsg(null);
    }, 2200);
  };

  const handleInsertLayer = async () => {
    if (!activeSprite) return;
    try {
      setIsProcessing(true);
      const extracted = await extractSpritePixels(activeSprite, scaleMode);
      const placed = placeSpriteOnCanvas(extracted.pixels, extracted.width, extracted.height, canvasWidth, canvasHeight);
      onInsertAsNewLayer(activeSprite, placed, scaleMode);
      showFeedback(`Inserted "${activeSprite.name}" (${scaleMode}) as new layer!`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStampActive = async () => {
    if (!activeSprite) return;
    try {
      setIsProcessing(true);
      const extracted = await extractSpritePixels(activeSprite, scaleMode);
      const placed = placeSpriteOnCanvas(extracted.pixels, extracted.width, extracted.height, canvasWidth, canvasHeight);
      onStampOntoActiveLayer(activeSprite, placed, scaleMode);
      showFeedback(`Stamped "${activeSprite.name}" (${scaleMode}) onto active layer!`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFloatingReference = () => {
    if (!activeSprite) return;
    onAddAsFloatingReference(activeSprite);
    showFeedback(`Added "${activeSprite.name}" as floating reference!`);
  };

  const handleTraceOverlay = () => {
    if (!activeSprite) return;
    onSetTraceOverlay(activeSprite);
    showFeedback(`Attached "${activeSprite.name}" to canvas trace overlay!`);
  };

  if (!isOpen) return null;

  const currentW = scaleMode === '1x' ? activeSprite.wikiDimensions.width : activeSprite.bounds.width;
  const currentH = scaleMode === '1x' ? activeSprite.wikiDimensions.height : activeSprite.bounds.height;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl h-[88vh] max-h-[92vh] bg-surface-theme border border-ui-theme rounded-2xl shadow-2xl overflow-hidden flex flex-col text-primary-theme transition-all duration-200"
      >
        {/* Header matching other windows */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-ui-theme bg-surface-raised-theme shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg retro-inset-well flex items-center justify-center" style={{ color: 'var(--text-accent)' }}>
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-primary-theme flex items-center gap-2">
                <span>Toolbox &amp; Asset Manager</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded retro-inset-well" style={{ color: 'var(--text-accent)' }}>
                  {SPRITE_ATLAS.length} Assets
                </span>
              </h2>
              <p className="text-[11px] text-secondary-theme">
                Hand-drawn sprite parts, limbs, torsos, and packages from DavidBlxTemplate
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="retro-chrome-btn p-1.5 rounded-lg text-primary-theme cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar / Filters & Scale Mode Toggle */}
        <div className="p-3 border-b border-ui-theme bg-surface-raised-theme flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Search box */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-secondary-theme" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search parts, packages, tags (torso, ibot, 2.0)..."
              className="w-full pl-8 pr-7 py-1.5 rounded-lg border border-ui-theme bg-surface-theme text-xs text-primary-theme placeholder:text-secondary-theme/60 outline-none focus:border-[var(--text-accent)] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-secondary-theme hover:text-primary-theme cursor-pointer p-0.5"
              >
                ×
              </button>
            )}
          </div>

          {/* Scale Mode Toggle: 1x Canonical Default vs 2x HD Source */}
          <div className="flex items-center gap-1 p-0.5 retro-inset-well rounded-lg shrink-0">
            <button
              type="button"
              onClick={() => setScaleMode('1x')}
              title="1x Canonical Wiki Scale (11x10 torso, 9x8 head, 5x10 arm, 21x28 character)"
              className={`px-2.5 py-1 text-xs font-bold rounded-md cursor-pointer transition-all ${
                scaleMode === '1x'
                  ? 'retro-blue-btn text-white shadow-xs'
                  : 'text-secondary-theme hover:text-primary-theme'
              }`}
            >
              1× Wiki Scale (Default)
            </button>
            <button
              type="button"
              onClick={() => setScaleMode('2x')}
              title="2x Raw Source Scale from template (22x20 torso, 18x16 head, 42x56 character)"
              className={`px-2.5 py-1 text-xs font-bold rounded-md cursor-pointer transition-all ${
                scaleMode === '2x'
                  ? 'retro-blue-btn text-white shadow-xs'
                  : 'text-secondary-theme hover:text-primary-theme'
              }`}
            >
              2× Source HD
            </button>
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 retro-inset-well px-2.5 py-1 rounded-lg">
            <span className="text-[11px] text-secondary-theme font-medium">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-xs text-primary-theme font-semibold outline-none cursor-pointer"
            >
              {categories.map(c => (
                <option key={c} value={c} className="bg-surface-theme text-primary-theme">
                  {c === 'all' ? 'All Categories' : c}
                </option>
              ))}
            </select>
          </div>

          {/* Package Dropdown */}
          <div className="flex items-center gap-1.5 retro-inset-well px-2.5 py-1 rounded-lg">
            <span className="text-[11px] text-secondary-theme font-medium">Package:</span>
            <select
              value={selectedPackage}
              onChange={(e) => setSelectedPackage(e.target.value)}
              className="bg-transparent text-xs text-primary-theme font-semibold outline-none cursor-pointer"
            >
              {packages.map(p => (
                <option key={p} value={p} className="bg-surface-theme text-primary-theme">
                  {p === 'all' ? 'All Packages' : p}
                </option>
              ))}
            </select>
          </div>

          <span className="text-[11px] text-secondary-theme ml-auto font-mono">
            {filteredSprites.length} {filteredSprites.length === 1 ? 'part' : 'parts'}
          </span>
        </div>

        {/* Body: Two columns (Sprite Grid + Inspection Panel) */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row min-h-0">
          {/* Left: Sprites Grid */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto no-scrollbar">
            {filteredSprites.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-secondary-theme">
                <Package className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-sm font-semibold text-primary-theme">No sprite parts match your filter</p>
                <p className="text-xs mt-1">Try searching for &quot;head&quot;, &quot;torso&quot;, &quot;ibot&quot;, or clear filters.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedPackage('all');
                  }}
                  className="mt-3 px-3 py-1.5 rounded-lg retro-chrome-btn text-xs font-semibold cursor-pointer text-primary-theme"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {filteredSprites.map(sprite => {
                  const isSelected = activeSprite?.id === sprite.id;
                  const itemW = scaleMode === '1x' ? sprite.wikiDimensions.width : sprite.bounds.width;
                  const itemH = scaleMode === '1x' ? sprite.wikiDimensions.height : sprite.bounds.height;

                  return (
                    <div
                      key={sprite.id}
                      onClick={() => setSelectedSpriteId(sprite.id)}
                      className={`group p-2.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col items-center relative ${
                        isSelected
                          ? 'border-[var(--text-accent)] bg-surface-raised-theme shadow-md ring-1.5 ring-[var(--text-accent)]'
                          : 'border-ui-theme retro-inset-well hover:border-[var(--text-accent)]/50 hover:shadow-xs'
                      }`}
                    >
                      {/* Thumbnail container with adaptive checkerboard */}
                      <div className="w-full h-24 rounded-lg bg-surface-raised-theme border border-ui-theme canvas-checkerboard-sm flex items-center justify-center p-2 mb-2 relative overflow-hidden">
                        {sprite.file ? (
                          <img
                            src={sprite.file}
                            alt={sprite.name}
                            className="max-h-full max-w-full object-contain [image-rendering:pixelated] group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="text-[10px] text-secondary-theme font-mono">No preview</div>
                        )}
                        <span className="absolute bottom-1 right-1 text-[9px] text-primary-theme font-mono retro-inset-well px-1 rounded border border-ui-theme">
                          {itemW}×{itemH}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="w-full">
                        <div className="font-bold text-xs text-primary-theme truncate text-center">
                          {sprite.name}
                        </div>
                        <div className="text-[10px] text-secondary-theme truncate text-center mt-0.5">
                          {sprite.package}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Inspector and Actions */}
          {activeSprite && (
            <div className="w-full md:w-80 p-4 sm:p-5 border-t md:border-t-0 md:border-l border-ui-theme bg-surface-theme flex flex-col justify-between shrink-0 overflow-y-auto no-scrollbar">
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-secondary-theme">
                    Part Inspector
                  </span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded retro-inset-well text-primary-theme">
                    #{activeSprite.index}
                  </span>
                </div>

                {/* Big Preview Box with adaptive checkerboard */}
                <div className="w-full h-44 rounded-xl retro-inset-well canvas-checkerboard flex items-center justify-center p-4 mb-3 border border-ui-theme relative overflow-hidden">
                  {activeSprite.file && (
                    <img
                      src={activeSprite.file}
                      alt={activeSprite.name}
                      className="max-h-full max-w-full object-contain [image-rendering:pixelated] drop-shadow-md"
                    />
                  )}
                  <span className="absolute bottom-1.5 right-2 text-[10px] text-primary-theme font-mono retro-inset-well px-1.5 py-0.5 rounded border border-ui-theme">
                    {currentW} × {currentH} px ({scaleMode})
                  </span>
                </div>

                {/* Name & Package info */}
                <h3 className="font-bold text-sm text-primary-theme mb-0.5">
                  {activeSprite.name}
                </h3>
                <div className="text-xs text-secondary-theme mb-3">
                  {activeSprite.package} · {activeSprite.category}
                </div>

                {/* Metadata details table */}
                <div className="p-3 rounded-xl border border-ui-theme retro-inset-well text-xs space-y-1.5 mb-4">
                  <div className="flex justify-between text-secondary-theme">
                    <span>Active Output Scale:</span>
                    <span className="font-bold text-primary-theme">
                      {scaleMode === '1x' ? '1× Wiki Scale' : '2× Source HD'}
                    </span>
                  </div>
                  <div className="flex justify-between text-secondary-theme">
                    <span>1× Wiki Dimensions:</span>
                    <span className="font-mono text-primary-theme">{activeSprite.wikiDimensions.width} × {activeSprite.wikiDimensions.height} px</span>
                  </div>
                  <div className="flex justify-between text-secondary-theme">
                    <span>2× Source Bounds:</span>
                    <span className="font-mono text-primary-theme">{activeSprite.bounds.width} × {activeSprite.bounds.height} px</span>
                  </div>
                  <div className="flex justify-between text-secondary-theme">
                    <span>Current Canvas:</span>
                    <span className="font-mono text-primary-theme">{canvasWidth} × {canvasHeight} px</span>
                  </div>
                </div>

                {/* Action Feedback Toast */}
                {actionSuccessMsg && (
                  <div className="p-2 mb-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-1.5 animate-fade-in font-medium">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>{actionSuccessMsg}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleInsertLayer}
                    disabled={isProcessing}
                    className="retro-gold-btn w-full py-2 px-3 rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer text-amber-950 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Insert as New Layer ({scaleMode})</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleStampActive}
                    disabled={isProcessing}
                    className="retro-chrome-btn w-full py-2 px-3 rounded-xl text-xs font-semibold text-primary-theme flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Layers className="w-3.5 h-3.5" style={{ color: 'var(--text-accent)' }} />
                    <span>Stamp onto Active Layer ({scaleMode})</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleFloatingReference}
                      className="retro-chrome-btn py-1.5 px-2 rounded-lg text-[11px] font-semibold text-primary-theme flex items-center justify-center gap-1 cursor-pointer"
                      title="Open sprite in floating reference window"
                    >
                      <Eye className="w-3.5 h-3.5" style={{ color: 'var(--text-accent)' }} />
                      <span>Ref Window</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleTraceOverlay}
                      className="retro-chrome-btn py-1.5 px-2 rounded-lg text-[11px] font-semibold text-primary-theme flex items-center justify-center gap-1 cursor-pointer"
                      title="Use sprite as trace overlay over pixel canvas"
                    >
                      <Maximize2 className="w-3.5 h-3.5" style={{ color: 'var(--text-accent)' }} />
                      <span>Trace Ghost</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Close Button at bottom */}
              <div className="pt-4 mt-4 border-t border-ui-theme">
                <button
                  type="button"
                  onClick={onClose}
                  className="retro-chrome-btn w-full py-2 rounded-xl text-xs font-semibold text-primary-theme cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
