import { Layer } from '../types/sprite';
import atlasData from '../constants/spriteAtlas.json';

export type ScaleMode = '1x' | '2x';

export interface SpriteAtlasEntry {
  id: string;
  index: number;
  name: string;
  originalCategory: string;
  category: 'Full Characters' | 'Heads & Faces' | 'Torsos & Outfits' | 'Limbs & Arms' | 'Legs & Feet' | 'Palettes & Utilities';
  package: 'Robloxian 2.0' | 'Classic 1.0' | 'iBot' | 'Peter' | 'Classic Skeleton' | 'White Skeleton' | 'General';
  // 2x HD source bounds from DavidBlxTemplate
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  // 1x Canonical wiki dimensions (9x8 head, 11x10 torso/legs, 5x10 arm, 21x28 character)
  wikiDimensions: {
    width: number;
    height: number;
  };
  file: string;
  notes: string;
  tags: string[];
}

// Function to classify sprite entries into rich human-friendly packages and categories
export function getEnhancedSpriteList(): SpriteAtlasEntry[] {
  return (atlasData as any[]).map(item => {
    let category: SpriteAtlasEntry['category'] = 'Limbs & Arms';
    let pkg: SpriteAtlasEntry['package'] = 'General';
    const nameLower = item.name.toLowerCase();

    // Determine Package
    if (nameLower.includes('ibot')) {
      pkg = 'iBot';
    } else if (nameLower.includes('peter')) {
      pkg = 'Peter';
    } else if (nameLower.includes('whiteskelly') || (nameLower.includes('white') && nameLower.includes('skeleton'))) {
      pkg = 'White Skeleton';
    } else if (nameLower.includes('classicskelly') || (nameLower.includes('skeleton') && nameLower.includes('brown')) || nameLower.includes('skeletonbrown')) {
      pkg = 'Classic Skeleton';
    } else if (nameLower.includes('robloxian2') || nameLower.includes('r15')) {
      pkg = 'Robloxian 2.0';
    } else if (nameLower.includes('1.0') || nameLower.includes('r6')) {
      pkg = 'Classic 1.0';
    }

    // Determine Category
    if (nameLower === 'colorpalette') {
      category = 'Palettes & Utilities';
    } else if (
      item.originalCategory === 'Character' ||
      nameLower === 'noob1.0' ||
      nameLower === 'noobrobloxian2.0' ||
      nameLower === 'ibot' ||
      nameLower === 'peter' ||
      nameLower === 'skeletonbrown' ||
      nameLower === 'skeletonwhite' ||
      nameLower.includes('wireframe')
    ) {
      category = 'Full Characters';
    } else if (nameLower.includes('head') || item.originalCategory === 'Head / Face') {
      category = 'Heads & Faces';
    } else if (nameLower.includes('torso')) {
      category = 'Torsos & Outfits';
    } else if (nameLower.includes('leg')) {
      category = 'Legs & Feet';
    } else if (nameLower.includes('arm')) {
      category = 'Limbs & Arms';
    }

    // Canonical 1x dimensions: exactly half of 2x template bounds
    const wikiW = Math.round(item.bounds.width / 2);
    const wikiH = Math.round(item.bounds.height / 2);

    // Tag generation
    const tags = [pkg, category, item.name, `${wikiW}x${wikiH}`, `${item.bounds.width}x${item.bounds.height}`];

    return {
      ...item,
      category,
      package: pkg,
      wikiDimensions: {
        width: wikiW,
        height: wikiH,
      },
      tags,
    };
  });
}

export const SPRITE_ATLAS: SpriteAtlasEntry[] = getEnhancedSpriteList();

// Cached template image bitmap/canvas for instant extraction
let cachedImagePromise: Promise<HTMLImageElement> | null = null;

export function loadTemplateImage(): Promise<HTMLImageElement> {
  if (!cachedImagePromise) {
    cachedImagePromise = new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(new Error('Failed to load DavidBlxTemplate.png: ' + e));
      img.src = '/DavidBlxTemplate.png';
    });
  }
  return cachedImagePromise;
}

// Downsample 2x pixel array to crisp 1x pixel array by sampling each 2x2 cluster
export function downsamplePixels2x(
  pixels: string[],
  sourceWidth: number,
  sourceHeight: number
): { width: number; height: number; pixels: string[] } {
  const targetW = Math.ceil(sourceWidth / 2);
  const targetH = Math.ceil(sourceHeight / 2);
  const result: string[] = new Array(targetW * targetH).fill('');

  for (let dy = 0; dy < targetH; dy++) {
    for (let dx = 0; dx < targetW; dx++) {
      const sx0 = dx * 2;
      const sy0 = dy * 2;
      const candidates: string[] = [];

      for (let oy = 0; oy < 2; oy++) {
        for (let ox = 0; ox < 2; ox++) {
          const sx = sx0 + ox;
          const sy = sy0 + oy;
          if (sx < sourceWidth && sy < sourceHeight) {
            const p = pixels[sy * sourceWidth + sx];
            if (p) candidates.push(p);
          }
        }
      }

      if (candidates.length > 0) {
        // Pick majority non-empty color in 2x2 cell
        const freq: Record<string, number> = {};
        for (const c of candidates) {
          freq[c] = (freq[c] || 0) + 1;
        }
        let bestColor = candidates[0];
        let maxCount = 0;
        for (const [col, count] of Object.entries(freq)) {
          if (count > maxCount) {
            maxCount = count;
            bestColor = col;
          }
        }
        result[dy * targetW + dx] = bestColor;
      }
    }
  }

  return {
    width: targetW,
    height: targetH,
    pixels: result,
  };
}

// Extract RGBA pixels of any atlas sprite with optional scaleMode ('1x' default, or '2x' raw source)
export async function extractSpritePixels(
  sprite: SpriteAtlasEntry,
  scaleMode: ScaleMode = '1x'
): Promise<{ width: number; height: number; pixels: string[] }> {
  const img = await loadTemplateImage();
  const canvas = document.createElement('canvas');
  canvas.width = sprite.bounds.width;
  canvas.height = sprite.bounds.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  // Draw exactly the sub-rectangle from DavidBlxTemplate.png
  ctx.drawImage(
    img,
    sprite.bounds.x,
    sprite.bounds.y,
    sprite.bounds.width,
    sprite.bounds.height,
    0,
    0,
    sprite.bounds.width,
    sprite.bounds.height
  );

  const imgData = ctx.getImageData(0, 0, sprite.bounds.width, sprite.bounds.height);
  const data = imgData.data;
  const pixels2x: string[] = new Array(sprite.bounds.width * sprite.bounds.height);

  for (let i = 0; i < pixels2x.length; i++) {
    const idx = i * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const a = data[idx + 3];

    if (a === 0) {
      pixels2x[i] = '';
    } else {
      const hexR = r.toString(16).padStart(2, '0');
      const hexG = g.toString(16).padStart(2, '0');
      const hexB = b.toString(16).padStart(2, '0');
      if (a < 255) {
        const hexA = a.toString(16).padStart(2, '0');
        pixels2x[i] = `#${hexR}${hexG}${hexB}${hexA}`.toUpperCase();
      } else {
        pixels2x[i] = `#${hexR}${hexG}${hexB}`.toUpperCase();
      }
    }
  }

  if (scaleMode === '2x') {
    return {
      width: sprite.bounds.width,
      height: sprite.bounds.height,
      pixels: pixels2x,
    };
  }

  // Scale down 2x -> 1x
  return downsamplePixels2x(pixels2x, sprite.bounds.width, sprite.bounds.height);
}

// Convert sprite pixel grid onto target canvas dimensions with optional offset or centering
export function placeSpriteOnCanvas(
  spritePixels: string[],
  spriteWidth: number,
  spriteHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  destX?: number,
  destY?: number
): string[] {
  const targetPixels = new Array(canvasWidth * canvasHeight).fill('');
  const ox = destX !== undefined ? destX : Math.floor((canvasWidth - spriteWidth) / 2);
  const oy = destY !== undefined ? destY : Math.floor((canvasHeight - spriteHeight) / 2);

  for (let y = 0; y < spriteHeight; y++) {
    for (let x = 0; x < spriteWidth; x++) {
      const srcPx = spritePixels[y * spriteWidth + x];
      if (!srcPx) continue;
      const targetX = ox + x;
      const targetY = oy + y;
      if (targetX >= 0 && targetX < canvasWidth && targetY >= 0 && targetY < canvasHeight) {
        targetPixels[targetY * canvasWidth + targetX] = srcPx;
      }
    }
  }

  return targetPixels;
}

// Revamped High-Fidelity Starters using authentic Human-Drawn DavidBlxTemplate sprites
export interface RevampedStarter {
  id: string;
  name: string;
  package: string;
  desc: string;
  spriteIndex: number;
  badge: string;
  // Recommended canvas dimensions at canonical 1x scale (e.g. 25x32 with headroom)
  recommendedWidth1x: number;
  recommendedHeight1x: number;
  // Recommended canvas dimensions at 2x HD source scale
  recommendedWidth2x: number;
  recommendedHeight2x: number;
}

export const REVAMPED_STARTER_TEMPLATES: RevampedStarter[] = [
  {
    id: 'starter-noob-1',
    name: 'Classic Noob 1.0',
    package: 'Classic 1.0',
    desc: 'Original 2006 blocky yellow head (9x8), royal blue torso (11x10), and green legs (11x10)',
    spriteIndex: 11, // noob1.0 (42x56 in 2x -> 21x28 in 1x)
    badge: 'Canonical 1.0',
    recommendedWidth1x: 25,
    recommendedHeight1x: 32,
    recommendedWidth2x: 48,
    recommendedHeight2x: 64,
  },
  {
    id: 'starter-noob-2',
    name: 'Robloxian 2.0 Noob',
    package: 'Robloxian 2.0',
    desc: 'Sleek angled Robloxian 2.0 package with tapered limbs (19x28 in 1x)',
    spriteIndex: 10, // noobrobloxian2.0 (38x56 in 2x -> 19x28 in 1x)
    badge: 'Iconic 2.0',
    recommendedWidth1x: 25,
    recommendedHeight1x: 32,
    recommendedWidth2x: 48,
    recommendedHeight2x: 64,
  },
  {
    id: 'starter-ibot',
    name: 'iBot Cybernetic Package',
    package: 'iBot',
    desc: 'Legendary sci-fi android with cyan visor, metallic joints and core emblem (21x31 in 1x)',
    spriteIndex: 12, // ibot (42x61 in 2x -> 21x31 in 1x)
    badge: 'Retro Sci-Fi',
    recommendedWidth1x: 25,
    recommendedHeight1x: 32,
    recommendedWidth2x: 48,
    recommendedHeight2x: 64,
  },
  {
    id: 'starter-peter',
    name: 'Peter Character',
    package: 'Peter',
    desc: 'Famous animated character sprite featuring round torso, green pants & glasses (18x28 in 1x)',
    spriteIndex: 13, // peter (36x56 in 2x -> 18x28 in 1x)
    badge: 'Stylized',
    recommendedWidth1x: 25,
    recommendedHeight1x: 32,
    recommendedWidth2x: 48,
    recommendedHeight2x: 64,
  },
  {
    id: 'starter-skelly-brown',
    name: 'Classic Skeleton (Brown)',
    package: 'Classic Skeleton',
    desc: 'Spooky sepia-brown bone frame with detailed ribcage and skull shading (19x28 in 1x)',
    spriteIndex: 14, // skeletonbrown (38x56 in 2x -> 19x28 in 1x)
    badge: 'Spooky Retro',
    recommendedWidth1x: 25,
    recommendedHeight1x: 32,
    recommendedWidth2x: 48,
    recommendedHeight2x: 64,
  },
  {
    id: 'starter-skelly-white',
    name: 'White Skeleton',
    package: 'White Skeleton',
    desc: 'High-contrast bone-white skeleton sprite with dark joint sockets (19x28 in 1x)',
    spriteIndex: 15, // skeletonwhite (38x56 in 2x -> 19x28 in 1x)
    badge: 'Skeleton Variant',
    recommendedWidth1x: 25,
    recommendedHeight1x: 32,
    recommendedWidth2x: 48,
    recommendedHeight2x: 64,
  },
  {
    id: 'starter-wireframe-r6',
    name: 'R6 Mannequin Wireframe',
    package: 'Classic 1.0',
    desc: 'Clean shaded neutral grey mannequin canvas ready for custom skin design (21x28 in 1x)',
    spriteIndex: 9, // R6wireframe (42x56 in 2x -> 21x28 in 1x)
    badge: 'Mannequin Base',
    recommendedWidth1x: 25,
    recommendedHeight1x: 32,
    recommendedWidth2x: 48,
    recommendedHeight2x: 64,
  },
  {
    id: 'starter-wireframe-r15',
    name: 'R15 2.0 Wireframe',
    package: 'Robloxian 2.0',
    desc: 'Precision segmented 2.0 wireframe base with joint outlines (19x28 in 1x)',
    spriteIndex: 16, // R15Robloxian2.0PackageWireframe (38x56 in 2x -> 19x28 in 1x)
    badge: 'Wireframe Base',
    recommendedWidth1x: 25,
    recommendedHeight1x: 32,
    recommendedWidth2x: 48,
    recommendedHeight2x: 64,
  },
  {
    id: 'starter-empty',
    name: 'Empty Canvas',
    package: 'Custom',
    desc: 'Fresh blank canvas for scratch character sprite generation',
    spriteIndex: 0,
    badge: 'Clean Slate',
    recommendedWidth1x: 25,
    recommendedHeight1x: 32,
    recommendedWidth2x: 48,
    recommendedHeight2x: 64,
  },
];
