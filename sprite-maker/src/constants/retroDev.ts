import { CanvasDimensions, Palette } from '../types/sprite';

export const CANVAS_PRESETS: CanvasDimensions[] = [
  {
    name: 'Retro Dev Classic (21 × 28)',
    width: 21,
    height: 28,
    description: 'Exact wiki body bounds: Head 9x8, Torso 11x10, Arms 5x10, Legs 11x10',
    bodyOffsetX: 0,
    bodyOffsetY: 0,
  },
  {
    name: 'With Headroom / Hats (25 × 32)',
    width: 25,
    height: 32,
    description: 'Recommended: +4px top for hats/hair & +2px side margins for weapons/gear',
    bodyOffsetX: 2,
    bodyOffsetY: 4,
  },
  {
    name: 'Square Avatar (32 × 32)',
    width: 32,
    height: 32,
    description: 'Centered sprite for standard 32x32 retro game engines and icons',
    bodyOffsetX: 5,
    bodyOffsetY: 2,
  },
  {
    name: 'Extended Gear Space (36 × 36)',
    width: 36,
    height: 36,
    description: 'Generous room for wings, capes, giant swords, and large accessories',
    bodyOffsetX: 7,
    bodyOffsetY: 4,
  },
];

export function getBodyLayout(width: number, height: number, offsetX?: number, offsetY?: number) {
  // If offsets not provided, center the 21x28 body in the canvas
  const ox = offsetX !== undefined ? offsetX : Math.floor((width - 21) / 2);
  const oy = offsetY !== undefined ? offsetY : Math.floor((height - 28) / 2);

  return {
    head: {
      x: ox + 6, // 6 to 14 = 9 columns (centered on torso which is at ox+5 to ox+15)
      y: oy,
      width: 9 as const,
      height: 8 as const,
    },
    torso: {
      x: ox + 5, // 5 to 15 = 11 columns
      y: oy + 8,
      width: 11 as const,
      height: 10 as const,
    },
    leftArm: {
      x: ox, // 0 to 4 = 5 columns
      y: oy + 8,
      width: 5 as const,
      height: 10 as const,
    },
    rightArm: {
      x: ox + 16, // 16 to 20 = 5 columns
      y: oy + 8,
      width: 5 as const,
      height: 10 as const,
    },
    legs: {
      x: ox + 5, // 5 to 15 = 11 columns
      y: oy + 18,
      width: 11 as const,
      height: 10 as const,
      seamCol: ox + 10, // column 6 in 1-indexed (index 5 of 11, so ox + 10)
    },
  };
}

// Retro Dev official rounded head mask (local relative coords: 9 wide x 8 high)
// Returns true if local pixel (lx, ly) is part of the circular head
export function isHeadPixel(lx: number, ly: number): boolean {
  if (lx < 0 || lx >= 9 || ly < 0 || ly >= 8) return false;
  // Row 0 (top): width 3, cols 3, 4, 5
  if (ly === 0) return lx >= 3 && lx <= 5;
  // Row 1: width 7, cols 1 to 7
  if (ly === 1) return lx >= 1 && lx <= 7;
  // Rows 2, 3, 4, 5: width 9, full cols 0 to 8
  if (ly >= 2 && ly <= 5) return true;
  // Row 6: width 7, cols 1 to 7
  if (ly === 6) return lx >= 1 && lx <= 7;
  // Row 7 (bottom neck): width 5, cols 2 to 6
  if (ly === 7) return lx >= 2 && lx <= 6;
  return false;
}

// Built-in color palettes
export const DEFAULT_PALETTES: Palette[] = [
  {
    id: 'retro-dev-classic',
    name: 'Retro Dev / Classic Roblox',
    category: 'retro-dev',
    colors: [
      '#F5CD2F', // Bright Yellow (Head / Arms)
      '#0D69AC', // Bright Blue (Torso)
      '#287F46', // Br. Yellowish Green (Legs)
      '#1C5831', // Dark Green (Leg Seam / Shading)
      '#1B2A34', // Really Black (Eyes, Smile)
      '#FFFFFF', // White
      '#A0A5A9', // Medium Stone Grey
      '#635F61', // Dark Stone Grey
      '#E5EADC', // Light Stone Grey
      '#DA2A2A', // Really Red
      '#DA8540', // Bright Orange
      '#F2B126', // Bright Yellowish Orange
      '#80BBDB', // Pastel Blue
      '#A1C48C', // Pastel Green
      '#CB9E6E', // Pastel Brown
      '#CC8E68', // Nougat
      '#6B327C', // Bright Violet
      '#957977', // Sand Red
      '#74869D', // Sand Blue
      '#A4BD46', // Lime Green
      '#002060', // Navy Blue
      '#3F261D', // Dark Brown
      '#562424', // Rust
      '#FF66CC', // Hot Pink
    ],
  },
  {
    id: 'retro-forsaken',
    name: 'Forsaken Z / Hacker & Killer',
    category: 'retro-dev',
    colors: [
      '#0A0A0A', // Void Black
      '#FFFFFF', // Pure White
      '#00E5FF', // Electric Cyan (Bluudude)
      '#005577', // Deep Cyan
      '#39FF14', // Glitch Neon Green
      '#FF0033', // Crimson / Blood Red
      '#8B0000', // Dark Crimson
      '#FFCC00', // Cyber Gold
      '#9900EF', // Void Purple
      '#4A0E4E', // Dark Purple
      '#333333', // Charcoal
      '#666666', // Steel Grey
      '#FF69B4', // Whimsical Pink
      '#FF7F50', // Coral
      '#1E90FF', // Dodger Blue
      '#FFD700', // Gold
    ],
  },
  {
    id: 'pico-8',
    name: 'PICO-8 Fantasy 16',
    category: 'retro-games',
    colors: [
      '#000000', '#1D2B53', '#7E2553', '#008751',
      '#AB5236', '#5F574F', '#C2C3C7', '#FFF1E8',
      '#FF004D', '#FFA300', '#FFEC27', '#00E436',
      '#29ADFF', '#83769C', '#FF77A8', '#FFCCAA',
    ],
  },
  {
    id: 'gameboy',
    name: 'Game Boy DMG-01',
    category: 'retro-games',
    colors: [
      '#0f380f', '#306230', '#8bac0f', '#9bbc0f',
    ],
  },
  {
    id: 'nes-classic',
    name: 'NES Classic Palette',
    category: 'retro-games',
    colors: [
      '#000000', '#7C7C7C', '#BCBCBC', '#FFFFFF',
      '#0000FC', '#0078F8', '#3CBCFC', '#A4E4FC',
      '#4428BC', '#6844FC', '#9878F8', '#B8B8F8',
      '#940084', '#D800CC', '#F878F8', '#F8B8F8',
      '#A80020', '#E40058', '#F85898', '#F8A4C0',
      '#A81000', '#F83800', '#F87858', '#F8B490',
      '#881400', '#E45C10', '#FCA044', '#FCD8A8',
      '#503000', '#AC7C00', '#F8B800', '#FCE0A8',
      '#007800', '#00B800', '#B8F818', '#D8F878',
      '#006800', '#00A800', '#58D854', '#B8F8B8',
    ],
  },
];

// Helper to create starting layers for the Classic Noob
export function createNoobSprite(width: number, height: number, ox: number, oy: number) {
  const layout = getBodyLayout(width, height, ox, oy);
  const totalPixels = width * height;
  
  // Layer 1: Body (Head base, Torso, Arms, Legs)
  const bodyPixels = new Array(totalPixels).fill('');
  // Layer 2: Face (Eyes, Smile)
  const facePixels = new Array(totalPixels).fill('');
  // Layer 3: Accessories / Hair (empty for user to draw)
  const accPixels = new Array(totalPixels).fill('');

  const YELLOW = '#F5CD2F';
  const BLUE = '#0D69AC';
  const GREEN = '#287F46';
  const DARK_GREEN = '#1C5831';
  const BLACK = '#1B2A34';

  const setPixel = (layerArr: string[], x: number, y: number, color: string) => {
    if (x >= 0 && x < width && y >= 0 && y < height) {
      layerArr[y * width + x] = color;
    }
  };

  // 1. Draw Head
  for (let ly = 0; ly < layout.head.height; ly++) {
    for (let lx = 0; lx < layout.head.width; lx++) {
      if (isHeadPixel(lx, ly)) {
        setPixel(bodyPixels, layout.head.x + lx, layout.head.y + ly, YELLOW);
      }
    }
  }

  // 2. Draw Face (on face layer)
  // Eyes on head ly = 2 (row 6 from bottom in 1000.png, or row 3 in 8-height head: ly=2 has eyes)
  // Left eye: lx=2, 3. Right eye: lx=5, 6.
  setPixel(facePixels, layout.head.x + 2, layout.head.y + 2, BLACK);
  setPixel(facePixels, layout.head.x + 3, layout.head.y + 2, BLACK);
  setPixel(facePixels, layout.head.x + 5, layout.head.y + 2, BLACK);
  setPixel(facePixels, layout.head.x + 6, layout.head.y + 2, BLACK);

  // Smile on head ly = 4 and 5
  // Smile corners on ly=4: lx=2, lx=6
  setPixel(facePixels, layout.head.x + 2, layout.head.y + 4, BLACK);
  setPixel(facePixels, layout.head.x + 6, layout.head.y + 4, BLACK);
  // Bottom smile line on ly=5: lx=3, 4, 5
  setPixel(facePixels, layout.head.x + 3, layout.head.y + 5, BLACK);
  setPixel(facePixels, layout.head.x + 4, layout.head.y + 5, BLACK);
  setPixel(facePixels, layout.head.x + 5, layout.head.y + 5, BLACK);

  // 3. Draw Left Arm (5x10, yellow)
  for (let y = 0; y < layout.leftArm.height; y++) {
    for (let x = 0; x < layout.leftArm.width; x++) {
      setPixel(bodyPixels, layout.leftArm.x + x, layout.leftArm.y + y, YELLOW);
    }
  }

  // 4. Draw Right Arm (5x10, yellow)
  for (let y = 0; y < layout.rightArm.height; y++) {
    for (let x = 0; x < layout.rightArm.width; x++) {
      setPixel(bodyPixels, layout.rightArm.x + x, layout.rightArm.y + y, YELLOW);
    }
  }

  // 5. Draw Torso (11x10, blue)
  for (let y = 0; y < layout.torso.height; y++) {
    for (let x = 0; x < layout.torso.width; x++) {
      setPixel(bodyPixels, layout.torso.x + x, layout.torso.y + y, BLUE);
    }
  }

  // 6. Draw Legs (11x10, green with 1px seam)
  for (let y = 0; y < layout.legs.height; y++) {
    for (let x = 0; x < layout.legs.width; x++) {
      const px = layout.legs.x + x;
      const py = layout.legs.y + y;
      if (px === layout.legs.seamCol) {
        setPixel(bodyPixels, px, py, DARK_GREEN);
      } else {
        setPixel(bodyPixels, px, py, GREEN);
      }
    }
  }

  return [
    {
      id: 'layer-body',
      name: 'Body Base',
      visible: true,
      opacity: 1,
      locked: false,
      pixels: bodyPixels,
    },
    {
      id: 'layer-face',
      name: 'Face & Expression',
      visible: true,
      opacity: 1,
      locked: false,
      pixels: facePixels,
    },
    {
      id: 'layer-acc',
      name: 'Hats & Accessories',
      visible: true,
      opacity: 1,
      locked: false,
      pixels: accPixels,
    },
  ];
}

// Preset starters
export const STARTER_TEMPLATES = [
  { id: 'noob', name: 'Classic Noob', desc: 'Authentic 2006 yellow, blue & green retro avatar' },
  { id: 'guest', name: 'Classic Guest', desc: 'Black shirt with retro emblem & navy jeans' },
  { id: 'bluudude', name: 'Forsaken Bluudude', desc: 'Cyan hacker glitch skin from Retro Dev wiki' },
  { id: 'ibot', name: 'iBot Package Base', desc: 'Metallic cybernetic frame mentioned in guide' },
  { id: 'wireframe', name: 'Blank Body Wireframe', desc: 'Clean shaded mannequin ready for custom outfit' },
  { id: 'empty', name: 'Empty Canvas', desc: 'Completely blank layers with guide overlay active' },
];
