/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useSpriteContext } from '../context/SpriteContext';
import { 
  REVAMPED_STARTER_TEMPLATES, 
  RevampedStarter, 
  SPRITE_ATLAS, 
  ScaleMode 
} from '../utils/spriteAtlas';
import { getAssetUrl } from '../utils/assetUrl';

export const StartersPage: React.FC = () => {
  const { loadStarterTemplate } = useSpriteContext();

  const [selectedPackageFilter, setSelectedPackageFilter] = useState<string>('all');
  const [scaleMode, setScaleMode] = useState<ScaleMode>('1x');
  const [autoResizeCanvas, setAutoResizeCanvas] = useState<boolean>(true);

  const packages = useMemo(() => {
    const set = new Set<string>();
    REVAMPED_STARTER_TEMPLATES.forEach((t) => set.add(t.package));
    return ['all', ...Array.from(set)];
  }, []);

  const filteredStarters = useMemo(() => {
    if (selectedPackageFilter === 'all') return REVAMPED_STARTER_TEMPLATES;
    return REVAMPED_STARTER_TEMPLATES.filter((t) => t.package === selectedPackageFilter);
  }, [selectedPackageFilter]);

  const handleInstall = (starter: RevampedStarter) => {
    loadStarterTemplate(starter, autoResizeCanvas, scaleMode);
    window.location.hash = '#/';
  };

  return (
    <div className="wiki-container">
      <p className="wiki-breadcrumb">
        <a href="#/">← Return to Sprite Editor</a>
      </p>

      <h1>Starter Packages & Character Templates</h1>
      <p>
        Select from canonical community sprite packages illustrated from <code>DavidBlxTemplate.png</code>. 
        Each package automatically generates pre-assembled character layers with canonical anatomical proportions.
      </p>

      {/* Global Configuration Controls */}
      <div className="wiki-box">
        <div className="wiki-box-header">Installation Preferences</div>
        <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div>
            <strong>Scale Multiplier: </strong>
            <label style={{ marginRight: '16px' }}>
              <input
                type="radio"
                name="scaleMode"
                value="1x"
                checked={scaleMode === '1x'}
                onChange={() => setScaleMode('1x')}
              />
              <strong>1x Canonical Wiki Scale</strong> (21×28 or 25×32 body — Recommended)
            </label>
            <label>
              <input
                type="radio"
                name="scaleMode"
                value="2x"
                checked={scaleMode === '2x'}
                onChange={() => setScaleMode('2x')}
              />
              <strong>2x High-Resolution Scale</strong> (Double dimensions for larger sprites)
            </label>
          </div>

          <div>
            <label>
              <input
                type="checkbox"
                checked={autoResizeCanvas}
                onChange={(e) => setAutoResizeCanvas(e.target.checked)}
              />
              Automatically adapt editor canvas dimensions to fit template proportions
            </label>
          </div>
        </div>
      </div>

      {/* Package Filter Bar */}
      <div className="wiki-box" style={{ padding: '8px 12px' }}>
        <strong>Filter by Package: </strong>
        {packages.map((pkg) => (
          <span key={pkg} style={{ marginRight: '8px' }}>
            {selectedPackageFilter === pkg ? (
              <strong>[{pkg.toUpperCase()}]</strong>
            ) : (
              <a href="#" onClick={(e) => { e.preventDefault(); setSelectedPackageFilter(pkg); }}>
                {pkg}
              </a>
            )}
          </span>
        ))}
      </div>

      {/* Template Table */}
      <table>
        <thead>
          <tr>
            <th style={{ width: '60px' }}>Preview</th>
            <th>Template Name</th>
            <th>Package Type</th>
            <th>Badge</th>
            <th>Recommended Canvas</th>
            <th style={{ width: '130px' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredStarters.map((starter) => {
            const recW = scaleMode === '1x' ? starter.recommendedWidth1x : starter.recommendedWidth2x;
            const recH = scaleMode === '1x' ? starter.recommendedHeight1x : starter.recommendedHeight2x;
            const spriteEntry = SPRITE_ATLAS.find((s) => s.index === starter.spriteIndex);

            return (
              <tr key={starter.id}>
                <td style={{ textAlign: 'center' }}>
                  {spriteEntry ? (
                    <img
                      src={getAssetUrl(spriteEntry.file)}
                      alt={starter.name}
                      style={{
                        maxHeight: '48px',
                        maxWidth: '48px',
                        imageRendering: 'pixelated',
                        border: '1px solid #776655',
                        backgroundColor: '#fff',
                      }}
                    />
                  ) : (
                    <span>[Blank]</span>
                  )}
                </td>
                <td>
                  <strong>{starter.name}</strong>
                  <div style={{ fontSize: '13px', color: '#5e4933' }}>{starter.desc}</div>
                </td>
                <td>{starter.package}</td>
                <td><code>{starter.badge}</code></td>
                <td>
                  {recW} × {recH} px
                </td>
                <td>
                  <button type="button" onClick={() => handleInstall(starter)}>
                    [ Install Template ]
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
