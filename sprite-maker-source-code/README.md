<div align="center">
  <img src="FigurayMakerBanner4.png" alt="FigurayMaker Banner" style="max-width: 100%; box-shadow: 0 4px 20px rgba(0,0,0,0.3);" />

  # FigurayMaker

  ### <p>Make your own custom character sprites and pixel avatars!</p>
  
</div>

A specialized, professional pixel art editor and sprite construction studio built specifically for designing and exporting character sprites and pixel avatars.

Features exact anatomical dimensions (Head 9×8, Torso 11×10, Arms 5×10, Legs 11×10), moveable guide overlays, advanced layer management, reference image tracing, freehand lasso and box selection tools with pixel moving, and high-resolution PNG export.

---

## Features

### Drawing guides
- **Standard Proportions**: Built-in visual wireframe matching authentic classic blocky character proportions:
  - **Head**: 9×8 pixels (rounded retro head outline)
  - **Torso**: 11×10 pixels
  - **Left & Right Arms**: 5×10 pixels each
  - **Legs**: 11×10 pixels with center seam divider (1px line)
- **Draggable Guide System**: Toggle "Move Guide" mode or hold <kbd>Alt</kbd> to drag the reference body guide anywhere on the canvas, with 1px nudge controls and auto-centering.
- **Dimension Number Overlays**: Toggle vertical and horizontal pixel coordinate numbers directly on the body zones for exact measurement matching.

### Drawing tools & Mirror mode
- **Drawing Tools**:
  - **Pencil (`P`)**: Pixel-by-pixel drawing with selectable brush size (1px to 4px).
  - **Eraser (`E`)**: Erase pixels back to transparency.
  - **Paint Bucket (`B`)**: Flood fill contiguous color areas.
  - **Eyedropper (`I`)**: Pick colors from active or composite visible layers.
  - **Line Tool (`L`)**: Bresenham line drawing algorithm.
  - **Rectangle (`U`) & Filled Rectangle**: Crisp pixel boxes and solid fills.
  - **Circle (`C`) & Filled Circle**: Midpoint circle algorithm.
  - **Lighten / Dodge**: Brighten existing pixel shades.
  - **Darken / Burn**: Deepen shadows and create shading.
  - **Color Replace**: Swap all matching color occurrences on the active layer in a single click.
- **Auto Switch to Pencil after Eyedropper**: Toggle checkbox located at the bottom of the tools sidebar in the left panel (off by default, with hover tooltip). When enabled, sampling any color with the Eyedropper (from the canvas, floating reference image window, or browser color sampler) immediately restores the Pencil drawing tool so you can pick and draw continuously.
- **Vertical Symmetry / Mirror Mode (`S`)**: Automatically mirrors strokes along the character's torso centerline for rapid front-facing sprite design.

### Selection & Transformation engine
- **Box Select (`M`)**: Rectangular marquee selection.
- **Freehand Lasso Select (`Q`)**: Draw any enclosed polygon boundary to select non-rectangular regions using a scanline point-in-polygon engine.
- **Pixel Area Movement**:
  - Click or touch inside an active selection to lift pixels into a floating buffer.
  - Drag freely across the canvas to reposition.
  - Use keyboard arrow keys (<kbd>↑</kbd>, <kbd>↓</kbd>, <kbd>←</kbd>, <kbd>→</kbd>) to nudge floating pixels by 1px increments.
  - Press <kbd>Enter</kbd> or click **Stamp** to commit moved pixels to the layer.
- **Deletion**: Press <kbd>Delete</kbd> or <kbd>Backspace</kbd>, or click **Delete Pixels** to erase selected areas cleanly.
- **Transformation**: Flip selection horizontally or vertically.
- **On-Canvas Floating Action Bar**: Dedicated quick-action pill with Stamp, Delete, Flip, and Deselect controls optimized for mouse and touchscreen gestures.

### Layer management
- Unlimited transparent layers with custom naming and reordering.
- Per-layer visibility toggle, lock protection, and opacity slider (0% to 100%).
- **Duplicate Layer** and **Merge Down** operations.
- Undo / Redo history with multi-step stack.

### Reference images & Tracing overlays
- **Built-in Character Packages Template (`DavidBlxTemplate`)**: Every new project includes a comprehensive built-in reference image featuring character package turnarounds (**Robloxian 2.0, Skeleton, iBot, Peter**) and color swatch templates.
- **Configurable in New Project Creation**: Toggle *"Show default reference image (recommended for new users)"* right from the retro-inset in the Project Manager modal.
- Upload multiple custom reference images (character concepts, turnarounds, clothing templates).
- **Trace Mode**: Overlay translucent reference images directly onto the canvas with adjustable opacity, position offset, and scaling.
- **Floating PIP Window**: Detachable, draggable, and zoomable picture-in-picture preview window with direct color eyedropping.

### Asset Manager / Toolbox (54-Sprite Atlas)
- **Built-in Community Sprite Library**: Direct integration with the 54-sprite hand-drawn atlas originally illustrated in 2021 by **@garlicnibbler2024** (ROBLOX: **@DJQ2BLUE25**) from `DavidBlxTemplate.png`.
- **Categorized Anatomical Catalog**:
  - **Full Characters**: Robloxian 2.0, Classic 1.0 Noob, Guest, iBot Cybernetic, Classic Skeleton, Peter, Witch, Steampunk.
  - **Heads & Faces**: Authentic 9×8 heads with retro faces, visors, sunglasses, skulls, and expressions.
  - **Torsos**: 11×10 pixel torsos with authentic shading, ribcages, robotic plating, and jackets.
  - **Arms & Shoulders**: 5×10 pixel limbs for Left and Right arms with gauntlets and robotic joints.
  - **Legs & Boots**: 11×10 pixel legs with center seam split, armored boots, and robotic treads.
  - **Accessories & Hats**: Hairpieces, visors, capes, wings, swords, and equipment.
- **Wiki Canonical 1x Scaling vs 4x High-Res Toggle**:
  - **1x Canonical (Default)**: Automatically downscales template sprites to official community wiki dimensions (Head 9×8, Torso 11×10, Arms 5×10, Legs 11×10, total body 21×28) using clean nearest-neighbor pixel sampling.
  - **4x Template Scale**: Import full-magnification high-res raster art for larger HD sprite sheets.
- **4 Powerful Insertion Actions**:
  1. **Add as New Layer**: Inserts the asset onto a dedicated, transparent layer with centered canonical alignment.
  2. **Stamp onto Active Layer**: Imprints pixel art directly into your working layer without altering existing pixels elsewhere.
  3. **Open Floating Reference Window (PIP)**: Pops the asset into a movable, resizable PIP window with virtual pan, zoom, and live color eyedropping.
  4. **Set as Canvas Trace Ghost**: Projects the part semi-transparently (45% opacity) directly on your main drawing canvas stage for pixel-by-pixel manual tracing.
- **Quick Access**: Available via the top header **Toolbox** button and the left toolbar **Toolbox Assets** shortcut.

### Revamped Starter Templates & Package Loaders
- **Authentic Hand-Drawn Packages**: Replaced synthetic procedural blocks with genuine community-crafted package sprites (Classic Noob 1.0, Guest, Robloxian 2.0, iBot, Skeleton, Peter, BluuDude Hacker, Neutral Wireframe, Blank Canvas).
- **Smart Canvas Auto-Resize**: Option to automatically expand or adapt your canvas dimensions (e.g. 21×28 Classic or 25×32 with Headroom) to match package proportions.
- **Multi-Layer Separation**: Starters load as organized, non-destructive layer stacks (Head, Torso, Limbs, Clothing) for modular customization.
- **Dedicated Modal**: Accessed via the **Load Starter** (`Sparkles` icon) button in the top navigation header.

### Real-time preview & Canvas backgrounds
- **Synchronized Backgrounds**: Toggle between Dark Checkerboard (`Dark-Check`, default across all themes for optimal contrast with characters and noobs), Light Checkerboard (`Light-Check`), authentic Retro Grey (`#404044`), and solid Dark (`#121318`).
- **Unified Preview & Stage**: Changing the background in the Real-time Preview panel, bottom canvas indicator, or top bar immediately updates both the 1×/3× real-time preview and the main central drawing canvas stage regardless of the active UI theme.

### Canvas presets & Saving/loading
- **Built-in Presets**:
  - **Retro Dev Classic (21 × 28)**: Exact wiki body boundary.
  - **With Headroom / Hats (25 × 32)**: +4px top margin for hats and hair, +2px side margins for equipment.
  - **Square Avatar (32 × 32)**: Standard square format for game engines and profile icons.
  - **Extended Gear Space (36 × 36)**: Extra space for wings, capes, giant swords, and accessories.
- **Custom Dimensions**: Resize canvas to any width/height with anchor alignment (Center, Top-Left, Bottom-Center).
- **Starter Templates**: Blank, Classic Noob, Guest, BluuDude (Glitch Hacker), iBot (Cybernetic), and Neutral Wireframe.
- **Save & Load JSON**: Export and import complete `.json` project files preserving all layers, references, palette, and guide positions.

### Export options
- Export crisp PNG files at multiple scales (1×, 2×, 4×, 8×, 16×, 32×) or custom pixel dimensions with aspect ratio preservation.
- Background selection: Transparent, solid custom color, or checkerboard.
- Optional inclusion of reference guides and dimension markers.

### Responsive & Touch gestures
- **1-Finger Draw & Touch Select**: Smooth touch drawing and selection movement.
- **2-Finger Pinch Zoom & Pan**: Fluid navigation on mobile devices and tablets.
- **Horizontally Scrollable Header**: Full access to all top-bar controls on small screens.
- **Resizable Sidebars**: Draggable splitter handles to customize sidebar widths or collapse them.
- **Snappy Mode Toggle**: Turn off CSS transitions for ultra-low latency, instant-response drawing.

---

## Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>P</kbd> | Pencil Tool |
| <kbd>E</kbd> | Eraser Tool |
| <kbd>B</kbd> | Bucket Fill Tool |
| <kbd>I</kbd> | Eyedropper Tool |
| <kbd>L</kbd> | Line Tool |
| <kbd>U</kbd> | Rectangle Tool |
| <kbd>C</kbd> | Circle Tool |
| <kbd>M</kbd> | Box Select Tool |
| <kbd>Q</kbd> | Lasso Select Tool |
| <kbd>S</kbd> | Toggle Vertical Symmetry / Mirror Mode |
| <kbd>G</kbd> | Toggle Pixel Grid |
| <kbd>H</kbd> | Toggle Body Guides |
| <kbd>N</kbd> | Toggle Dimension Numbers |
| <kbd>[</kbd> / <kbd>]</kbd> | Decrease / Increase Brush Size |
| <kbd>Ctrl</kbd> + <kbd>Z</kbd> | Undo |
| <kbd>Ctrl</kbd> + <kbd>Y</kbd> / <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Z</kbd> | Redo |
| <kbd>Delete</kbd> / <kbd>Backspace</kbd> | Delete Selected Pixels |
| <kbd>Enter</kbd> | Stamp / Commit Floating Selection |
| <kbd>Escape</kbd> | Deselect Active Selection |
| <kbd>Arrow Keys</kbd> | Nudge Floating Selection by 1px |
| <kbd>Space</kbd> + Drag / Middle Click | Pan Canvas Stage |
| Mouse Wheel | Zoom In / Out |

---

## Tech used

- **Framework**: React 19 + TypeScript
- **Bundler & Dev Server**: Vite 8
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Canvas Rendering**: High-performance dual-canvas architecture (HTML5 Canvas 2D Context + CSS integer pixel scaling)

---

## Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd retro-dev-sprite-maker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000`.

### Available Scripts
- `npm run dev`: Starts the local Vite development server on port 3000.
- `npm run build`: Compiles TypeScript and creates a production bundle in `dist/`.
- `npm run preview`: Locally preview the production build.
- `npm run lint`: Runs TypeScript type checking (`tsc --noEmit`).

---

## Project Structure

```
├── FigurayMaker.png             # Application brand and avatar logo image
├── FigurayMaker.ico             # Windows/favicon ICO resource
├── public/                      # Static web assets served by Vite
│   ├── favicon.ico              # Browser tab icon (.ico format)
│   ├── favicon.png              # Browser tab icon (.png format)
│   ├── FigurayMaker.ico         # FigurayMaker icon resource
│   └── FigurayMaker.png         # FigurayMaker high-res icon
├── index.html                   # HTML entry point with metadata and favicon links
├── package.json                 # Project dependencies and npm scripts
├── tsconfig.json                # TypeScript compiler configuration
├── vite.config.ts               # Vite bundler configuration
└── src/
    ├── App.tsx                  # Main application state, shortcut manager, and layout
    ├── main.tsx                 # React application mounting entry point
    ├── index.css                # Global styles, Tailwind imports, and pixelated canvas rules
    ├── components/
    │   ├── AboutModal.tsx       # System specs, engine features, and Apache 2.0 license
    │   ├── AssetManagerModal.tsx# 54-sprite toolbox catalog with multi-mode asset insertion
    │   ├── CanvasArea.tsx       # Main drawing canvas, zoom/pan stage, and selection overlay
    │   ├── ColorPalette.tsx     # Color picker, swatch palette presets, and custom colors
    │   ├── CustomCanvasModal.tsx# Custom dimension resize modal with anchor points
    │   ├── ExportModal.tsx      # High-res PNG export modal with scaling and backgrounds
    │   ├── GuideModal.tsx       # Anatomical wiki guide documentation modal
    │   ├── Header.tsx           # Horizontally scrollable top bar with toggles and menus
    │   ├── HelpModal.tsx        # Comprehensive user manual, tool guides, and shortcuts
    │   ├── LayersPanel.tsx      # Layer stack list, visibility, locking, and opacity
    │   ├── MiniPreview.tsx      # Real-time 1:1 sprite preview thumbnail
    │   ├── ProjectManagerModal.tsx # Pixlr-style local saves, project management, and templates
    │   ├── ReferenceManager.tsx # Multiple reference image manager with trace options
    │   ├── StarterModal.tsx     # Authentic hand-drawn community packages & template loader
    │   ├── Toast.tsx            # Non-blocking HUD toast notification system
    │   └── Toolbar.tsx          # Resizable tool palette, brush sizes, and selection actions
    ├── constants/
    │   ├── defaultReference.ts  # Default reference image asset initialization
    │   ├── retroDev.ts          # Body dimension constants, presets, and starter templates
    │   └── spriteAtlas.json     # Compiled metadata for all 54 David Blocks sprite assets
    ├── types/
    │   └── sprite.ts            # TypeScript interfaces for layers, selections, palettes, and projects
    └── utils/
        ├── pixelMath.ts         # Bresenham lines, flood fill, polygon math, and color adjusters
        └── spriteAtlas.ts       # Sprite atlas pixel decoding, 1x scaling, and starter builders
```

---

## Credits & Acknowledgements

- **Sprite Atlas & Original Character Artwork (2021)**:
  - **@garlicnibbler2024** (ROBLOX handle: **@DJQ2BLUE25**) — Illustrated the foundational 2021 David Blocks character turnaround sheet and sprite atlas (`DavidBlxTemplate.png`). This handcrafted sprite sheet provides the original pixel art powering FigurayMaker's 54 modular Toolbox parts and revamped starter packages.
  - *Provenance Note*: The original creator subsequently migrated accounts, with their last active public message noted in the Tower Defense Simulator (TDS) Discord server back in 2025. Although refreshed direct permission could not be obtained at this time, full credit and sincere appreciation for their foundational pixel art are respectfully recorded and preserved here.
- **Retro Dev Wiki Community**: For formalizing the community consensus on David Blocks canonical sprite dimensions (9×8 head, 11×10 torso and legs, 5×10 arms per [Retro Dev Wiki](https://retro-dev.fandom.com/wiki/Untitled_Character_Sprites)).
- **FigurayMaker Project**: Dedicated to retro Roblox and David Blocks sprite and avatar creators.

---

## License

This project is open source and available under the [Apache License 2.0](../LICENSE).