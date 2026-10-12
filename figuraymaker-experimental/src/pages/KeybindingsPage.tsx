/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useSpriteContext } from '../context/SpriteContext';
import { 
  SHORTCUT_DEFINITIONS, 
  saveKeybindings, 
  resetKeybindingsToDefaults, 
  formatKeyEvent 
} from '../utils/keybindings';
import { ShortcutActionId, KeybindingsMap, ShortcutCategory } from '../types/keybindings';

export const KeybindingsPage: React.FC = () => {
  const { keybindings, setKeybindings, showAnnouncement } = useSpriteContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ShortcutCategory | 'all'>('all');
  const [editingActionId, setEditingActionId] = useState<ShortcutActionId | null>(null);

  const categories: { id: ShortcutCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'All Shortcuts' },
    { id: 'Tools', label: 'Tools' },
    { id: 'Canvas & Overlays', label: 'Canvas & Overlays' },
    { id: 'Selection', label: 'Selection' },
    { id: 'Layers', label: 'Layers' },
    { id: 'History', label: 'History' },
    { id: 'Brushes', label: 'Brushes' },
    { id: 'Panels & Windows', label: 'Panels & Windows' },
  ];

  const filteredShortcuts = useMemo(() => {
    return SHORTCUT_DEFINITIONS.filter((def) => {
      const matchCat = selectedCategory === 'all' || def.category === selectedCategory;
      const matchQuery =
        searchQuery === '' ||
        def.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        def.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [selectedCategory, searchQuery]);

  // Handle key press when re-binding
  const handleKeyDown = (e: React.KeyboardEvent, actionId: ShortcutActionId) => {
    e.preventDefault();
    e.stopPropagation();

    // Ignore standalone modifier presses
    if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return;

    if (e.key === 'Escape') {
      setEditingActionId(null);
      return;
    }

    const formatted = formatKeyEvent(e.nativeEvent);
    const updated: KeybindingsMap = {
      ...keybindings,
      [actionId]: formatted,
    };
    setKeybindings(updated);
    saveKeybindings(updated);
    setEditingActionId(null);
    showAnnouncement(`Rebound shortcut to "${formatted}".`);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all keyboard shortcuts back to standard factory defaults?')) {
      const defs = resetKeybindingsToDefaults();
      setKeybindings(defs);
      showAnnouncement('Reset all shortcuts to defaults.');
    }
  };

  return (
    <div className="wiki-container">
      <p className="wiki-breadcrumb">
        <a href="#/">← Return to Sprite Editor</a>
      </p>

      <h1>Keyboard Shortcuts & Keybinding Configuration</h1>
      <p>
        Customize key mappings for all editor tools, navigation actions, layer transforms, and project operations.
      </p>

      {/* Control Box */}
      <div className="wiki-box" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <strong>Filter Category: </strong>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as ShortcutCategory | 'all')}
            style={{ marginRight: '16px' }}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>

          <strong>Search: </strong>
          <input
            type="text"
            placeholder="Search action name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '180px' }}
          />
        </div>

        <button type="button" onClick={handleResetDefaults}>
          [ Reset to Defaults ]
        </button>
      </div>

      {/* Shortcuts Table */}
      <table>
        <thead>
          <tr>
            <th>Action Name</th>
            <th>Category</th>
            <th>Description</th>
            <th style={{ width: '150px' }}>Current Binding</th>
            <th style={{ width: '110px' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredShortcuts.map((def) => {
            const currentKey = keybindings[def.id] || def.defaultKey;
            const isEditing = editingActionId === def.id;

            return (
              <tr key={def.id}>
                <td><strong>{def.label}</strong></td>
                <td>{def.category}</td>
                <td>{def.description}</td>
                <td>
                  {isEditing ? (
                    <input
                      type="text"
                      autoFocus
                      placeholder="Press any key..."
                      onKeyDown={(e) => handleKeyDown(e, def.id)}
                      onBlur={() => setEditingActionId(null)}
                      style={{ width: '120px', backgroundColor: '#fff2d6' }}
                    />
                  ) : (
                    <code>{currentKey || 'None'}</code>
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <button type="button" onClick={() => setEditingActionId(null)}>
                      Cancel
                    </button>
                  ) : (
                    <button type="button" onClick={() => setEditingActionId(def.id)}>
                      Rebind
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
