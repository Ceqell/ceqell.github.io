/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSpriteContext } from '../context/SpriteContext';

export const LayersPanel: React.FC = () => {
  const {
    layers,
    activeLayerId,
    setActiveLayerId,
    addLayer,
    deleteLayer,
    duplicateLayer,
    mergeDownLayer,
    moveLayer,
    toggleLayerVisibility,
    toggleLayerLock,
    changeLayerOpacity,
    renameLayer,
  } = useSpriteContext();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');

  const handleStartRename = (id: string, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };

  const handleSaveRename = (id: string) => {
    if (editingName.trim()) {
      renameLayer(id, editingName.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="wiki-box" style={{ marginBottom: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="wiki-box-header">
        <span>Layers Hierarchy ({layers.length})</span>
        <button type="button" onClick={addLayer}>
          + New Layer
        </button>
      </div>

      <table style={{ margin: '8px 0 0 0', fontSize: '13px' }}>
        <thead>
          <tr>
            <th style={{ width: '25px' }}>Sel</th>
            <th>Layer Name</th>
            <th style={{ width: '35px' }}>Vis</th>
            <th style={{ width: '35px' }}>Lock</th>
            <th style={{ width: '55px' }}>Opacity</th>
            <th style={{ width: '130px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* Display from top to bottom (reversed order so topmost layer is on top) */}
          {[...layers].reverse().map((layer, reverseIndex) => {
            const actualIndex = layers.length - 1 - reverseIndex;
            const isSelected = layer.id === activeLayerId;
            const isEditing = editingId === layer.id;

            return (
              <tr
                key={layer.id}
                style={{
                  backgroundColor: isSelected ? '#dfd2c0' : 'transparent',
                  fontWeight: isSelected ? 'bold' : 'normal',
                }}
              >
                <td style={{ textAlign: 'center' }}>
                  <input
                    type="radio"
                    name="activeLayerRadio"
                    checked={isSelected}
                    onChange={() => setActiveLayerId(layer.id)}
                    style={{ margin: 0 }}
                  />
                </td>

                <td>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={() => handleSaveRename(layer.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(layer.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      autoFocus
                      style={{ width: '110px' }}
                    />
                  ) : (
                    <span
                      onClick={() => setActiveLayerId(layer.id)}
                      onDoubleClick={() => handleStartRename(layer.id, layer.name)}
                      style={{ cursor: 'pointer' }}
                      title="Double-click to rename"
                    >
                      {layer.name}
                    </span>
                  )}
                </td>

                <td style={{ textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={layer.visible}
                    onChange={() => toggleLayerVisibility(layer.id)}
                    title="Toggle Visibility"
                  />
                </td>

                <td style={{ textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={layer.locked}
                    onChange={() => toggleLayerLock(layer.id)}
                    title="Toggle Lock"
                  />
                </td>

                <td>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="5"
                    value={Math.round(layer.opacity * 100)}
                    onChange={(e) => changeLayerOpacity(layer.id, Number(e.target.value) / 100)}
                    style={{ width: '45px', padding: '1px' }}
                  />%
                </td>

                <td>
                  <button
                    type="button"
                    disabled={actualIndex === layers.length - 1}
                    onClick={() => moveLayer(layer.id, 'up')}
                    style={{ padding: '0 3px', marginRight: '2px' }}
                    title="Move Layer Up"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    disabled={actualIndex === 0}
                    onClick={() => moveLayer(layer.id, 'down')}
                    style={{ padding: '0 3px', marginRight: '2px' }}
                    title="Move Layer Down"
                  >
                    ▼
                  </button>
                  <button
                    type="button"
                    onClick={() => duplicateLayer(layer.id)}
                    style={{ padding: '0 3px', marginRight: '2px' }}
                    title="Duplicate Layer"
                  >
                    Dup
                  </button>
                  <button
                    type="button"
                    disabled={actualIndex === 0}
                    onClick={() => mergeDownLayer(layer.id)}
                    style={{ padding: '0 3px', marginRight: '2px' }}
                    title="Merge Down"
                  >
                    Mrg
                  </button>
                  <button
                    type="button"
                    disabled={layers.length <= 1}
                    onClick={() => deleteLayer(layer.id)}
                    style={{ padding: '0 3px' }}
                    title="Delete Layer"
                  >
                    Del
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
