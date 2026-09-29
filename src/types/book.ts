export interface DemographicPersona {
  targetAudience: string;
  ageRange: string;
  corePainPoint: string;
  desiredTransformation: string;
  readingContext: string;
}

export interface Chapter {
  id: string;
  number: number;
  pill: string; // e.g. "FOUNDATIONAL STRATEGY"
  title: string;
  summary: string;
  subheading: string;
  content: string[];
  quote: {
    text: string;
    author: string;
  };
  bulletPoints: string[];
}

export type ThemePaletteId = 
  | 'deep-indigo'
  | 'curatorial-terracotta'
  | 'nordic-pine'
  | 'obsidian-ink'
  | 'antique-amber'
  | 'crimson-velvet';

export interface ThemePalette {
  id: ThemePaletteId;
  name: string;
  primary: string; // hex
  secondary: string; // hex
  accent: string; // hex
  paper: string; // hex
  textPrimary: string;
  textMuted: string;
  border: string;
  cardBg: string;
  badgeBg: string;
  badgeText: string;
}

export interface Book {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  edition: string;
  publicationYear: string;
  genre: string;
  themeId: ThemePaletteId;
  coverImagePrompt?: string;
  demographic: DemographicPersona;
  chapters: [Chapter, Chapter, Chapter, Chapter]; // exactly 4 formatted chapters
  createdAt: string;
  updatedAt: string;
}
