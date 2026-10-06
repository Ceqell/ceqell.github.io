export type ThemeMode = 'light' | 'dark';

export type ThemeId = 'dark-modern' | 'retro-skeuomorphic' | string;

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  mode: ThemeMode;
  accent: string;
  badge?: string;
  description?: string;
}
