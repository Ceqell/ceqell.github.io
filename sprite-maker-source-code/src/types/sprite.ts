export type ToolType = 
  | 'pencil'
  | 'eraser'
  | 'bucket'
  | 'eyedropper'
  | 'line'
  | 'rectangle'
  | 'rectangle_fill'
  | 'circle'
  | 'circle_fill'
  | 'select'
  | 'lasso'
  | 'lighten'
  | 'darken'
  | 'replace';

export type CanvasBgStyle = 'light-checker' | 'dark-checker' | 'retro' | 'dark';

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number; // 0 to 1
  locked: boolean;
  // Pixels stored as an array of length (width * height), values are hex strings with alpha (e.g. "#RRGGBB" or "#RRGGBBAA") or empty string "" for transparent
  pixels: string[];
  width?: number;
  height?: number;
}

export interface HistoryEntry {
  layers: Layer[];
  activeLayerId: string;
  preset: CanvasDimensions;
  guideOffset: { x: number; y: number };
}

export interface SelectionState {
  active: boolean;
  type?: 'rectangle' | 'lasso';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  // Specific list of pixel coordinate keys selected (e.g. "x,y")
  selectedPixelKeys?: string[];
  // If moving selection
  floating: boolean;
  floatingX: number;
  floatingY: number;
  floatingWidth: number;
  floatingHeight: number;
  floatingPixels: string[];
  // Mask of which relative cells inside floating box are part of selection
  floatingMask?: boolean[];
}

export interface ReferenceImage {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
  // Trace mode overlay on canvas
  traceMode: boolean;
  traceOpacity: number; // 0 to 1
  traceX: number; // pixel offset on canvas
  traceY: number; // pixel offset on canvas
  traceScale: number; // scaling factor relative to pixel canvas
  // Floating window state
  windowOpen: boolean;
  windowX?: number;
  windowY?: number;
  windowZoom?: number;
  windowWidth?: number;
  windowHeight?: number;
}

export interface CanvasDimensions {
  width: number;
  height: number;
  name: string;
  description: string;
  // Body anchor offset within this canvas
  bodyOffsetX: number;
  bodyOffsetY: number;
}

export interface BodyGuideConfig {
  head: { x: number; y: number; width: 9; height: 8 };
  torso: { x: number; y: number; width: 11; height: 10 };
  leftArm: { x: number; y: number; width: 5; height: 10 };
  rightArm: { x: number; y: number; width: 5; height: 10 };
  legs: { x: number; y: number; width: 11; height: 10; seamCol: number };
}

export interface Palette {
  id: string;
  name: string;
  category: 'retro-dev' | 'retro-games' | 'custom';
  colors: string[];
}

export interface ExportSettings {
  scale: number;
  customWidth: number;
  customHeight: number;
  useCustomSize: boolean;
  maintainAspectRatio: boolean;
  backgroundType: 'transparent' | 'solid' | 'checkerboard';
  backgroundColor: string;
  includeGuides: boolean;
  includeNumbers: boolean;
  visibleLayersOnly: boolean;
  filename: string;
}

export interface ProjectState {
  version: number;
  canvasWidth: number;
  canvasHeight: number;
  layers: Layer[];
  activeLayerId: string;
  references: ReferenceImage[];
  selectedColor: string;
  canvasPresetName: string;
  bodyOffsetX?: number;
  bodyOffsetY?: number;
}
