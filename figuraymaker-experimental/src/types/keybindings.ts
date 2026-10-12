export type ShortcutCategory = 
  | 'Tools' 
  | 'Canvas & Overlays' 
  | 'Selection' 
  | 'Layers' 
  | 'History' 
  | 'Brushes' 
  | 'Panels & Windows';

export type ShortcutActionId =
  // Drawing & Editing Tools
  | 'tool_pencil'
  | 'tool_eraser'
  | 'tool_bucket'
  | 'tool_eyedropper'
  | 'tool_line'
  | 'tool_rectangle'
  | 'tool_rectangle_fill'
  | 'tool_circle'
  | 'tool_circle_fill'
  | 'tool_select'
  | 'tool_lasso'
  | 'tool_lighten'
  | 'tool_darken'
  | 'tool_replace'
  // Canvas & Overlays
  | 'toggle_grid'
  | 'toggle_guides'
  | 'toggle_numbers'
  | 'toggle_symmetry'
  | 'zoom_in'
  | 'zoom_out'
  | 'zoom_reset'
  // Selection
  | 'stamp_selection'
  | 'clear_selection'
  | 'delete_selection'
  | 'flip_selection_h'
  | 'flip_selection_v'
  | 'select_all'
  | 'nudge_up'
  | 'nudge_down'
  | 'nudge_left'
  | 'nudge_right'
  // Layers
  | 'layer_new'
  | 'layer_delete'
  | 'layer_duplicate'
  | 'layer_merge_down'
  | 'layer_flip_h'
  | 'layer_flip_v'
  | 'layer_center'
  | 'layer_clear'
  // History
  | 'undo'
  | 'redo'
  // Brushes
  | 'brush_decrease'
  | 'brush_increase'
  // Modals & Panels
  | 'open_help'
  | 'open_shortcuts'
  | 'open_assets'
  | 'open_dimensions'
  | 'open_projects'
  | 'open_export'
  | 'open_starters'
  | 'open_custom_canvas'
  | 'open_about';

export interface ShortcutActionDefinition {
  id: ShortcutActionId;
  label: string;
  category: ShortcutCategory;
  description: string;
  defaultKey: string;
  secondaryDefaultKey?: string;
}

export type KeybindingsMap = Record<ShortcutActionId, string>;
