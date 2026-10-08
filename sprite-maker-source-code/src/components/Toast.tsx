import React, { useEffect, useState } from 'react';
import { CheckCircle2, Download, FileText, X, Copy, AlertTriangle, Sparkles, Layers } from 'lucide-react';

export interface ToastItem {
  id: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
  icon?: 'png' | 'json' | 'check' | 'copy' | 'sparkles' | 'layer';
  duration?: number;
}

interface ToastProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div 
      className="fixed bottom-5 right-5 z-[70] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none select-none px-3 sm:px-0"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
};

const FADE_DURATION = 500;

const ToastCard: React.FC<{ toast: ToastItem; onDismiss: () => void }> = ({ toast, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);
  const duration = toast.duration || 3200;

  useEffect(() => {
    // Trigger fade-out animation before total duration expires
    const fadeTimer = setTimeout(() => {
      setIsExiting(true);
    }, Math.max(400, duration - FADE_DURATION));

    // Remove from state after fade-out transition finishes
    const dismissTimer = setTimeout(() => {
      onDismiss();
    }, duration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(dismissTimer);
    };
  }, [duration, onDismiss]);

  const handleDismiss = () => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(onDismiss, 300);
  };

  const getIcon = () => {
    if (toast.icon === 'png') {
      return (
        <div className="w-8 h-8 rounded-lg retro-inset-well flex items-center justify-center shrink-0 text-amber-500 shadow-inner">
          <Download className="w-4 h-4 stroke-[2.5]" />
        </div>
      );
    }
    if (toast.icon === 'json') {
      return (
        <div className="w-8 h-8 rounded-lg retro-inset-well flex items-center justify-center shrink-0 text-sky-400 shadow-inner">
          <FileText className="w-4 h-4 stroke-[2.5]" />
        </div>
      );
    }
    if (toast.icon === 'copy') {
      return (
        <div className="w-8 h-8 rounded-lg retro-inset-well flex items-center justify-center shrink-0 text-emerald-400 shadow-inner">
          <Copy className="w-4 h-4 stroke-[2.5]" />
        </div>
      );
    }
    if (toast.icon === 'sparkles') {
      return (
        <div className="w-8 h-8 rounded-lg retro-inset-well flex items-center justify-center shrink-0 text-amber-400 shadow-inner">
          <Sparkles className="w-4 h-4 stroke-[2.5]" />
        </div>
      );
    }
    if (toast.icon === 'layer') {
      return (
        <div className="w-8 h-8 rounded-lg retro-inset-well flex items-center justify-center shrink-0 text-indigo-400 shadow-inner">
          <Layers className="w-4 h-4 stroke-[2.5]" />
        </div>
      );
    }
    if (toast.type === 'error') {
      return (
        <div className="w-8 h-8 rounded-lg retro-inset-well flex items-center justify-center shrink-0 text-red-400 shadow-inner">
          <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-lg retro-inset-well flex items-center justify-center shrink-0 text-emerald-400 shadow-inner">
        <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
      </div>
    );
  };

  return (
    <div 
      className={`pointer-events-auto bg-surface-raised-theme border border-ui-theme text-primary-theme rounded-xl shadow-2xl p-3 flex flex-col relative overflow-hidden backdrop-blur-md transition-all duration-500 ease-out ${
        isExiting 
          ? 'opacity-0 translate-y-2 scale-95 pointer-events-none' 
          : 'opacity-100 translate-y-0 scale-100 animate-in fade-in slide-in-from-bottom-3 duration-200'
      }`}
      style={{
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 0 1px var(--border-ui)'
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          {getIcon()}
          <div className="flex flex-col min-w-0 pt-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-primary-theme tracking-tight truncate">
                {toast.title}
              </span>
              <span 
                className="text-[9px] font-mono font-bold px-1 py-0.2 rounded uppercase retro-inset-well shrink-0" 
                style={{ color: 'var(--text-accent)' }}
              >
                Done
              </span>
            </div>
            {toast.message && (
              <p className="text-[11px] text-secondary-theme leading-tight mt-0.5 truncate font-mono">
                {toast.message}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={handleDismiss}
          type="button"
          className="retro-chrome-btn p-1 rounded-md text-secondary-theme hover:text-primary-theme cursor-pointer shrink-0 transition-colors"
          title="Dismiss notification"
          aria-label="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
