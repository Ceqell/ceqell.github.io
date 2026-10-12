/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useSpriteContext } from '../context/SpriteContext';
import { CANVAS_PRESETS } from '../constants/retroDev';
import { 
  StoredProject, 
  getAllProjectsFromDB, 
  deleteProjectFromDB, 
  duplicateProjectInDB, 
  saveProjectToDB, 
  generateProjectId,
  generateProjectThumbnail,
  formatRelativeTime 
} from '../utils/storageDB';

export const ProjectsPage: React.FC = () => {
  const { 
    projectName, 
    canvasWidth, 
    canvasHeight, 
    canvasPresetName, 
    layers, 
    activeLayerId, 
    references, 
    currentColor, 
    bodyOffsetX, 
    bodyOffsetY, 
    loadExistingProject, 
    createNewProject, 
    showAnnouncement 
  } = useSpriteContext();

  const [projects, setProjects] = useState<StoredProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // New Project Form State
  const [newName, setNewName] = useState('My Custom Sprite');
  const [selectedPresetName, setSelectedPresetName] = useState(CANVAS_PRESETS[1]?.name || 'With Headroom / Hats (25 × 32)');
  const [customW, setCustomW] = useState(25);
  const [customH, setCustomH] = useState(32);
  const [includeDefaultRef, setIncludeDefaultRef] = useState(true);

  // Refresh project list from IndexedDB
  const refreshProjects = async () => {
    try {
      setLoading(true);
      const list = await getAllProjectsFromDB();
      setProjects(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProjects();
  }, []);

  // Save current open project to DB
  const handleSaveCurrent = async () => {
    try {
      const proj: StoredProject = {
        id: generateProjectId(),
        name: projectName,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        thumbnailUrl: generateProjectThumbnail(layers, canvasWidth, canvasHeight),
        canvasWidth,
        canvasHeight,
        canvasPresetName,
        layers,
        activeLayerId,
        references,
        selectedColor: currentColor,
        bodyOffsetX,
        bodyOffsetY,
      };
      await saveProjectToDB(proj);
      showAnnouncement(`Saved current project "${projectName}" to database.`);
      refreshProjects();
    } catch (err) {
      console.error(err);
      showAnnouncement('Error saving project to IndexedDB.');
    }
  };

  // Create new project
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createNewProject(newName, selectedPresetName, customW, customH, includeDefaultRef);
    window.location.hash = '#/';
  };

  // Open existing project
  const handleOpen = (project: StoredProject) => {
    loadExistingProject(project);
    window.location.hash = '#/';
  };

  // Duplicate project
  const handleDuplicate = async (id: string) => {
    try {
      await duplicateProjectInDB(id);
      showAnnouncement('Project duplicated.');
      refreshProjects();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete project
  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to permanently delete "${name}"?`)) {
      try {
        await deleteProjectFromDB(id);
        showAnnouncement(`Deleted project "${name}".`);
        refreshProjects();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Import JSON project file
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        if (!json.layers || !Array.isArray(json.layers)) {
          alert('Invalid project file format: missing layers.');
          return;
        }
        const w = json.canvasWidth || json.width || 25;
        const h = json.canvasHeight || json.height || 32;
        const proj: StoredProject = {
          id: generateProjectId(),
          name: json.name || file.name.replace(/\.json$/i, ''),
          createdAt: Date.now(),
          updatedAt: Date.now(),
          thumbnailUrl: generateProjectThumbnail(json.layers, w, h),
          canvasWidth: w,
          canvasHeight: h,
          canvasPresetName: json.canvasPresetName || 'Imported File',
          layers: json.layers,
          activeLayerId: json.activeLayerId || json.layers[0]?.id || 'layer-body',
          references: json.references || [],
          selectedColor: json.selectedColor || '#000000',
          bodyOffsetX: json.bodyOffsetX ?? 2,
          bodyOffsetY: json.bodyOffsetY ?? 4,
        };
        await saveProjectToDB(proj);
        showAnnouncement(`Imported project from ${file.name}.`);
        refreshProjects();
      } catch (err) {
        console.error(err);
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  // Export current project as JSON file
  const handleExportJson = () => {
    const data = {
      name: projectName,
      canvasWidth,
      canvasHeight,
      canvasPresetName,
      layers,
      activeLayerId,
      references,
      selectedColor: currentColor,
      bodyOffsetX,
      bodyOffsetY,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_project.json`;
    a.click();
    URL.revokeObjectURL(url);
    showAnnouncement('Exported project as JSON file.');
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="wiki-container">
      <p className="wiki-breadcrumb">
        <a href="#/">← Return to Sprite Editor</a>
      </p>

      <h1>Project Archive & Document Storage</h1>
      <p>
        Manage all saved Figuray sprite projects stored locally in your browser's IndexedDB database. 
        You can also export project files as portable JSON documents or restore previous backups.
      </p>

      {/* Current Project Quick-Action Box */}
      <div className="wiki-box">
        <div className="wiki-box-header">Currently Active Session</div>
        <p style={{ marginTop: '8px' }}>
          <strong>Active Sprite:</strong> {projectName} ({canvasWidth} × {canvasHeight} pixels, {layers.length} layers)
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" onClick={handleSaveCurrent}>
            [ Save Current Session to Archive ]
          </button>
          <button type="button" onClick={handleExportJson}>
            [ Download Session as .JSON ]
          </button>
        </div>
      </div>

      {/* Create New Project Form */}
      <div className="wiki-box">
        <div className="wiki-box-header">Create New Project</div>
        <form onSubmit={handleCreate} style={{ marginTop: '10px' }}>
          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'inline-block', width: '130px' }}>
              <strong>Project Title:</strong>
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
              style={{ width: '280px' }}
            />
          </div>

          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'inline-block', width: '130px' }}>
              <strong>Canvas Preset:</strong>
            </label>
            <select
              value={selectedPresetName}
              onChange={(e) => setSelectedPresetName(e.target.value)}
            >
              {CANVAS_PRESETS.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name} ({p.width} × {p.height})
                </option>
              ))}
              <option value="custom">Custom Dimensions...</option>
            </select>
          </div>

          {selectedPresetName === 'custom' && (
            <div style={{ marginBottom: '8px', marginLeft: '130px' }}>
              Width:{' '}
              <input
                type="number"
                min="8"
                max="256"
                value={customW}
                onChange={(e) => setCustomW(Number(e.target.value))}
                style={{ width: '60px', marginRight: '10px' }}
              />
              Height:{' '}
              <input
                type="number"
                min="8"
                max="256"
                value={customH}
                onChange={(e) => setCustomH(Number(e.target.value))}
                style={{ width: '60px' }}
              />
            </div>
          )}

          <div style={{ marginBottom: '10px' }}>
            <label>
              <input
                type="checkbox"
                checked={includeDefaultRef}
                onChange={(e) => setIncludeDefaultRef(e.target.checked)}
              />
              Include default community reference turnarounds template (DavidBlxTemplate)
            </label>
          </div>

          <button type="submit">[ Create New Project and Open Editor ]</button>
        </form>
      </div>

      {/* File Import Box */}
      <div className="wiki-box">
        <div className="wiki-box-header">Restore Project from Disk</div>
        <p style={{ marginTop: '8px' }}>
          Upload a previously exported <code>.json</code> Figuray project file:
        </p>
        <input type="file" accept=".json" onChange={handleImportJson} />
      </div>

      {/* Saved Projects Table */}
      <h2>Saved Archive Records ({projects.length})</h2>
      <div style={{ marginBottom: '10px' }}>
        <label>
          <strong>Search Records: </strong>
          <input
            type="text"
            placeholder="Filter projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '220px' }}
          />
        </label>
      </div>

      {loading ? (
        <p>Loading projects from IndexedDB database...</p>
      ) : filteredProjects.length === 0 ? (
        <p>No projects found matching the query.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th style={{ width: '50px' }}>Preview</th>
              <th>Project Name</th>
              <th>Dimensions</th>
              <th>Layers</th>
              <th>Last Modified</th>
              <th style={{ width: '190px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map((proj) => (
              <tr key={proj.id}>
                <td style={{ textAlign: 'center' }}>
                  {proj.thumbnailUrl ? (
                    <img
                      src={proj.thumbnailUrl}
                      alt={proj.name}
                      style={{
                        width: '32px',
                        height: '32px',
                        imageRendering: 'pixelated',
                        border: '1px solid #776655',
                        backgroundColor: '#fff',
                      }}
                    />
                  ) : (
                    <span>[N/A]</span>
                  )}
                </td>
                <td>
                  <strong>{proj.name}</strong>
                </td>
                <td>{proj.canvasWidth} × {proj.canvasHeight}</td>
                <td>{proj.layers?.length || 1}</td>
                <td>{formatRelativeTime(proj.updatedAt)}</td>
                <td>
                  <button type="button" onClick={() => handleOpen(proj)} style={{ marginRight: '4px' }}>
                    Open
                  </button>
                  <button type="button" onClick={() => handleDuplicate(proj.id)} style={{ marginRight: '4px' }}>
                    Duplicate
                  </button>
                  <button type="button" onClick={() => handleDelete(proj.id, proj.name)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
