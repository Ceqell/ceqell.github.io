/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export const AboutPage: React.FC = () => {
  const apacheLicenseText = `
                                 Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.

      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.

      "Licensor" shall mean the copyright owner or entity authorized by
      the copyright owner that is granting the License.

      "Legal Entity" shall mean the union of the acting entity and all
      other entities that control, are controlled by, or are under common
      control with that entity. For the purposes of this definition,
      "control" means (i) the power, direct or indirect, to cause the
      direction or management of such entity, whether by contract or
      otherwise, or (ii) ownership of fifty percent (50%) or more of the
      outstanding shares, or (iii) beneficial ownership of such entity.

   2. Grant of Copyright License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      copyright license to reproduce, prepare Derivative Works of,
      publicly display, publicly perform, sublicense, and distribute the
      Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      (except as stated in this section) patent license to make, have made,
      use, offer to sell, sell, import, and otherwise transfer the Work.

   4. Redistribution. You may reproduce and distribute copies of the
      Work or Derivative Works thereof in any medium, with or without
      modifications, and in Source or Object form, provided that You
      meet the following conditions:

      (a) You must give any other recipients of the Work or Derivative
          Works a copy of this License; and
      (b) You must cause any modified files to carry prominent notices
          stating that You changed the files; and
      (c) You must retain, in the Source form of any Derivative Works
          that You distribute, all copyright, patent, trademark, and
          attribution notices from the Source form of the Work.

   9. Accepting Warranty or Additional Liability. While redistributing
      the Work or Derivative Works thereof, You may choose to offer,
      and charge a fee for, acceptance of support, warranty, indemnity,
      or other liability obligations and/or rights consistent with this
      License.
`;

  return (
    <div className="wiki-container">
      <p className="wiki-breadcrumb">
        <a href="#/">← Return to Sprite Editor</a>
      </p>

      <h1>About FigurayMaker & System Colophon</h1>
      <p>
        FigurayMaker is a specialized character sprite construction studio designed for engineering blocky 2D pixel avatars ("Figurays").
      </p>

      {/* System Specifications Box */}
      <div className="wiki-box">
        <div className="wiki-box-header">System Specifications</div>
        <table style={{ margin: '8px 0 0 0' }}>
          <tbody>
            <tr>
              <td style={{ width: '180px' }}><strong>Application Name:</strong></td>
              <td>FigurayMaker</td>
            </tr>
            <tr>
              <td><strong>Software Version:</strong></td>
              <td>1.0.0 (Web 1.0 Wiki Edition)</td>
            </tr>
            <tr>
              <td><strong>Target Platform:</strong></td>
              <td>Standards-Compliant Web Browsers (HTML5 Canvas & IndexedDB)</td>
            </tr>
            <tr>
              <td><strong>Font Family:</strong></td>
              <td>Times New Roman, Times, serif</td>
            </tr>
            <tr>
              <td><strong>Primary Palette:</strong></td>
              <td>Parchment (#E6D7C3), Beige (#F0E6D6), Charcoal (#2B1D0C), Brick Red (#8B2500)</td>
            </tr>
            <tr>
              <td><strong>Sprite Dimensions:</strong></td>
              <td>Canonical 21×28 Body (Head 9×8, Torso 11×10, Arms 5×10, Legs 11×10)</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Credits & Community Acknowledgment */}
      <h2>Community Credits & Acknowledgments</h2>
      <div className="wiki-box">
        <ul>
          <li>
            <strong>Original Sprite Art & Templates:</strong> Hand-drawn in 2021 by community artist{' '}
            <strong>@garlicnibbler2024</strong> (ROBLOX: <strong>@DJQ2BLUE25</strong>) in the canonical{' '}
            <code>DavidBlxTemplate.png</code> sprite sheet.
          </li>
          <li>
            <strong>Package Turnarounds Included:</strong> Robloxian 2.0, Classic 1.0 Noob, Guest, iBot Cybernetic, Classic Skeleton, Peter, Witch, Steampunk.
          </li>
          <li>
            <strong>Engineering & Architecture:</strong> Built using TypeScript, React 19, and HTML5 Canvas raster algorithms (Bresenham line, midpoint circle, scanline polygon fill).
          </li>
        </ul>
      </div>

      {/* Legal & License */}
      <h2>Software License & Legal Notice</h2>
      <div className="wiki-box">
        <div className="wiki-box-header">Apache License, Version 2.0</div>
        <pre>{apacheLicenseText}</pre>
      </div>
    </div>
  );
};
