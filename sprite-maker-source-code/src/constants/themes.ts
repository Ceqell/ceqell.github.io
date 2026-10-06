import { ThemeConfig } from '../types/theme';

export const AVAILABLE_THEMES: ThemeConfig[] = [
  {
    id: 'retro-skeuomorphic',
    name: '2008 Chrome Retro',
    mode: 'light',
    accent: '#0284c7',
    badge: 'Web 2.0',
    description: 'Authentic 2006–2008 skeuomorphic web UI with chrome buttons, beveled insets, and glossy highlights.',
  },
  {
    id: 'retro-beige',
    name: '2008 Beige Retro',
    mode: 'light',
    accent: '#0284c7',
    badge: 'Banner',
    description: 'Authentic 2008 skeuomorphic web UI matched to the warm #FFF1DD and #E6D7C3 banner colors.',
  },
  {
    id: 'retro-dark',
    name: '2008 Dark Retro',
    mode: 'dark',
    accent: '#38bdf8',
    badge: 'Gunmetal',
    description: 'Authentic 2008 skeuomorphic dark UI with dual-tone gunmetal chrome buttons, beveled insets, and metallic highlights.',
  },
  {
    id: 'dark-modern',
    name: 'Dark Studio',
    mode: 'dark',
    accent: '#f59e0b',
    badge: 'Modern',
    description: 'High-contrast sleek dark workspace optimized for long pixel art sessions.',
  },
];

export const DEFAULT_THEME_ID = 'retro-skeuomorphic';

export const getThemeConfig = (themeId: string): ThemeConfig => {
  return AVAILABLE_THEMES.find(t => t.id === themeId) || AVAILABLE_THEMES[0];
};
