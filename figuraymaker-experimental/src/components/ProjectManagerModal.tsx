import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Plus, 
  FolderOpen, 
  MoreVertical, 
  Download, 
  Copy, 
  Trash2, 
  Clock, 
  Layers as LayersIcon, 
  Maximize2, 
  Info,
  Sparkles,
  Search
} from 'lucide-react';
import { CANVAS_PRESETS } from '../constants/retroDev';
import { 
  StoredProject, 
  getAllProjectsFromDB, 
  deleteProjectFromDB, 
  duplicateProjectInDB, 
  formatRelativeTime 
} from '../utils/storageDB';

interface ProjectManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProject: (project: StoredProject) => void;
  onCreateNewProject: (name: string, presetName: string, customWidth?: number, customHeight?: number, includeDefaultRef?: boolean) => void;
  onImportJsonFile: (file: File) => void;
  onExportJsonSuccess?: (filename: string) => void;
}

export const ProjectManagerModal: React.FC<ProjectManagerModalProps> = ({
  isOpen,
  onClose,
  onSelectProject,
  onCreateNewProject,
  onImportJsonFile,
  onExportJsonSuccess,
}) => {
  const [projects, setProjects] = useState<StoredProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // New Project Form State
  const [newName, setNewName] = useState('My Sprite');
  const [selectedPresetName, setSelectedPresetName] = useState(CANVAS_PRESETS[1]?.name || 'With Headroom / Hats (25 × 32)');
  const [customWidth, setCustomWidth] = useState(32);
  const [customHeight, setCustomHeight] = useState(32);
  const [includeDefaultReference, setIncludeDefaultReference] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('figuray_default_reference_enabled');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const handleToggleDefaultRef = (checked: boolean) => {
    setIncludeDefaultReference(checked);
    try {
      localStorage.setItem('figuray_default_reference_enabled', String(checked));
    } catch {}
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load projects from IndexedDB
  const refreshProjects = async () => {
    try {
      setLoading(true);
      const list = await getAllProjectsFromDB();
      setProjects(list);
    } catch (err) {
      console.error('Failed to load projects from storage:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshProjects();
      setOpenMenuId(null);
    }
  }, [isOpen]);

  // Close menus on outside click or escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (openMenuId) {
          setOpenMenuId(null);
        } else {
          onClose();
        }
      }
    };

    const handleClickOutside = () => {
      setOpenMenuId(null);
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('click', handleClickOutside);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen, openMenuId, onClose]);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim() || 'Untitled Sprite';
    if (selectedPresetName === 'custom') {
      const clampedW = Math.max(8, Math.min(256, Math.round(customWidth)));
      const clampedH = Math.max(8, Math.min(256, Math.round(customHeight)));
      onCreateNewProject(trimmed, 'custom', clampedW, clampedH, includeDefaultReference);
    } else {
      onCreateNewProject(trimmed, selectedPresetName, undefined, undefined, includeDefaultReference);
    }
    onClose();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJsonFile(file);
      onClose();
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownloadJson = (project: StoredProject, e: React.MouseEvent) => {
    e.stopPropagation();
    const safeName = (project.name || 'sprite-project').toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = `${safeName}.json`;
    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setOpenMenuId(null);
    onExportJsonSuccess?.(`${safeName}.json`);
  };

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await duplicateProjectInDB(id);
      await refreshProjects();
    } catch (err) {
      console.error('Failed to duplicate project:', err);
    }
    setOpenMenuId(null);
  };

  const handleDelete = async (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${name}" from local browser storage? This cannot be undone.`)) {
      try {
        await deleteProjectFromDB(id);
        await refreshProjects();
      } catch (err) {
        console.error('Failed to delete project:', err);
      }
    }
    setOpenMenuId(null);
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-[880px] max-w-[96vw] max-h-[92vh] bg-surface-theme border border-ui-theme rounded-2xl shadow-2xl overflow-hidden flex flex-col text-primary-theme transition-all duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-ui-theme bg-surface-raised-theme shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg retro-inset-well flex items-center justify-center" style={{ color: 'var(--text-accent)' }}>
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-primary-theme flex items-center gap-2">
                <span>Project Manager & Local Saves</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded retro-inset-well" style={{ color: 'var(--text-accent)' }}>
                  Saves
                </span>
              </h2>
              <p className="text-[11px] text-secondary-theme">
                Manage, export, backup, and switch between your local sprite creations
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

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 flex flex-col gap-4 overflow-y-auto no-scrollbar flex-1">
          {/* Top Actions: Create New Project + Import from File */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 shrink-0">
            {/* Create New Project Form */}
            <form 
              onSubmit={handleCreate} 
              className="md:col-span-2 retro-inset-well rounded-xl p-3 sm:p-3.5 flex flex-col justify-between gap-3"
            >
              <div className="flex items-center gap-2 pb-1 border-b border-ui-theme">
                <Sparkles className="w-4 h-4" style={{ color: 'var(--text-accent)' }} />
                <span className="text-xs font-bold uppercase tracking-wider text-primary-theme">
                  Create New Project
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] uppercase font-bold text-secondary-theme block mb-1">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Knight Avatar"
                    className="w-full bg-surface-raised-theme text-primary-theme font-sans text-xs px-2.5 py-1.5 rounded-lg border border-ui-theme outline-none focus:border-[var(--text-accent)] transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-secondary-theme block mb-1">
                    Canvas Dimensions
                  </label>
                  <select
                    value={selectedPresetName}
                    onChange={(e) => setSelectedPresetName(e.target.value)}
                    className="w-full bg-surface-raised-theme text-primary-theme font-mono text-xs px-2 py-1.5 rounded-lg border border-ui-theme outline-none focus:border-[var(--text-accent)] cursor-pointer"
                  >
                    {CANVAS_PRESETS.map(preset => (
                      <option key={preset.name} value={preset.name}>
                        {preset.name}
                      </option>
                    ))}
                    <option value="custom">Custom Size ({customWidth} × {customHeight})...</option>
                  </select>
                </div>
              </div>

              {selectedPresetName === 'custom' && (
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-secondary-theme font-mono">W:</span>
                    <input
                      type="number"
                      min={8}
                      max={256}
                      value={customWidth}
                      onChange={(e) => setCustomWidth(Math.max(8, Math.min(256, parseInt(e.target.value) || 8)))}
                      className="w-16 bg-surface-raised-theme text-primary-theme font-mono text-xs px-2 py-1 rounded border border-ui-theme"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-secondary-theme font-mono">H:</span>
                    <input
                      type="number"
                      min={8}
                      max={256}
                      value={customHeight}
                      onChange={(e) => setCustomHeight(Math.max(8, Math.min(256, parseInt(e.target.value) || 8)))}
                      className="w-16 bg-surface-raised-theme text-primary-theme font-mono text-xs px-2 py-1 rounded border border-ui-theme"
                    />
                  </div>
                  <span className="text-[10px] text-secondary-theme font-mono">(8 to 256px)</span>
                </div>
              )}

              {/* Show default reference image toggle */}
              <div className="pt-0.5">
                <label className="flex items-start gap-2 cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    checked={includeDefaultReference}
                    onChange={(e) => handleToggleDefaultRef(e.target.checked)}
                    className="mt-0.5 accent-[var(--text-accent)] rounded cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <span className="text-[11px] text-primary-theme font-medium leading-tight group-hover:underline">
                      Show default reference image (recommended for new users)
                    </span>
                    <span className="text-[10px] text-secondary-theme leading-tight mt-0.5">
                      Includes character package references (Robloxian 2.0, skeleton, iBot, Peter, color templates)
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="retro-chrome-btn px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
                  style={{ color: 'var(--text-accent)' }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Start Creating</span>
                </button>
              </div>
            </form>

            {/* Open / Import from Computer File */}
            <div className="retro-inset-well rounded-xl p-3 sm:p-3.5 flex flex-col justify-between gap-2.5">
              <div className="flex items-center gap-2 pb-1 border-b border-ui-theme">
                <FolderOpen className="w-4 h-4" style={{ color: 'var(--text-accent)' }} />
                <span className="text-xs font-bold uppercase tracking-wider text-primary-theme">
                  Open Project File
                </span>
              </div>

              <p className="text-[11px] text-secondary-theme leading-relaxed">
                Load a previously saved <span className="font-mono text-primary-theme font-semibold">.JSON</span> file from your computer or offline storage.
              </p>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="retro-chrome-btn w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-xs text-primary-theme active:scale-95 transition-all mt-auto"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Browse .JSON File...</span>
              </button>

              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileInputChange} 
                accept=".json" 
                className="hidden" 
              />
            </div>
          </div>

          {/* Pixlr-style Info Banner */}
          <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-surface-raised-theme border border-ui-theme text-[11px] text-secondary-theme shrink-0">
            <Info className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--text-accent)' }} />
            <div className="leading-relaxed">
              <strong className="text-primary-theme">Automatic Local Storage:</strong> Projects are saved automatically to your browser’s IndexedDB cache whenever you draw. Download your artwork as a <strong className="font-mono text-primary-theme">.JSON</strong> file if you want to store it long-term or transfer to another computer.
            </div>
          </div>

          {/* Local Projects Shelf / Grid */}
          <div className="flex flex-col gap-2.5 flex-1 min-h-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" style={{ color: 'var(--text-accent)' }} />
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary-theme">
                  Local Projects ({projects.length})
                </h3>
              </div>

              {projects.length > 0 && (
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-secondary-theme" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search projects..."
                    className="bg-surface-raised-theme text-primary-theme text-xs pl-7 pr-2.5 py-1 rounded-lg border border-ui-theme outline-none focus:border-[var(--text-accent)] w-36 sm:w-48"
                  />
                </div>
              )}
            </div>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-secondary-theme text-xs gap-2">
                <div className="w-5 h-5 border-2 border-[var(--text-accent)] border-t-transparent rounded-full animate-spin" />
                <span>Accessing local storage...</span>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="py-12 px-4 rounded-xl border border-dashed border-ui-theme flex flex-col items-center justify-center text-center gap-2 text-secondary-theme">
                <Maximize2 className="w-8 h-8 opacity-30" />
                {searchQuery ? (
                  <p className="text-xs">No projects found matching &ldquo;{searchQuery}&rdquo;</p>
                ) : (
                  <>
                    <p className="text-xs font-medium text-primary-theme">No saved projects found</p>
                    <p className="text-[11px] max-w-sm">
                      Start creating your first sprite above, or import an existing project file from your computer.
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => {
                      onSelectProject(project);
                      onClose();
                    }}
                    className="group relative bg-surface-theme hover:bg-surface-raised-theme border border-ui-theme hover:border-[var(--text-accent)] rounded-xl p-2.5 flex flex-col gap-2 cursor-pointer transition-all hover:shadow-lg active:scale-[0.99]"
                  >
                    {/* Thumbnail Viewport with Checkerboard */}
                    <div className="w-full aspect-square rounded-lg bg-surface-raised-theme border border-ui-theme overflow-hidden canvas-checkerboard-sm flex items-center justify-center relative p-2">
                      {project.thumbnailUrl ? (
                        <img 
                          src={project.thumbnailUrl} 
                          alt={project.name} 
                          className="w-full h-full object-contain filter drop-shadow-sm transition-transform group-hover:scale-105"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      ) : (
                        <Maximize2 className="w-6 h-6 text-secondary-theme opacity-30" />
                      )}

                      {/* 3-Dots Kebab Menu Trigger Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === project.id ? null : project.id);
                        }}
                        className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs opacity-75 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                        title="Project options"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>

                      {/* Floating Kebab Popover Menu */}
                      {openMenuId === project.id && (
                        <div 
                          onClick={(e) => e.stopPropagation()}
                          className="absolute top-8 right-1.5 z-30 w-38 bg-surface-theme border border-ui-theme rounded-lg shadow-2xl p-1 text-xs flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-100 text-primary-theme"
                          style={{
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 0 0 1px var(--border-ui)'
                          }}
                        >
                          <button
                            type="button"
                            onClick={(e) => handleDownloadJson(project, e)}
                            className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-surface-raised-theme text-left cursor-pointer transition-colors"
                          >
                            <Download className="w-3.5 h-3.5 text-secondary-theme" />
                            <span>Download JSON</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDuplicate(project.id, e)}
                            className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-surface-raised-theme text-left cursor-pointer transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5 text-secondary-theme" />
                            <span>Duplicate</span>
                          </button>
                          <div className="h-[1px] bg-ui-theme my-0.5" />
                          <button
                            type="button"
                            onClick={(e) => handleDelete(project.id, project.name, e)}
                            className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-red-500/10 text-red-500 hover:text-red-600 text-left cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Metadata Card Footer */}
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-primary-theme truncate group-hover:text-[var(--text-accent)] transition-colors" title={project.name}>
                          {project.name || 'Untitled'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-secondary-theme font-mono">
                        <span>{project.canvasWidth} × {project.canvasHeight}</span>
                        <span>{formatRelativeTime(project.updatedAt)}</span>
                      </div>

                      <div className="flex items-center gap-1 mt-0.5 text-[9.5px] text-secondary-theme font-mono">
                        <LayersIcon className="w-2.5 h-2.5 opacity-60" />
                        <span>{project.layers?.length || 1} {project.layers?.length === 1 ? 'layer' : 'layers'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
