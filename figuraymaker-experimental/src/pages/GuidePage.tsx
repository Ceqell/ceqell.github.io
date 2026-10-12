/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export const GuidePage: React.FC = () => {
  return (
    <div className="wiki-container">
      <p className="wiki-breadcrumb">
        <a href="#/">← Return to Sprite Editor</a>
      </p>

      <h1>Character Sprite Dimensions & Anatomical Specification Sheet</h1>
      <p>
        Official anatomical construction guidelines for classic blocky pixel character avatars ("Figurays").
      </p>

      {/* Official Wiki Quote Box */}
      <div className="wiki-box" style={{ borderLeft: '4px solid #8b2500' }}>
        <div className="wiki-box-header">Official Canonical Community Instructions</div>
        <p style={{ fontStyle: 'italic', marginTop: '8px', fontSize: '16px' }}>
          "The process of making a character sprite's body parts are very easy. 
          The legs and torso are 11×10 pixels, the arms are 5×10 and the head is 9×8. 
          After you are done with the body, design on the accessories begins."
        </p>
      </div>

      {/* Proportions Breakdown Table */}
      <h2>Body Zone Dimensional Matrix</h2>
      <table>
        <thead>
          <tr>
            <th>Anatomical Part</th>
            <th>Width × Height</th>
            <th>Pixel Area</th>
            <th>Construction Pattern & Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Head</strong></td>
            <td><strong>9 × 8 pixels</strong></td>
            <td>~58 px</td>
            <td>
              Contoured retro head outline with rounded corner dips: 3px top crown, 7px row 2, 9px central face, 7px row 7, 5px neck collar. Centered above torso.
            </td>
          </tr>
          <tr>
            <td><strong>Torso</strong></td>
            <td><strong>11 × 10 pixels</strong></td>
            <td>110 px</td>
            <td>
              Solid rectangular trunk. Forms the core vertical anchor for chest emblems, jackets, and armor plates.
            </td>
          </tr>
          <tr>
            <td><strong>Left Arm</strong></td>
            <td><strong>5 × 10 pixels</strong></td>
            <td>50 px</td>
            <td>
              Flanks the torso on the left edge. Aligned flush with torso top at row Y=8.
            </td>
          </tr>
          <tr>
            <td><strong>Right Arm</strong></td>
            <td><strong>5 × 10 pixels</strong></td>
            <td>50 px</td>
            <td>
              Flanks the torso on the right edge. Aligned flush with torso top at row Y=8.
            </td>
          </tr>
          <tr>
            <td><strong>Legs & Lower Body</strong></td>
            <td><strong>11 × 10 pixels</strong></td>
            <td>110 px</td>
            <td>
              Spans the full width of the torso directly beneath it, featuring a 1-pixel center seam split down the middle dividing Left and Right legs.
            </td>
          </tr>
          <tr>
            <td><strong>Complete Avatar Body</strong></td>
            <td><strong>21 × 28 pixels</strong></td>
            <td>370 px</td>
            <td>
              Total span from outer arm to outer arm (5 + 11 + 5 = 21px width) and from crown of head to soles of feet (8 + 10 + 10 = 28px height).
            </td>
          </tr>
        </tbody>
      </table>

      {/* Proportions Illustration Reference */}
      <div className="wiki-box">
        <div className="wiki-box-header">ASCII Structural Alignment Diagram</div>
        <pre>{`
          [  Head: 9 × 8  ]
                 |
      +----------+----------+
      |                     |
[ Arm: 5×10 ] [ Torso: 11×10 ] [ Arm: 5×10 ]
      |          |          |
      |   [ Legs: 11×10 ]   |
      |   (Split Center 1px)|
      +----------+----------+
Total Width:  5 + 11 + 5 = 21 Pixels
Total Height: 8 + 10 + 10 = 28 Pixels
`}</pre>
      </div>

      {/* Accessories & Headroom Advice */}
      <div className="wiki-box">
        <div className="wiki-box-header">Headroom & Accessory Clearance Recommendations</div>
        <ul>
          <li>
            <strong>Headroom for Hats & Hair:</strong> While the body fits in 21×28, top hats, fedoras, and tall hair require at least +4 pixels vertical space above the head. We recommend using the <code>25 × 32</code> canvas preset.
          </li>
          <li>
            <strong>Side Equipment:</strong> Large swords, shields, and wings require +2 to +4 pixels on either flank. For heavy gear, consider the <code>36 × 36</code> canvas preset.
          </li>
          <li>
            <strong>Symmetry Shortcut:</strong> Use the <code>Vertical Symmetry [S]</code> tool to draw front-facing character torsos and faces twice as fast by mirroring along the center spine.
          </li>
        </ul>
      </div>
    </div>
  );
};
