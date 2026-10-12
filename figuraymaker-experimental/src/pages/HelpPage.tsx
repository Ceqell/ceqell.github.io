/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export const HelpPage: React.FC = () => {
  return (
    <div className="wiki-container">
      <p className="wiki-breadcrumb">
        <a href="#/">← Return to Sprite Editor</a>
      </p>

      <h1>FigurayMaker: Comprehensive User Manual & Technical Reference</h1>
      <p>
        Welcome to the documentation handbook for FigurayMaker. Use the table of contents below to quickly jump to specific tool operations.
      </p>

      {/* Table of Contents */}
      <div className="wiki-box">
        <div className="wiki-box-header">Documentation Table of Contents</div>
        <ul style={{ margin: '6px 0', paddingLeft: '20px' }}>
          <li><a href="#drawing-tools">1. Drawing Tools & Raster Operations</a></li>
          <li><a href="#selection-engine">2. Marquee Selection & Pixel Movement Engine</a></li>
          <li><a href="#layer-system">3. Layer Management & Non-Destructive Compositing</a></li>
          <li><a href="#symmetry-guides">4. Vertical Symmetry Mirror & Anatomical Body Guides</a></li>
          <li><a href="#reference-images">5. Reference Turnarounds & Canvas Ghost Tracing</a></li>
          <li><a href="#keybindings-ref">6. Default Keyboard Shortcuts Matrix</a></li>
        </ul>
      </div>

      {/* Section 1 */}
      <h2 id="drawing-tools">1. Drawing Tools & Raster Operations</h2>
      <table>
        <thead>
          <tr>
            <th style={{ width: '130px' }}>Tool Name</th>
            <th style={{ width: '60px' }}>Key</th>
            <th>Operational Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Pencil</strong></td>
            <td><code>P</code></td>
            <td>Draws pixel-by-pixel strokes using the active foreground color. Brush diameter is adjustable from 1px to 4px.</td>
          </tr>
          <tr>
            <td><strong>Eraser</strong></td>
            <td><code>E</code></td>
            <td>Clears pixels back to complete transparency on the active layer.</td>
          </tr>
          <tr>
            <td><strong>Paint Bucket</strong></td>
            <td><code>B</code></td>
            <td>Flood-fills contiguous matching color regions on the working layer.</td>
          </tr>
          <tr>
            <td><strong>Eyedropper</strong></td>
            <td><code>I</code></td>
            <td>Samples exact color hex values directly from the canvas or reference window.</td>
          </tr>
          <tr>
            <td><strong>Line Tool</strong></td>
            <td><code>L</code></td>
            <td>Draws straight lines between two points using Bresenham's integer rasterization algorithm.</td>
          </tr>
          <tr>
            <td><strong>Rectangle & Fill</strong></td>
            <td><code>U</code></td>
            <td>Draws rectangular borders or solid boxes by dragging opposite corners.</td>
          </tr>
          <tr>
            <td><strong>Circle & Fill</strong></td>
            <td><code>C</code></td>
            <td>Draws circular outlines or filled ellipses using the Midpoint circle algorithm.</td>
          </tr>
          <tr>
            <td><strong>Dodge (Lighten)</strong></td>
            <td>—</td>
            <td>Increases luminance of existing drawn pixels on the active layer for quick highlight shading.</td>
          </tr>
          <tr>
            <td><strong>Burn (Darken)</strong></td>
            <td>—</td>
            <td>Decreases luminance of existing pixels for rapid shadow and fold rendering.</td>
          </tr>
          <tr>
            <td><strong>Color Replace</strong></td>
            <td>—</td>
            <td>Swaps all occurrences of the clicked color on the active layer with the foreground color.</td>
          </tr>
        </tbody>
      </table>

      {/* Section 2 */}
      <h2 id="selection-engine">2. Marquee Selection & Pixel Movement Engine</h2>
      <div className="wiki-box">
        <p>
          FigurayMaker supports two distinct selection modes:
        </p>
        <ul>
          <li><strong>Box Select (<code>M</code>):</strong> Drag a rectangular marquee over any region of the canvas.</li>
          <li><strong>Freehand Lasso (<code>Q</code>):</strong> Draw a custom polygon perimeter around non-rectangular shapes. Uses a scanline point-in-polygon engine to calculate selected coordinates.</li>
        </ul>
        <p><strong>Transforming and Moving Selected Pixels:</strong></p>
        <ol>
          <li>With an active selection, click and drag inside the marquee to lift pixels into a floating buffer.</li>
          <li>Reposition pixels freely across the canvas, or use the keyboard arrow keys (<code>↑</code>, <code>↓</code>, <code>←</code>, <code>→</code>) to nudge 1px at a time.</li>
          <li>Press <code>Enter</code> or click <strong>Stamp</strong> to commit moved pixels back to the active layer.</li>
          <li>Press <code>Delete</code> or <code>Backspace</code> to erase selected pixels cleanly.</li>
        </ol>
      </div>

      {/* Section 3 */}
      <h2 id="layer-system">3. Layer Management & Non-Destructive Compositing</h2>
      <div className="wiki-box">
        <p>
          Layers allow non-destructive separation between body outlines, clothing, armor, and accessories.
        </p>
        <ul>
          <li><strong>Stacking Order:</strong> Layers higher in the table are rendered on top of lower layers.</li>
          <li><strong>Visibility Toggle:</strong> Toggle the visibility checkbox to hide or show layers without losing pixel data.</li>
          <li><strong>Lock Protection:</strong> Lock a layer to prevent accidental edits while painting overlapping details.</li>
          <li><strong>Opacity Control:</strong> Lower layer opacity to create translucent glasses, visors, capes, or water effects.</li>
          <li><strong>Merge Down:</strong> Combine the active layer into the layer directly beneath it into a single composite layer.</li>
        </ul>
      </div>

      {/* Section 4 */}
      <h2 id="symmetry-guides">4. Vertical Symmetry Mirror & Anatomical Body Guides</h2>
      <div className="wiki-box">
        <p>
          <strong>Symmetry Mode (<code>S</code>):</strong> Mirrored drawing along the character's vertical centerline. Any stroke made on the left arm or left side of the face is automatically reflected onto the right side.
        </p>
        <p>
          <strong>Draggable Guide System:</strong> Toggle "Move Guide" or hold <code>Alt</code> to drag the 21×28 anatomical wireframe anywhere on your canvas, with 1px nudge buttons and quick auto-centering.
        </p>
      </div>

      {/* Section 5 */}
      <h2 id="reference-images">5. Reference Turnarounds & Canvas Ghost Tracing</h2>
      <div className="wiki-box">
        <p>
          Upload any reference concept art, character sheet, or turnaround image. 
          Toggle <strong>Trace Mode</strong> to project a semi-transparent ghost overlay directly onto your drawing canvas for pixel-by-pixel tracing.
        </p>
      </div>

      {/* Section 6 */}
      <h2 id="keybindings-ref">6. Default Keyboard Shortcuts Matrix</h2>
      <table>
        <thead>
          <tr>
            <th>Shortcut Action</th>
            <th>Default Key</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Pencil Tool</td><td><code>P</code></td><td>Drawing Tools</td></tr>
          <tr><td>Eraser Tool</td><td><code>E</code></td><td>Drawing Tools</td></tr>
          <tr><td>Paint Bucket</td><td><code>B</code></td><td>Drawing Tools</td></tr>
          <tr><td>Eyedropper</td><td><code>I</code></td><td>Drawing Tools</td></tr>
          <tr><td>Line Tool</td><td><code>L</code></td><td>Drawing Tools</td></tr>
          <tr><td>Rectangle Tool</td><td><code>U</code></td><td>Drawing Tools</td></tr>
          <tr><td>Circle Tool</td><td><code>C</code></td><td>Drawing Tools</td></tr>
          <tr><td>Box Selection</td><td><code>M</code></td><td>Selection</td></tr>
          <tr><td>Lasso Selection</td><td><code>Q</code></td><td>Selection</td></tr>
          <tr><td>Toggle Vertical Symmetry</td><td><code>S</code></td><td>Canvas Toggles</td></tr>
          <tr><td>Toggle Grid Lines</td><td><code>G</code></td><td>Canvas Toggles</td></tr>
          <tr><td>Undo Last Action</td><td><code>Ctrl + Z</code></td><td>History</td></tr>
          <tr><td>Redo Action</td><td><code>Ctrl + Y</code> / <code>Ctrl + Shift + Z</code></td><td>History</td></tr>
          <tr><td>Zoom In Canvas</td><td><code>+</code></td><td>Navigation</td></tr>
          <tr><td>Zoom Out Canvas</td><td><code>-</code></td><td>Navigation</td></tr>
        </tbody>
      </table>
    </div>
  );
};
