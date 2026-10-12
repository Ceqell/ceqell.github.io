/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useSpriteContext } from '../context/SpriteContext';
import { 
  SPRITE_ATLAS, 
  SpriteAtlasEntry, 
  extractSpritePixels, 
  placeSpriteOnCanvas, 
  ScaleMode 
} from '../utils/spriteAtlas';
import { getAssetUrl } from '../utils/assetUrl';

export const AssetsPage: React.FC = () => {
  const { 
    canvasWidth, 
    canvasHeight, 
    insertAssetAsLayer, 
    stampAssetOntoActiveLayer, 
    addReferences, 
    showAnnouncement 
  } = useSpriteContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [scaleMode, setScaleMode] = useState<ScaleMode>('1x');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Available categories
  const categories = useMemo(() => {
    const list: string[] = ['all'];
    const cats = new Set(SPRITE_ATLAS.map((s) => s.category));
    cats.forEach((c) => list.push(c));
    return list;
  }, []);

  const filteredSprites = useMemo(() => {
    return SPRITE_ATLAS.filter((sprite) => {
      const matchCat = selectedCategory === 'all' || sprite.category === selectedCategory;
      const matchQuery =
        searchQuery === '' ||
        sprite.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sprite.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sprite.package && sprite.package.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchQuery;
    });
  }, [selectedCategory, searchQuery]);

  // Insert as new layer
  const handleInsertLayer = async (sprite: SpriteAtlasEntry) => {
    try {
      setProcessingId(sprite.id);
      const extracted = await extractSpritePixels(sprite, scaleMode);
      insertAssetAsLayer(sprite, extracted, scaleMode);
      window.location.hash = '#/';
    } catch (err) {
      console.error(err);
      showAnnouncement('Failed to extract sprite art.');
    } finally {
      setProcessingId(null);
    }
  };

  // Stamp onto active layer
  const handleStamp = async (sprite: SpriteAtlasEntry) => {
    try {
      setProcessingId(sprite.id);
      const extracted = await extractSpritePixels(sprite, scaleMode);
      const placed = placeSpriteOnCanvas(
        extracted.pixels,
        extracted.width,
        extracted.height,
        canvasWidth,
        canvasHeight
      );
      stampAssetOntoActiveLayer(sprite, placed, scaleMode);
      window.location.hash = '#/';
    } catch (err) {
      console.error(err);
      showAnnouncement('Failed to stamp sprite onto active layer.');
    } finally {
      setProcessingId(null);
    }
  };

  // Add as canvas trace ghost reference
  const handleTraceGhost = (sprite: SpriteAtlasEntry) => {
    const fullUrl = getAssetUrl(sprite.file);
    const traceW = scaleMode === '1x' ? sprite.wikiDimensions.width : sprite.bounds.width;
    const traceH = scaleMode === '1x' ? sprite.wikiDimensions.height : sprite.bounds.height;
    addReferences([
      {
        id: `trace-ghost-${sprite.id}-${Date.now()}`,
        name: `Trace Ghost: ${sprite.name}`,
        url: fullUrl,
        width: traceW,
        height: traceH,
        traceMode: true,
        traceOpacity: 0.45,
        traceX: Math.floor((canvasWidth - traceW) / 2),
        traceY: Math.floor((canvasHeight - traceH) / 2),
        traceScale: 1,
        windowOpen: false,
      },
    ]);
    showAnnouncement(`Loaded "${sprite.name}" as transparent canvas trace ghost.`);
    window.location.hash = '#/';
  };

  return (
    <div className="wiki-container">
      <p className="wiki-breadcrumb">
        <a href="#/">← Return to Sprite Editor</a>
      </p>

      <h1>Toolbox Assets & Community Sprite Atlas (54 Items)</h1>
      <p>
        The official 54-sprite hand-drawn anatomy and clothing catalog illustrated from <code>DavidBlxTemplate.png</code>.
        Includes canonical 9×8 heads, 11×10 torsos, 5×10 arms, 11×10 legs, and equipment accessories.
      </p>

      {/* Configuration & Scale Toggle */}
      <div className="wiki-box">
        <div className="wiki-box-header">Insertion Scale Mode</div>
        <div style={{ marginTop: '8px' }}>
          <label style={{ marginRight: '16px' }}>
            <input
              type="radio"
              name="assetScale"
              value="1x"
              checked={scaleMode === '1x'}
              onChange={() => setScaleMode('1x')}
            />
            <strong>1x Canonical Wiki Dimensions</strong> (Head 9×8, Torso 11×10, Arms 5×10, Legs 11×10 — Recommended)
          </label>
          <label>
            <input
              type="radio"
              name="assetScale"
              value="2x"
              checked={scaleMode === '2x'}
              onChange={() => setScaleMode('2x')}
            />
            <strong>2x Original Template Scale</strong> (Full resolution for HD sprite sheets)
          </label>
        </div>
      </div>

      {/* Filters */}
      <div className="wiki-box" style={{ padding: '8px 12px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div>
          <strong>Filter Category: </strong>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div>
          <strong>Search: </strong>
          <input
            type="text"
            placeholder="Search anatomical parts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '220px' }}
          />
        </div>

        <div style={{ marginLeft: 'auto', fontSize: '13px' }}>
          Showing {filteredSprites.length} of {SPRITE_ATLAS.length} items
        </div>
      </div>

      {/* Catalog Table */}
      <table>
        <thead>
          <tr>
            <th style={{ width: '50px' }}>Preview</th>
            <th>Asset Title</th>
            <th>Category</th>
            <th>Package</th>
            <th>Canonical Size</th>
            <th style={{ width: '280px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredSprites.map((sprite) => {
            const isProcessing = processingId === sprite.id;
            return (
              <tr key={sprite.id}>
                <td style={{ textAlign: 'center' }}>
                  <img
                    src={getAssetUrl(sprite.file)}
                    alt={sprite.name}
                    style={{
                      maxHeight: '40px',
                      maxWidth: '40px',
                      imageRendering: 'pixelated',
                      border: '1px solid #776655',
                      backgroundColor: '#fff',
                    }}
                  />
                </td>
                <td>
                  <strong>{sprite.name}</strong>
                  {sprite.notes && (
                    <div style={{ fontSize: '12px', color: '#5e4933' }}>{sprite.notes}</div>
                  )}
                </td>
                <td>{sprite.category}</td>
                <td>{sprite.package || 'General'}</td>
                <td>
                  {sprite.wikiDimensions.width} × {sprite.wikiDimensions.height} px
                </td>
                <td>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleInsertLayer(sprite)}
                    style={{ marginRight: '4px' }}
                  >
                    + New Layer
                  </button>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleStamp(sprite)}
                    style={{ marginRight: '4px' }}
                  >
                    Stamp Active
                  </button>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleTraceGhost(sprite)}
                  >
                    Trace Ghost
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
