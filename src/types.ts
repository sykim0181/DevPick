export interface RelatedConcept {
  keyword: string;
  reason: string;
}

export interface Prereq {
  name: string;
  detail: string;
}

export interface Article {
  title: string;
  url: string;
  source: 'hn' | 'velog' | 'gn' | 'devto' | 'velopers';
  lang: 'en' | 'ko';
  creator?: string;
  points?: number | null;
  minutes?: number;
  published_at: string;
  collected_at: string;
  one_liner?: string;
  summary?: string;
  prereqs?: Prereq[];
  related_concepts: RelatedConcept[];
}

export interface KeywordData {
  description?: string;
  articles: Article[];
}

export interface KeywordsData {
  generated_at: string;
  keywords: Record<string, KeywordData>;
}

export type TrendingCategory = 'frontend' | 'backend' | 'ai' | 'devops' | 'cs' | 'other';

export interface TrendingArticle {
  title: string;
  url: string;
  source: 'hn' | 'devto' | 'velopers';
  lang?: 'en' | 'ko';
  creator?: string;
  points?: number;
  comments?: number;
  positive_reactions?: number;
  reading_time_minutes?: number;
  category: TrendingCategory;
  minutes?: number;
  published_at: string;
  collected_at: string;
  one_liner?: string;
  summary?: string;
  prereqs?: Prereq[];
  related_concepts?: RelatedConcept[];
}

export type TrendingData = Record<string, TrendingArticle[]>;
