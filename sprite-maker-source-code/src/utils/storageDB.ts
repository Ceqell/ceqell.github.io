import { Layer, ReferenceImage } from '../types/sprite';

export interface StoredProject {
  id: string; // unique UUID (e.g. "proj_1712470000000_abc")
  name: string; // e.g. "Knight Sprite"
  updatedAt: number; // timestamp for sorting & relative time
  createdAt: number;
  thumbnailUrl: string; // 64x64 PNG data URL generated offscreen
  canvasWidth: number;
  canvasHeight: number;
  canvasPresetName: string;
  layers: Layer[];
  activeLayerId: string;
  references?: ReferenceImage[];
  selectedColor?: string;
  bodyOffsetX?: number;
  bodyOffsetY?: number;
}

const DB_NAME = 'FigurayMakerDB';
const DB_VERSION = 1;
const STORE_NAME = 'projects';

export function generateProjectId(): string {
  return `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Draws visible layers onto an offscreen canvas and returns a high-speed miniature PNG data URL.
 */
export function generateProjectThumbnail(layers: Layer[], width: number, height: number): string {
  if (typeof document === 'undefined') return '';

  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.imageSmoothingEnabled = false;

  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = width;
  srcCanvas.height = height;
  const srcCtx = srcCanvas.getContext('2d');
  if (!srcCtx) return '';

  // Render bottom layer to top layer
  for (const layer of layers) {
    if (!layer.visible || layer.opacity === 0) continue;

    const imgData = srcCtx.createImageData(width, height);
    const data = imgData.data;
    const len = width * height;

    for (let i = 0; i < len; i++) {
      const color = layer.pixels[i];
      if (!color || color === '') continue;

      let r = 0, g = 0, b = 0, a = 255;
      if (color.startsWith('#')) {
        const hex = color.slice(1);
        if (hex.length === 3) {
          r = parseInt(hex[0] + hex[0], 16);
          g = parseInt(hex[1] + hex[1], 16);
          b = parseInt(hex[2] + hex[2], 16);
        } else if (hex.length === 6) {
          r = parseInt(hex.slice(0, 2), 16);
          g = parseInt(hex.slice(2, 4), 16);
          b = parseInt(hex.slice(4, 6), 16);
        } else if (hex.length === 8) {
          r = parseInt(hex.slice(0, 2), 16);
          g = parseInt(hex.slice(2, 4), 16);
          b = parseInt(hex.slice(4, 6), 16);
          a = parseInt(hex.slice(6, 8), 16);
        }
      }

      const pixelIdx = i * 4;
      data[pixelIdx] = r;
      data[pixelIdx + 1] = g;
      data[pixelIdx + 2] = b;
      data[pixelIdx + 3] = Math.round(a * layer.opacity);
    }

    const layerCanvas = document.createElement('canvas');
    layerCanvas.width = width;
    layerCanvas.height = height;
    const layerCtx = layerCanvas.getContext('2d');
    if (layerCtx) {
      layerCtx.putImageData(imgData, 0, 0);
      srcCtx.drawImage(layerCanvas, 0, 0);
    }
  }

  // Draw centered inside 64x64 thumbnail
  const scale = Math.min(64 / width, 64 / height);
  const drawW = Math.max(1, Math.round(width * scale));
  const drawH = Math.max(1, Math.round(height * scale));
  const drawX = Math.round((64 - drawW) / 2);
  const drawY = Math.round((64 - drawH) / 2);

  ctx.drawImage(srcCanvas, 0, 0, width, height, drawX, drawY, drawW, drawH);
  return canvas.toDataURL('image/png');
}

/**
 * Inserts or updates the project by id.
 */
export async function saveProjectToDB(project: StoredProject): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(project);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
  });
}

/**
 * Retrieves all projects sorted by updatedAt descending.
 */
export async function getAllProjectsFromDB(): Promise<StoredProject[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const items: StoredProject[] = request.result || [];
      items.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      resolve(items);
    };
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
  });
}

/**
 * Retrieves a specific project by id.
 */
export async function getProjectFromDB(id: string): Promise<StoredProject | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
  });
}

/**
 * Removes a project from storage by id.
 */
export async function deleteProjectFromDB(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
  });
}

/**
 * Clones a project with a new ID and appends "(Copy)" to the name.
 */
export async function duplicateProjectInDB(id: string): Promise<StoredProject> {
  const original = await getProjectFromDB(id);
  if (!original) {
    throw new Error(`Project with ID ${id} not found`);
  }

  const now = Date.now();
  const duplicated: StoredProject = {
    ...JSON.parse(JSON.stringify(original)),
    id: generateProjectId(),
    name: `${original.name} (Copy)`,
    createdAt: now,
    updatedAt: now,
  };

  await saveProjectToDB(duplicated);
  return duplicated;
}

/**
 * Returns user-friendly relative time strings (e.g. "Just now", "15 minutes ago", "Yesterday").
 */
export function formatRelativeTime(timestamp: number): string {
  if (!timestamp) return 'Unknown';
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);

  if (diffSec < 30) return 'Just now';
  if (diffSec < 60) return `${diffSec} seconds ago`;

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin === 1) return '1 minute ago';
  if (diffMin < 60) return `${diffMin} minutes ago`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}
