/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { useSpriteContext } from '../context/SpriteContext';
import { ReferenceImage } from '../types/sprite';

export const ReferenceManager: React.FC = () => {
  const {
    references,
    addReferences,
    updateReference,
    deleteReference,
    activeRefId,
    setActiveRefId,
  } = useSpriteContext();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const newRefs: ReferenceImage[] = [];

    fileList.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (!dataUrl) return;

        const img = new Image();
        img.onload = () => {
          newRefs.push({
            id: `ref-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            name: file.name,
            url: dataUrl,
            width: img.width,
            height: img.height,
            traceMode: false,
            traceOpacity: 0.45,
            traceX: 0,
            traceY: 0,
            traceScale: 1,
            windowOpen: false,
          });

          if (newRefs.length === fileList.length) {
            addReferences(newRefs);
          }
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="wiki-box" style={{ marginBottom: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="wiki-box-header">
        <span>Reference & Tracing Overlays ({references.length})</span>
        <button type="button" onClick={() => fileInputRef.current?.click()}>
          + Upload Image
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      {references.length === 0 ? (
        <p style={{ fontSize: '13px', margin: '8px 0 0 0', color: '#5e4933' }}>
          No reference images uploaded. Upload a character concept or turnaround sheet to trace.
        </p>
      ) : (
        <table style={{ margin: '8px 0 0 0', fontSize: '13px' }}>
          <thead>
            <tr>
              <th>Name</th>
              <th style={{ width: '45px' }}>Trace</th>
              <th style={{ width: '50px' }}>Opacity</th>
              <th style={{ width: '40px' }}>X / Y</th>
              <th style={{ width: '40px' }}>Del</th>
            </tr>
          </thead>
          <tbody>
            {references.map((ref) => (
              <tr key={ref.id} style={{ backgroundColor: activeRefId === ref.id ? '#dfd2c0' : 'transparent' }}>
                <td>
                  <strong
                    onClick={() => setActiveRefId(ref.id)}
                    style={{ cursor: 'pointer' }}
                    title={ref.name}
                  >
                    {ref.name.length > 20 ? `${ref.name.substring(0, 18)}...` : ref.name}
                  </strong>
                  <div style={{ fontSize: '11px', color: '#5e4933' }}>
                    {ref.width} × {ref.height} px
                  </div>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={ref.traceMode}
                    onChange={(e) => updateReference(ref.id, { traceMode: e.target.checked })}
                    title="Toggle Canvas Trace Ghost"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="5"
                    value={Math.round(ref.traceOpacity * 100)}
                    onChange={(e) => updateReference(ref.id, { traceOpacity: Number(e.target.value) / 100 })}
                    style={{ width: '42px', padding: '1px' }}
                  />%
                </td>
                <td>
                  <input
                    type="number"
                    value={ref.traceX}
                    onChange={(e) => updateReference(ref.id, { traceX: Number(e.target.value) })}
                    style={{ width: '36px', padding: '1px', marginBottom: '2px' }}
                    title="Trace X Offset"
                  />
                  <input
                    type="number"
                    value={ref.traceY}
                    onChange={(e) => updateReference(ref.id, { traceY: Number(e.target.value) })}
                    style={{ width: '36px', padding: '1px' }}
                    title="Trace Y Offset"
                  />
                </td>
                <td style={{ textAlign: 'center' }}>
                  <button type="button" onClick={() => deleteReference(ref.id)} style={{ padding: '0 4px' }}>
                    X
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
