import React, { useState, useMemo, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Check, 
  CheckCircle2
} from 'lucide-react';
import { REVAMPED_STARTER_TEMPLATES, RevampedStarter, ScaleMode } from '../utils/spriteAtlas';

interface StarterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStarter: (starter: RevampedStarter, autoResizeCanvas: boolean, scaleMode: ScaleMode) => void;
  currentCanvasWidth: number;
  currentCanvasHeight: number;
}

export const StarterModal: React.FC<StarterModalProps> = ({
  isOpen,
  onClose,
  onSelectStarter,
  currentCanvasWidth,
  currentCanvasHeight,
}) => {
  const [selectedStarterId, setSelectedStarterId] = useState<string>(REVAMPED_STARTER_TEMPLATES[0].id);
  const [autoResizeCanvas, setAutoResizeCanvas] = useState<boolean>(true);
  const [scaleMode, setScaleMode] = useState<ScaleMode>('1x'); // 1x default canonical wiki scale
  const [selectedPackageFilter, setSelectedPackageFilter] = useState<string>('all');

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

  const packages = useMemo(() => {
    const set = new Set<string>();
    REVAMPED_STARTER_TEMPLATES.forEach(t => set.add(t.package));
    return ['all', ...Array.from(set)];
  }, []);

  const filteredStarters = useMemo(() => {
    if (selectedPackageFilter === 'all') return REVAMPED_STARTER_TEMPLATES;
    return REVAMPED_STARTER_TEMPLATES.filter(t => t.package === selectedPackageFilter);
  }, [selectedPackageFilter]);

  const activeStarter = useMemo(() => {
    return REVAMPED_STARTER_TEMPLATES.find(t => t.id === selectedStarterId) || REVAMPED_STARTER_TEMPLATES[0];
  }, [selectedStarterId]);

  if (!isOpen) return null;

  const currentRecommendedW = scaleMode === '1x' ? activeStarter.recommendedWidth1x : activeStarter.recommendedWidth2x;
  const currentRecommendedH = scaleMode === '1x' ? activeStarter.recommendedHeight1x : activeStarter.recommendedHeight2x;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-[920px] max-w-[96vw] max-h-[92vh] bg-surface-theme border border-ui-theme rounded-2xl shadow-2xl overflow-hidden flex flex-col text-primary-theme transition-colors"
      >
        {/* Title Bar with Retro Window Chrome */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-ui-theme bg-surface-raised-theme shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg retro-inset-well flex items-center justify-center" style={{ color: 'var(--text-accent)' }}>
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-primary-theme flex items-center gap-2">
                <span>Starter Characters &amp; Templates</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded retro-inset-well" style={{ color: 'var(--text-accent)' }}>
                  Templates
                </span>
              </h2>
              <p className="text-[11px] text-secondary-theme">
                Hand-crafted canonical 21×28 and 42×56 starter bases, wireframes, and packages
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

        {/* Toolbar: Category Filters & Scale Mode Segmented Toggle */}
        <div className="px-4 py-2.5 bg-surface-theme border-b border-ui-theme flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          {/* Package filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 header-scrollbar">
            {packages.map(pkg => {
              const isPkgActive = selectedPackageFilter === pkg;
              return (
                <button
                  key={pkg}
                  onClick={() => setSelectedPackageFilter(pkg)}
                  className={`retro-chrome-btn px-2.5 py-1 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                    isPkgActive
                      ? 'active font-bold'
                      : 'text-secondary-theme hover:text-primary-theme'
                  }`}
                  style={isPkgActive ? { color: 'var(--text-accent)' } : undefined}
                >
                  {pkg === 'all' ? 'All Packages' : pkg}
                </button>
              );
            })}
          </div>

          {/* Scale Mode Segmented Toggle (1x Canonical Default vs 2x HD Source) */}
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
              1× Wiki (Default)
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
        </div>

        {/* Content Body: Left Shelf + Right Inspector */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row min-h-0">
          {/* Left: Starters Grid / List */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredStarters.map(starter => {
                const isSelected = starter.id === selectedStarterId;
                const spriteFile = starter.spriteIndex > 0 
                  ? `/sprites/${String(starter.spriteIndex).padStart(2, '0')}_${
                      starter.id === 'starter-noob-1' ? 'noob1_0' :
                      starter.id === 'starter-noob-2' ? 'noobrobloxian2_0' :
                      starter.id === 'starter-ibot' ? 'ibot' :
                      starter.id === 'starter-peter' ? 'peter' :
                      starter.id === 'starter-skelly-brown' ? 'skeletonbrown' :
                      starter.id === 'starter-skelly-white' ? 'skeletonwhite' :
                      starter.id === 'starter-wireframe-r6' ? 'R6wireframe' :
                      starter.id === 'starter-wireframe-r15' ? 'R15Robloxian2_0PackageWireframe' : ''
                    }.png`
                  : null;

                const displayW = scaleMode === '1x' ? starter.recommendedWidth1x : starter.recommendedWidth2x;
                const displayH = scaleMode === '1x' ? starter.recommendedHeight1x : starter.recommendedHeight2x;

                return (
                  <div
                    key={starter.id}
                    onClick={() => setSelectedStarterId(starter.id)}
                    className={`group p-3 rounded-xl border text-left cursor-pointer transition-all flex gap-3 items-center relative ${
                      isSelected
                        ? 'border-2 border-[var(--text-accent)] bg-surface-raised-theme shadow-md ring-1 ring-[var(--text-accent)]/30'
                        : 'border-ui-theme retro-inset-well hover:border-[var(--text-accent)] hover:bg-surface-raised-theme/60'
                    }`}
                  >
                    {/* Sprite Thumbnail preview over adaptive pixel checkerboard */}
                    <div className="w-14 h-16 shrink-0 canvas-checkerboard-sm rounded-lg flex items-center justify-center p-1 border border-ui-theme overflow-hidden shadow-inner">
                      {spriteFile ? (
                        <img
                          src={spriteFile}
                          alt={starter.name}
                          className="max-h-full max-w-full object-contain [image-rendering:pixelated]"
                        />
                      ) : (
                        <div className="text-[10px] text-muted-theme font-mono text-center">Empty</div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-bold text-xs text-primary-theme truncate">
                          {starter.name}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: 'var(--text-accent)' }} />
                        )}
                      </div>
                      <div className="text-[11px] text-secondary-theme line-clamp-2 leading-tight mb-1">
                        {starter.desc}
                      </div>
                      <div className="text-[10px] text-muted-theme font-mono">
                        {displayW} × {displayH} px ({scaleMode})
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Detailed Inspection & Config */}
          <div className="w-full md:w-80 p-4 border-t md:border-t-0 md:border-l border-ui-theme bg-surface-raised-theme flex flex-col justify-between shrink-0 overflow-y-auto">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-secondary-theme mb-2">
                Starter Details
              </div>

              {/* Large Preview Box with Adaptive Checkerboard */}
              <div className="w-full h-44 rounded-xl canvas-checkerboard flex flex-col items-center justify-center p-3 mb-3 border border-ui-theme relative overflow-hidden shadow-inner">
                {activeStarter.spriteIndex > 0 ? (
                  <img
                    src={`/sprites/${String(activeStarter.spriteIndex).padStart(2, '0')}_${
                      activeStarter.id === 'starter-noob-1' ? 'noob1_0' :
                      activeStarter.id === 'starter-noob-2' ? 'noobrobloxian2_0' :
                      activeStarter.id === 'starter-ibot' ? 'ibot' :
                      activeStarter.id === 'starter-peter' ? 'peter' :
                      activeStarter.id === 'starter-skelly-brown' ? 'skeletonbrown' :
                      activeStarter.id === 'starter-skelly-white' ? 'skeletonwhite' :
                      activeStarter.id === 'starter-wireframe-r6' ? 'R6wireframe' :
                      activeStarter.id === 'starter-wireframe-r15' ? 'R15Robloxian2_0PackageWireframe' : ''
                    }.png`}
                    alt={activeStarter.name}
                    className="max-h-full max-w-full object-contain [image-rendering:pixelated] drop-shadow-md"
                  />
                ) : (
                  <div className="text-xs text-muted-theme font-mono">Clean Canvas Grid</div>
                )}
                <span className="absolute bottom-1.5 right-2 text-[10px] font-mono px-2 py-0.5 rounded retro-inset-well text-primary-theme shadow-sm">
                  {currentRecommendedW} × {currentRecommendedH} px ({scaleMode})
                </span>
              </div>

              {/* Details prose */}
              <h3 className="font-bold text-sm text-primary-theme mb-1">
                {activeStarter.name}
              </h3>
              <p className="text-xs text-secondary-theme leading-relaxed mb-3">
                {activeStarter.desc}
              </p>

              <div className="p-3 rounded-xl border border-ui-theme retro-inset-well text-xs space-y-1.5 mb-3">
                <div className="flex justify-between text-secondary-theme">
                  <span>Scale Mode:</span>
                  <span className="font-bold text-primary-theme">
                    {scaleMode === '1x' ? '1× Canonical Wiki (21×28)' : '2× Raw Source HD (42×56)'}
                  </span>
                </div>
                <div className="flex justify-between text-secondary-theme">
                  <span>Package Style:</span>
                  <span className="font-semibold text-primary-theme">{activeStarter.package}</span>
                </div>
                <div className="flex justify-between text-secondary-theme">
                  <span>Current Canvas:</span>
                  <span className="font-mono text-primary-theme">{currentCanvasWidth} × {currentCanvasHeight} px</span>
                </div>
              </div>

              {/* Checkbox: Auto-match recommended canvas dimension */}
              {activeStarter.id !== 'starter-empty' && (
                <label className="flex items-start gap-2.5 text-xs text-primary-theme cursor-pointer select-none retro-inset-well p-2.5 rounded-lg border border-ui-theme">
                  <input
                    type="checkbox"
                    checked={autoResizeCanvas}
                    onChange={(e) => setAutoResizeCanvas(e.target.checked)}
                    className="mt-0.5 rounded text-[var(--text-accent)] cursor-pointer"
                  />
                  <span className="leading-tight">
                    Auto-fit canvas to recommended <strong>{currentRecommendedW} × {currentRecommendedH} px</strong>
                  </span>
                </label>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-3 border-t border-ui-theme mt-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 rounded-lg text-xs font-semibold retro-chrome-btn cursor-pointer text-secondary-theme hover:text-primary-theme"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectStarter(activeStarter, autoResizeCanvas, scaleMode);
                  onClose();
                }}
                className="flex-1 py-2 rounded-lg text-xs font-bold retro-blue-btn text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>Load Starter ({scaleMode})</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
