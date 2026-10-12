/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SpriteProvider } from './context/SpriteContext';
import { EditorView } from './components/EditorView';
import { ProjectsPage } from './pages/ProjectsPage';
import { StartersPage } from './pages/StartersPage';
import { AssetsPage } from './pages/AssetsPage';
import { CanvasResizePage } from './pages/CanvasResizePage';
import { ExportPage } from './pages/ExportPage';
import { GuidePage } from './pages/GuidePage';
import { HelpPage } from './pages/HelpPage';
import { KeybindingsPage } from './pages/KeybindingsPage';
import { AboutPage } from './pages/AboutPage';

function Router() {
  const [currentHash, setCurrentHash] = useState<string>(() => {
    return window.location.hash.replace(/^#\/?/, '').split('?')[0] || '';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const clean = window.location.hash.replace(/^#\/?/, '').split('?')[0] || '';
      setCurrentHash(clean);
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  switch (currentHash) {
    case 'projects':
      return <ProjectsPage />;
    case 'starters':
      return <StartersPage />;
    case 'assets':
      return <AssetsPage />;
    case 'canvas-resize':
      return <CanvasResizePage />;
    case 'export':
      return <ExportPage />;
    case 'guide':
      return <GuidePage />;
    case 'help':
      return <HelpPage />;
    case 'keybindings':
      return <KeybindingsPage />;
    case 'about':
      return <AboutPage />;
    case '':
    case '/':
    default:
      return <EditorView />;
  }
}

export default function App() {
  return (
    <SpriteProvider>
      <Router />
    </SpriteProvider>
  );
}
