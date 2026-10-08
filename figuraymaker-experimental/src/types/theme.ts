export type ThemeMode = 'light' | 'dark';

export type ThemeId = 'dark-modern' | 'retro-skeuomorphic' | 'retro-beige' | 'retro-dark' | 'oled-dark' | string;

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  mode: ThemeMode;
  accent: string;
  badge?: string;
  description?: string;
}
