import React from 'react';
import { X, BookOpen, Layers, Sparkles, CheckCircle2 } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadTemplate: (templateId: string) => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({
  isOpen,
  onClose,
  onLoadTemplate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="bg-surface-theme border border-ui-theme rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh] text-primary-theme">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-ui-theme bg-surface-raised-theme">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" style={{ color: 'var(--text-accent)' }} />
            <h2 className="text-base font-bold text-primary-theme">Character Sprite Dimensions & Guide</h2>
          </div>
          <button
            onClick={onClose}
            className="retro-chrome-btn p-1.5 rounded-lg text-primary-theme cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-secondary-theme text-xs leading-relaxed">
          {/* Official Wiki Quote */}
          <div className="p-3.5 retro-inset-well rounded-xl space-y-1.5 border-l-4" style={{ borderLeftColor: 'var(--text-accent)' }}>
            <div className="font-bold text-sm" style={{ color: 'var(--text-accent)' }}>Official Wiki Instructions</div>
            <p className="italic text-primary-theme">
              "The process of making a character sprite's body parts are very easy. 
              The legs and torso are 11x10 pixels, the arms are 5x10 and the head is 9x8. 
              After you are done with the body, design on the accessories begins."
            </p>
          </div>

          {/* Dimension Breakdown Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 retro-inset-well rounded-xl">
              <div className="text-[10px] uppercase font-mono font-bold text-amber-500">Head</div>
              <div className="text-xl font-bold font-mono text-primary-theme mt-1">9 × 8</div>
              <div className="text-[11px] text-secondary-theme mt-1">
                Contoured circle (3px top, 7px row 2, 9px center, 7px row 7, 5px neck).
              </div>
            </div>

            <div className="p-3 retro-inset-well rounded-xl">
              <div className="text-[10px] uppercase font-mono font-bold text-cyan-500">Torso</div>
              <div className="text-xl font-bold font-mono text-primary-theme mt-1">11 × 10</div>
              <div className="text-[11px] text-secondary-theme mt-1">
                Centered body block (cols 11 to 20 vertically in the wiki sheet).
              </div>
            </div>

            <div className="p-3 retro-inset-well rounded-xl">
              <div className="text-[10px] uppercase font-mono font-bold text-amber-500">Arms (L & R)</div>
              <div className="text-xl font-bold font-mono text-primary-theme mt-1">5 × 10 each</div>
              <div className="text-[11px] text-secondary-theme mt-1">
                Left (5px) and Right (5px), aligned with torso top and bottom.
              </div>
            </div>

            <div className="p-3 retro-inset-well rounded-xl">
              <div className="text-[10px] uppercase font-mono font-bold text-emerald-500">Legs</div>
              <div className="text-xl font-bold font-mono text-primary-theme mt-1">11 × 10</div>
              <div className="text-[11px] text-secondary-theme mt-1">
                5px Left leg + 1px center seam (darker shade) + 5px Right leg.
              </div>
            </div>
          </div>

          {/* Workflow Steps */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-primary-theme">How to Design Authentic Retro Dev Sprites:</h3>
            
            <div className="flex gap-3 items-start">
              <div className="w-5 h-5 rounded-full bg-amber-500 text-neutral-950 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                1
              </div>
              <div>
                <span className="font-semibold text-primary-theme">Start with the Body Base:</span> Choose a starter like the Classic Noob, Guest, or Blank Wireframe, or turn on the <span className="font-mono font-bold" style={{ color: 'var(--text-accent)' }}>Guide Overlay</span> to see the exact bounding boxes and numbers.
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="w-5 h-5 rounded-full bg-amber-500 text-neutral-950 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                2
              </div>
              <div>
                <span className="font-semibold text-primary-theme">Add Separate Layers:</span> Keep your body base on Layer 1, face/eyes on Layer 2, and design hats, hair, belts, wings, or weapons on separate layers above so you can easily toggle and edit them without overwriting body pixels!
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="w-5 h-5 rounded-full bg-amber-500 text-neutral-950 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                3
              </div>
              <div>
                <span className="font-semibold text-primary-theme">Upload Reference Images & Trace:</span> Upload reference avatars, Ayray public works, or iBot package screenshots. Toggle <span className="font-mono font-bold" style={{ color: 'var(--text-accent)' }}>"Trace Mode"</span> to project the reference directly onto the canvas with adjustable opacity to trace pixel by pixel!
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="w-5 h-5 rounded-full bg-amber-500 text-neutral-950 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                4
              </div>
              <div>
                <span className="font-semibold text-primary-theme">Use Symmetry & Shading:</span> Toggle the <span className="font-mono font-bold" style={{ color: 'var(--text-accent)' }}>Mirror / Symmetry</span> tool for hats and faces, and use the <span className="font-mono font-bold" style={{ color: 'var(--text-accent)' }}>Lighten / Darken (Dodge & Burn)</span> tools to add classic retro highlights and creases.
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="w-5 h-5 rounded-full bg-amber-500 text-neutral-950 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                5
              </div>
              <div>
                <span className="font-semibold text-primary-theme">Export at Any Resolution:</span> Export crystal-clear PNG files at 1x (original retro size), 16x (336×448px), or custom HD dimensions with transparent background ready for games, Roblox, Discord, or web use!
              </div>
            </div>
          </div>

          {/* Quick Starter Templates */}
          <div className="pt-2 border-t border-ui-theme">
            <div className="text-xs font-semibold text-primary-theme mb-2">Load Quick Preset Template:</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  onLoadTemplate('noob');
                  onClose();
                }}
                className="retro-chrome-btn px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
              >
                Classic Noob (1000.png)
              </button>
              <button
                onClick={() => {
                  onLoadTemplate('guest');
                  onClose();
                }}
                className="retro-chrome-btn px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
              >
                Classic Guest
              </button>
              <button
                onClick={() => {
                  onLoadTemplate('bluudude');
                  onClose();
                }}
                className="retro-chrome-btn px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
              >
                Forsaken Bluudude
              </button>
              <button
                onClick={() => {
                  onLoadTemplate('wireframe');
                  onClose();
                }}
                className="retro-chrome-btn px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
              >
                Blank Wireframe Mannequin
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-ui-theme bg-surface-raised-theme flex justify-end">
          <button
            onClick={onClose}
            className="retro-gold-btn px-4 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
          >
            Got it, Let's Build!
          </button>
        </div>
      </div>
    </div>
  );
};
