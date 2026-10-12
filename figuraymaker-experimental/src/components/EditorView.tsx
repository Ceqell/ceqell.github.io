/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { useSpriteContext } from '../context/SpriteContext';
import { Header } from './Header';
import { Toolbar } from './Toolbar';
import { ColorPalette } from './ColorPalette';
import { LayersPanel } from './LayersPanel';
import { MiniPreview } from './MiniPreview';
import { ReferenceManager } from './ReferenceManager';
import { CanvasArea } from './CanvasArea';

export const EditorView: React.FC = () => {
  const {
    canvasWidth,
    canvasHeight,
    canvasPresetName,
    layers,
    activeLayerId,
    updateLayerPixels,
    commitHistory,
    currentTool,
    setCurrentTool,
    currentColor,
    setCurrentColor,
    brushSize,
    showGrid,
    setShowGrid,
    showGuides,
    setShowGuides,
    showNumbers,
    setShowNumbers,
    isMovingGuide,
    setIsMovingGuide,
    symmetryActive,
    setSymmetryActive,
    bodyOffsetX,
    bodyOffsetY,
    guideOffset,
    setGuideOffset,
    centerGuide,
    references,
    selection,
    setSelection,
    deleteSelection,
    commitFloatingSelection,
    flipSelectionH,
    flipSelectionV,
    clearSelection,
    zoom,
    setZoom,
    canvasBg,
    cycleCanvasBg,
    keybindings,
    undo,
    redo,
    autoSwitchPencil,
    announcement,
    clearAnnouncement,
  } = useSpriteContext();

  // Global keybindings listener for the editor stage
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input or textarea
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      const key = e.key.toUpperCase();
      const ctrlOrMeta = e.ctrlKey || e.metaKey;

      if (ctrlOrMeta && key === 'Z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }

      if (ctrlOrMeta && key === 'Y') {
        e.preventDefault();
        redo();
        return;
      }

      // Single-key tool selections matching defaults or keybindings
      if (key === (keybindings.tool_pencil || 'P')) setCurrentTool('pencil');
      else if (key === (keybindings.tool_eraser || 'E')) setCurrentTool('eraser');
      else if (key === (keybindings.tool_bucket || 'B')) setCurrentTool('bucket');
      else if (key === (keybindings.tool_eyedropper || 'I')) setCurrentTool('eyedropper');
      else if (key === (keybindings.tool_line || 'L')) setCurrentTool('line');
      else if (key === (keybindings.tool_rectangle || 'U')) setCurrentTool('rectangle');
      else if (key === (keybindings.tool_circle || 'C')) setCurrentTool('circle');
      else if (key === (keybindings.tool_select || 'M')) setCurrentTool('select');
      else if (key === (keybindings.tool_lasso || 'Q')) setCurrentTool('lasso');
      else if (key === (keybindings.toggle_symmetry || 'S')) setSymmetryActive((prev) => !prev);
      else if (key === (keybindings.toggle_grid || 'G')) setShowGrid((prev) => !prev);
      else if (key === '=') setZoom((z) => Math.min(48, z + 2));
      else if (key === '-') setZoom((z) => Math.max(2, z - 2));
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keybindings, setCurrentTool, setSymmetryActive, setShowGrid, setZoom, undo, redo]);

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '12px' }}>
      <Header />

      {/* Inline Announcement Bar */}
      {announcement && (
        <div className="wiki-announcement">
          <span>{announcement}</span>
          <button type="button" onClick={clearAnnouncement} style={{ padding: '0 6px', fontSize: '12px' }}>
            Dismiss
          </button>
        </div>
      )}

      {/* Main 3-Column Document Workspace */}
      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Left Column: Tools & Palette */}
        <div style={{ width: '270px', flexShrink: 0 }}>
          <Toolbar />
          <ColorPalette />
        </div>

        {/* Center Column: Drawing Stage */}
        <div style={{ flex: '1 1 500px', minWidth: '320px' }}>
          <div className="wiki-box" style={{ padding: '10px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
                fontSize: '13px',
              }}
            >
              <span>
                <strong>Canvas Stage:</strong> {canvasWidth} × {canvasHeight} px ({canvasPresetName})
              </span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  type="button"
                  onClick={() => setIsMovingGuide((prev) => !prev)}
                  style={{
                    backgroundColor: isMovingGuide ? '#dfd2c0' : undefined,
                    fontWeight: isMovingGuide ? 'bold' : 'normal',
                  }}
                  title="Drag body guide outline across canvas"
                >
                  {isMovingGuide ? '[ Moving Guide ]' : 'Move Guide'}
                </button>
                <button type="button" onClick={centerGuide} title="Re-center guide offset">
                  Center Guide
                </button>
              </div>
            </div>

            {/* Central Canvas Element */}
            <div
              style={{
                height: '560px',
                border: '1px solid #776655',
                overflow: 'hidden',
                position: 'relative',
                backgroundColor: '#1a1a1c',
              }}
            >
              <CanvasArea
                canvasWidth={canvasWidth}
                canvasHeight={canvasHeight}
                layers={layers}
                activeLayerId={activeLayerId}
                onUpdateLayerPixels={updateLayerPixels}
                onCommitHistory={commitHistory}
                currentTool={currentTool}
                currentColor={currentColor}
                onColorPick={setCurrentColor}
                onEyedropPick={(pickedColor) => {
                  setCurrentColor(pickedColor);
                  if (autoSwitchPencil) {
                    setCurrentTool('pencil');
                  }
                }}
                brushSize={brushSize}
                showGrid={showGrid}
                showGuides={showGuides}
                showNumbers={showNumbers}
                symmetryActive={symmetryActive}
                bodyOffsetX={bodyOffsetX}
                bodyOffsetY={bodyOffsetY}
                onGuideOffsetChange={setGuideOffset}
                isMovingGuide={isMovingGuide}
                onToggleMoveGuide={() => setIsMovingGuide((prev) => !prev)}
                onCenterGuide={centerGuide}
                references={references}
                selection={selection}
                onUpdateSelection={setSelection}
                onDeleteSelection={deleteSelection}
                onCommitFloatingSelection={commitFloatingSelection}
                onFlipHorizontalSelection={flipSelectionH}
                onFlipVerticalSelection={flipSelectionV}
                onClearSelection={clearSelection}
                zoom={zoom}
                onZoomChange={setZoom}
                canvasBg={canvasBg}
                onCycleCanvasBg={cycleCanvasBg}
              />
            </div>

            {/* Coordinate / Guide Status Footer */}
            <div
              style={{
                marginTop: '6px',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: '#5e4933',
              }}
            >
              <span>
                Tip: Hold <strong>Spacebar</strong> to pan canvas. Scroll to zoom. Hold <strong>Alt</strong> to drag guide.
              </span>
              <span>
                Guide Offset: X: {guideOffset.x}, Y: {guideOffset.y}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Mini Preview, Layers & References */}
        <div style={{ width: '310px', flexShrink: 0 }}>
          <MiniPreview />
          <LayersPanel />
          <ReferenceManager />
        </div>
      </div>

      {/* Document Footer */}
      <footer
        className="wiki-box"
        style={{
          marginTop: '16px',
          textAlign: 'center',
          fontSize: '13px',
          color: '#5e4933',
        }}
      >
        FigurayMaker: Sprite Construction Studio &mdash; Classic Web 1.0 Wiki Edition &mdash;{' '}
        <a href="#/about">About & Colophon</a> &bull;{' '}
        <a href="#/guide">Anatomy Proportions</a> &bull;{' '}
        <a href="#/help">Documentation Manual</a>
      </footer>
    </div>
  );
};
