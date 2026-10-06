import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface CollapsibleSectionProps {
  id: string;
  title: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  headerActions?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  maxContentHeight?: string;
  className?: string;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  id,
  title,
  icon,
  badge,
  headerActions,
  defaultOpen = true,
  children,
  maxContentHeight,
  className = '',
}) => {
  const storageKey = `figuray_panel_${id}_open`;
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved !== null ? saved === 'true' : defaultOpen;
    } catch {
      return defaultOpen;
    }
  });

  const toggle = () => {
    setIsOpen(prev => {
      const next = !prev;
      try {
        localStorage.setItem(storageKey, String(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  return (
    <div 
      className={`shrink-0 w-full rounded-xl border border-ui-theme bg-surface-theme shadow-md overflow-hidden transition-all ${className}`}
    >
      {/* Accordion Header */}
      <div 
        onClick={toggle}
        className="flex items-center justify-between px-3 py-2 cursor-pointer select-none bg-surface-raised-theme hover:brightness-105 border-b border-ui-theme transition-colors"
        title={isOpen ? `Collapse ${title}` : `Expand ${title}`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {icon && <span className="shrink-0" style={{ color: 'var(--text-accent)' }}>{icon}</span>}
          <span className="font-bold text-xs text-primary-theme truncate">{title}</span>
          {badge && <span className="shrink-0">{badge}</span>}
        </div>

        <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
          {headerActions}
          <button 
            type="button"
            onClick={toggle}
            className="retro-chrome-btn p-1 rounded text-primary-theme cursor-pointer ml-0.5"
            aria-label={isOpen ? `Collapse ${title}` : `Expand ${title}`}
            title={isOpen ? `Collapse ${title}` : `Expand ${title}`}
          >
            <ChevronDown 
              className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`} 
            />
          </button>
        </div>
      </div>

      {/* Accordion Content Body */}
      {isOpen && (
        <div className={`overflow-y-auto overscroll-contain ${maxContentHeight || ''}`}>
          {children}
        </div>
      )}
    </div>
  );
};
