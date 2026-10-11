import { ShortcutActionDefinition, ShortcutActionId, KeybindingsMap } from '../types/keybindings';

export const SHORTCUT_DEFINITIONS: ShortcutActionDefinition[] = [
  // Tools
  {
    id: 'tool_pencil',
    label: 'Pencil Tool',
    category: 'Tools',
    description: 'Draw pixels with primary brush color',
    defaultKey: 'B',
    secondaryDefaultKey: 'P',
  },
  {
    id: 'tool_eraser',
    label: 'Eraser Tool',
    category: 'Tools',
    description: 'Erase pixels to transparent',
    defaultKey: 'E',
  },
  {
    id: 'tool_bucket',
    label: 'Bucket Fill Tool',
    category: 'Tools',
    description: 'Flood fill contiguous matching pixels',
    defaultKey: 'G',
    secondaryDefaultKey: 'K',
  },
  {
    id: 'tool_eyedropper',
    label: 'Eyedropper Tool',
    category: 'Tools',
    description: 'Sample color from active layer or canvas',
    defaultKey: 'I',
  },
  {
    id: 'tool_line',
    label: 'Line Tool',
    category: 'Tools',
    description: 'Draw straight Bresenham lines',
    defaultKey: 'L',
  },
  {
    id: 'tool_rectangle',
    label: 'Rectangle Tool',
    category: 'Tools',
    description: 'Draw stroked rectangular boxes',
    defaultKey: 'U',
  },
  {
    id: 'tool_rectangle_fill',
    label: 'Filled Box Tool',
    category: 'Tools',
    description: 'Draw filled solid rectangles',
    defaultKey: 'Shift+U',
  },
  {
    id: 'tool_circle',
    label: 'Circle Tool',
    category: 'Tools',
    description: 'Draw stroked circles and ellipses',
    defaultKey: 'C',
  },
  {
    id: 'tool_circle_fill',
    label: 'Filled Circle Tool',
    category: 'Tools',
    description: 'Draw filled solid circles',
    defaultKey: 'Shift+C',
  },
  {
    id: 'tool_select',
    label: 'Box Select Tool',
    category: 'Tools',
    description: 'Select rectangular pixel areas to move or edit',
    defaultKey: 'M',
  },
  {
    id: 'tool_lasso',
    label: 'Lasso Select Tool',
    category: 'Tools',
    description: 'Freehand lasso selection area',
    defaultKey: 'Q',
  },
  {
    id: 'tool_lighten',
    label: 'Lighten (Dodge) Tool',
    category: 'Tools',
    description: 'Lighten existing pixel brightness',
    defaultKey: 'D',
  },
  {
    id: 'tool_darken',
    label: 'Darken (Burn) Tool',
    category: 'Tools',
    description: 'Darken existing pixel brightness',
    defaultKey: 'Shift+D',
  },
  {
    id: 'tool_replace',
    label: 'Color Replace Tool',
    category: 'Tools',
    description: 'Replace all instances of clicked color in active layer',
    defaultKey: 'R',
  },

  // Canvas & Overlays
  {
    id: 'toggle_grid',
    label: 'Toggle Pixel Grid',
    category: 'Canvas & Overlays',
    description: 'Show or hide pixel boundaries at high zoom',
    defaultKey: 'Shift+G',
  },
  {
    id: 'toggle_guides',
    label: 'Toggle Retro Dev Guides',
    category: 'Canvas & Overlays',
    description: 'Show or hide character anatomical proportion regions',
    defaultKey: 'H',
  },
  {
    id: 'toggle_numbers',
    label: 'Toggle Coordinate Numbers',
    category: 'Canvas & Overlays',
    description: 'Show or hide column and row coordinate headers',
    defaultKey: 'N',
  },
  {
    id: 'toggle_symmetry',
    label: 'Toggle Symmetry / Mirror',
    category: 'Canvas & Overlays',
    description: 'Mirror drawing across the torso vertical axis',
    defaultKey: 'S',
  },
  {
    id: 'zoom_in',
    label: 'Zoom In',
    category: 'Canvas & Overlays',
    description: 'Increase canvas magnification',
    defaultKey: '=',
  },
  {
    id: 'zoom_out',
    label: 'Zoom Out',
    category: 'Canvas & Overlays',
    description: 'Decrease canvas magnification',
    defaultKey: '-',
  },
  {
    id: 'zoom_reset',
    label: 'Reset Zoom (100%)',
    category: 'Canvas & Overlays',
    description: 'Reset canvas scale to default 100% zoom',
    defaultKey: '0',
  },

  // History
  {
    id: 'undo',
    label: 'Undo Action',
    category: 'History',
    description: 'Revert last canvas stroke or layer action',
    defaultKey: 'Ctrl+Z',
  },
  {
    id: 'redo',
    label: 'Redo Action',
    category: 'History',
    description: 'Reapply previously undone action',
    defaultKey: 'Ctrl+Y',
    secondaryDefaultKey: 'Ctrl+Shift+Z',
  },

  // Selection
  {
    id: 'stamp_selection',
    label: 'Stamp Selection',
    category: 'Selection',
    description: 'Commit floating selection back down to active layer',
    defaultKey: 'Enter',
  },
  {
    id: 'clear_selection',
    label: 'Clear Selection',
    category: 'Selection',
    description: 'Deselect active marquee or dismiss floating box',
    defaultKey: 'Escape',
  },
  {
    id: 'delete_selection',
    label: 'Delete Selected Pixels',
    category: 'Selection',
    description: 'Clear all pixels within current selection',
    defaultKey: 'Delete',
    secondaryDefaultKey: 'Backspace',
  },
  {
    id: 'nudge_up',
    label: 'Nudge Selection Up',
    category: 'Selection',
    description: 'Move floating selection up by 1 pixel',
    defaultKey: 'ArrowUp',
  },
  {
    id: 'nudge_down',
    label: 'Nudge Selection Down',
    category: 'Selection',
    description: 'Move floating selection down by 1 pixel',
    defaultKey: 'ArrowDown',
  },
  {
    id: 'nudge_left',
    label: 'Nudge Selection Left',
    category: 'Selection',
    description: 'Move floating selection left by 1 pixel',
    defaultKey: 'ArrowLeft',
  },
  {
    id: 'nudge_right',
    label: 'Nudge Selection Right',
    category: 'Selection',
    description: 'Move floating selection right by 1 pixel',
    defaultKey: 'ArrowRight',
  },
  {
    id: 'flip_selection_h',
    label: 'Flip Selection Horizontally',
    category: 'Selection',
    description: 'Mirror floating pixels horizontally',
    defaultKey: 'Shift+H',
  },
  {
    id: 'flip_selection_v',
    label: 'Flip Selection Vertically',
    category: 'Selection',
    description: 'Mirror floating pixels vertically',
    defaultKey: 'Shift+V',
  },
  {
    id: 'select_all',
    label: 'Select Entire Canvas',
    category: 'Selection',
    description: 'Create marquee box around the full canvas area',
    defaultKey: 'Ctrl+A',
  },

  // Layers
  {
    id: 'layer_new',
    label: 'New Layer',
    category: 'Layers',
    description: 'Add a new blank transparent layer on top',
    defaultKey: 'Alt+L',
  },
  {
    id: 'layer_delete',
    label: 'Delete Active Layer',
    category: 'Layers',
    description: 'Remove active layer (if more than one exists)',
    defaultKey: 'Alt+Delete',
  },
  {
    id: 'layer_duplicate',
    label: 'Duplicate Layer',
    category: 'Layers',
    description: 'Clone current layer and all its pixels',
    defaultKey: 'Alt+D',
  },
  {
    id: 'layer_merge_down',
    label: 'Merge Layer Down',
    category: 'Layers',
    description: 'Combine active layer down into layer below it',
    defaultKey: 'Ctrl+M',
  },
  {
    id: 'layer_flip_h',
    label: 'Flip Layer Horizontally',
    category: 'Layers',
    description: 'Mirror all pixels in active layer horizontally',
    defaultKey: 'Alt+H',
  },
  {
    id: 'layer_flip_v',
    label: 'Flip Layer Vertically',
    category: 'Layers',
    description: 'Mirror all pixels in active layer vertically',
    defaultKey: 'Alt+V',
  },
  {
    id: 'layer_center',
    label: 'Center Layer Contents',
    category: 'Layers',
    description: 'Recenter active layer drawing bounding box',
    defaultKey: 'Alt+C',
  },
  {
    id: 'layer_clear',
    label: 'Clear Active Layer',
    category: 'Layers',
    description: 'Erase all pixels on the active layer to transparent',
    defaultKey: 'Alt+X',
  },

  // Brushes
  {
    id: 'brush_decrease',
    label: 'Decrease Brush Size',
    category: 'Brushes',
    description: 'Step brush size down by 1 pixel',
    defaultKey: '[',
  },
  {
    id: 'brush_increase',
    label: 'Increase Brush Size',
    category: 'Brushes',
    description: 'Step brush size up by 1 pixel',
    defaultKey: ']',
  },

  // Panels & Windows
  {
    id: 'open_help',
    label: 'Help & Documentation',
    category: 'Panels & Windows',
    description: 'Open manual guide and wiki docs',
    defaultKey: '?',
    secondaryDefaultKey: 'F1',
  },
  {
    id: 'open_shortcuts',
    label: 'Shortcuts Remapper',
    category: 'Panels & Windows',
    description: 'Open this keyboard shortcuts configuration dialog',
    defaultKey: 'K',
  },
  {
    id: 'open_assets',
    label: 'Toolbox Asset Manager',
    category: 'Panels & Windows',
    description: 'Open the sprite atlas library with 54 hand-drawn sprites',
    defaultKey: 'T',
  },
  {
    id: 'open_dimensions',
    label: 'Sprite Dimensions Guide',
    category: 'Panels & Windows',
    description: 'Open official Retro Dev anatomy dimension specs',
    defaultKey: 'F2',
  },
  {
    id: 'open_projects',
    label: 'Projects & Saves Manager',
    category: 'Panels & Windows',
    description: 'Open Project Manager and load/save project files',
    defaultKey: 'Ctrl+O',
  },
  {
    id: 'open_export',
    label: 'Spritesheet Exporter',
    category: 'Panels & Windows',
    description: 'Open Spritesheet and image export dialog',
    defaultKey: 'Ctrl+E',
  },
  {
    id: 'open_starters',
    label: 'Starter Character Templates',
    category: 'Panels & Windows',
    description: 'Open starter preset templates menu',
    defaultKey: 'F3',
  },
  {
    id: 'open_custom_canvas',
    label: 'Custom Canvas Dimensions',
    category: 'Panels & Windows',
    description: 'Resize canvas resolution and anchor placement',
    defaultKey: 'F4',
  },
  {
    id: 'open_about',
    label: 'About FigurayMaker',
    category: 'Panels & Windows',
    description: 'View credits, version info and design notes',
    defaultKey: 'F5',
  },
];

const LOCAL_STORAGE_KEY = 'figuraymaker_keybindings_v2';

export function getDefaultKeybindings(): KeybindingsMap {
  const map: Partial<KeybindingsMap> = {};
  SHORTCUT_DEFINITIONS.forEach(def => {
    map[def.id] = def.defaultKey;
  });
  return map as KeybindingsMap;
}

export function loadSavedKeybindings(): KeybindingsMap {
  const defaults = getDefaultKeybindings();
  if (typeof window === 'undefined' || !window.localStorage) {
    return defaults;
  }

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return { ...defaults, ...parsed };
  } catch (err) {
    console.error('Failed to load keybindings from localStorage:', err);
    return defaults;
  }
}

export function saveKeybindings(bindings: KeybindingsMap): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(bindings));
  } catch (err) {
    console.error('Failed to save keybindings to localStorage:', err);
  }
}

export function resetKeybindingsToDefaults(): KeybindingsMap {
  const defaults = getDefaultKeybindings();
  saveKeybindings(defaults);
  return defaults;
}

/**
 * Normalizes a KeyboardEvent into a standard formatted string (e.g. 'B', 'Shift+G', 'Ctrl+Z')
 */
export function formatKeyEvent(e: KeyboardEvent): string {
  // If the user just pressed a modifier key itself, return empty (waiting for main key)
  if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
    return '';
  }

  const parts: string[] = [];
  const isCtrl = e.ctrlKey || e.metaKey;
  const isAlt = e.altKey;
  const isShift = e.shiftKey;

  if (isCtrl) parts.push('Ctrl');
  if (isAlt) parts.push('Alt');

  let keyName = e.key;
  if (keyName === ' ') keyName = 'Space';
  else if (keyName === 'Escape') keyName = 'Escape';
  else if (keyName === 'Enter') keyName = 'Enter';
  else if (keyName === 'Backspace') keyName = 'Backspace';
  else if (keyName === 'Delete') keyName = 'Delete';
  else if (keyName === 'ArrowUp') keyName = 'ArrowUp';
  else if (keyName === 'ArrowDown') keyName = 'ArrowDown';
  else if (keyName === 'ArrowLeft') keyName = 'ArrowLeft';
  else if (keyName === 'ArrowRight') keyName = 'ArrowRight';
  else if (keyName.length === 1 && keyName >= 'a' && keyName <= 'z') {
    keyName = keyName.toUpperCase();
  }

  // Only include 'Shift' modifier if key is a letter or special command (e.g. Shift+G, Shift+C)
  // For standard symbol keys where Shift produces a distinct character (e.g. '?' or '+'), keyName is already that character
  if (isShift && !['?', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '{', '}', ':', '"', '<', '>', '~'].includes(e.key)) {
    parts.push('Shift');
  }

  parts.push(keyName);
  return parts.join('+');
}

/**
 * Checks if a KeyboardEvent matches a given keybinding string or action fallback
 */
export function matchesKeybinding(e: KeyboardEvent, keybinding?: string, secondaryKey?: string): boolean {
  if (!keybinding && !secondaryKey) return false;

  const check = (binding: string): boolean => {
    if (!binding) return false;

    // Special quick checks for common special keys
    if (binding === 'Delete') {
      return (e.key === 'Delete' || e.key === 'Backspace') && !e.ctrlKey && !e.metaKey && !e.altKey;
    }
    if (binding === 'Backspace') {
      return (e.key === 'Backspace' || e.key === 'Delete') && !e.ctrlKey && !e.metaKey && !e.altKey;
    }
    if (binding === 'Enter') {
      return e.key === 'Enter' && !e.ctrlKey && !e.metaKey && !e.altKey;
    }
    if (binding === 'Escape') {
      return e.key === 'Escape';
    }
    if (binding === 'ArrowUp') return e.key === 'ArrowUp';
    if (binding === 'ArrowDown') return e.key === 'ArrowDown';
    if (binding === 'ArrowLeft') return e.key === 'ArrowLeft';
    if (binding === 'ArrowRight') return e.key === 'ArrowRight';

    const parts = binding.split('+');
    const hasCtrl = parts.includes('Ctrl');
    const hasAlt = parts.includes('Alt');
    const hasShift = parts.includes('Shift');
    const mainKey = parts[parts.length - 1];

    const eventHasCtrl = e.ctrlKey || e.metaKey;
    const eventHasAlt = e.altKey;
    const eventHasShift = e.shiftKey;

    if (hasCtrl !== eventHasCtrl) return false;
    if (hasAlt !== eventHasAlt) return false;

    // If binding requires Shift:
    if (hasShift) {
      if (!eventHasShift) return false;
      return e.key.toUpperCase() === mainKey.toUpperCase();
    }

    // If binding doesn't specify Shift:
    // If it's a shifted symbol like '?' or '+', e.key matches directly
    if (['?', '+', '=', '-', '[', ']', '0'].includes(mainKey)) {
      return e.key === mainKey || e.code === mainKey;
    }

    // Standard single letter or key without shift modifier:
    if (eventHasShift) return false;
    return e.key.toUpperCase() === mainKey.toUpperCase();
  };

  return (keybinding ? check(keybinding) : false) || (secondaryKey ? check(secondaryKey) : false);
}
