import { ThemePalette, ThemePaletteId } from '../types/book';

export interface ThemeColorsRGB {
  primary: [number, number, number];
  secondary: [number, number, number];
  accent: [number, number, number];
  paper: [number, number, number];
  text: [number, number, number];
  muted: [number, number, number];
  boxBg: [number, number, number];
  boxBorder: [number, number, number];
}

export const THEME_PALETTES: Record<ThemePaletteId, ThemePalette & { rgb: ThemeColorsRGB }> = {
  'deep-indigo': {
    id: 'deep-indigo',
    name: 'Midnight Indigo & Gold',
    primary: '#0f172a', // slate-900
    secondary: '#1e293b',
    accent: '#d97706', // amber-600
    paper: '#f8fafc',
    textPrimary: '#0f172a',
    textMuted: '#64748b',
    border: '#cbd5e1',
    cardBg: '#f1f5f9',
    badgeBg: '#e2e8f0',
    badgeText: '#1e293b',
    rgb: {
      primary: [15, 23, 42],
      secondary: [30, 41, 59],
      accent: [217, 119, 6],
      paper: [248, 250, 252],
      text: [15, 23, 42],
      muted: [100, 116, 139],
      boxBg: [241, 245, 249],
      boxBorder: [203, 213, 225],
    },
  },
  'curatorial-terracotta': {
    id: 'curatorial-terracotta',
    name: 'Curatorial Terracotta & Warm Limestone',
    primary: '#7c2d12', // terracotta
    secondary: '#431407',
    accent: '#c2410c',
    paper: '#fbf9f5',
    textPrimary: '#1c1917',
    textMuted: '#78716c',
    border: '#e7e5e4',
    cardBg: '#f5f5f4',
    badgeBg: '#ffedd5',
    badgeText: '#9a3412',
    rgb: {
      primary: [124, 45, 18],
      secondary: [67, 20, 7],
      accent: [194, 65, 12],
      paper: [251, 249, 245],
      text: [28, 25, 23],
      muted: [120, 113, 108],
      boxBg: [245, 245, 244],
      boxBorder: [231, 229, 228],
    },
  },
  'nordic-pine': {
    id: 'nordic-pine',
    name: 'Nordic Pine & Birch Paper',
    primary: '#14532d', // deep forest green
    secondary: '#052e16',
    accent: '#15803d',
    paper: '#fcfbf7',
    textPrimary: '#142718',
    textMuted: '#526658',
    border: '#dbe7dd',
    cardBg: '#f2f7f3',
    badgeBg: '#dcfce7',
    badgeText: '#166534',
    rgb: {
      primary: [20, 83, 45],
      secondary: [5, 46, 22],
      accent: [21, 128, 61],
      paper: [252, 251, 247],
      text: [20, 39, 24],
      muted: [82, 102, 88],
      boxBg: [242, 247, 243],
      boxBorder: [219, 231, 221],
    },
  },
  'obsidian-ink': {
    id: 'obsidian-ink',
    name: 'Obsidian Ink & Clean Parchment',
    primary: '#18181b', // zinc-900
    secondary: '#09090b',
    accent: '#4f46e5',
    paper: '#fafafa',
    textPrimary: '#18181b',
    textMuted: '#71717a',
    border: '#e4e4e7',
    cardBg: '#f4f4f5',
    badgeBg: '#e4e4e7',
    badgeText: '#27272a',
    rgb: {
      primary: [24, 24, 27],
      secondary: [9, 9, 11],
      accent: [79, 70, 229],
      paper: [250, 250, 250],
      text: [24, 24, 27],
      muted: [113, 113, 122],
      boxBg: [244, 244, 245],
      boxBorder: [228, 228, 231],
    },
  },
  'antique-amber': {
    id: 'antique-amber',
    name: 'Antique Amber & Archival Cream',
    primary: '#78350f', // amber-900
    secondary: '#451a03',
    accent: '#b45309',
    paper: '#fdfbf7',
    textPrimary: '#292524',
    textMuted: '#78716c',
    border: '#f2e8db',
    cardBg: '#faf5ee',
    badgeBg: '#fef3c7',
    badgeText: '#92400e',
    rgb: {
      primary: [120, 53, 15],
      secondary: [69, 26, 3],
      accent: [180, 83, 9],
      paper: [253, 251, 247],
      text: [41, 37, 36],
      muted: [120, 113, 108],
      boxBg: [250, 245, 238],
      boxBorder: [242, 232, 219],
    },
  },
  'crimson-velvet': {
    id: 'crimson-velvet',
    name: 'Crimson Velvet & Alabaster',
    primary: '#881337', // rose-900
    secondary: '#4c0519',
    accent: '#be123c',
    paper: '#fffbfb',
    textPrimary: '#1c1917',
    textMuted: '#78716c',
    border: '#fecdd3',
    cardBg: '#fff1f2',
    badgeBg: '#ffe4e6',
    badgeText: '#9f1239',
    rgb: {
      primary: [136, 19, 55],
      secondary: [76, 5, 25],
      accent: [190, 18, 60],
      paper: [255, 251, 251],
      text: [28, 25, 23],
      muted: [120, 113, 108],
      boxBg: [255, 241, 242],
      boxBorder: [254, 205, 211],
    },
  },
};
