import type { Article, TrendingArticle } from "../types";

export const SOURCES: Record<
  string,
  { name: string; dot: string; short: string; host: string }
> = {
  hn: {
    name: "Hacker News",
    dot: "#FF5CC2",
    short: "HN",
    host: "news.ycombinator.com",
  },
  velog: { name: "velog", dot: "#07C851", short: "velog", host: "velog.io" },
  gn:    { name: "GeekNews", dot: "#4BA2FF", short: "Geek",   host: "news.hada.io" },
  devto:    { name: "dev.to",    dot: "#3B49DF", short: "dev.to", host: "dev.to" },
  velopers: { name: "Velopers",  dot: "#FF6B35", short: "Velo",  host: "velopers.kr" },
};

export const LANGUAGES: Record<string, string> = {
  all: "전체",
  ko: "KO",
  en: "EN",
};

export function trendingToArticle(t: TrendingArticle): Article {
  return {
    title: t.title,
    url: t.url,
    source: t.source,
    lang: t.lang ?? "en",
    points: t.source === "hn" ? (t.points ?? null) : (t.positive_reactions ?? null),
    minutes: t.minutes ?? t.reading_time_minutes,
    published_at: t.published_at,
    collected_at: t.collected_at,
    one_liner: t.one_liner,
    summary: t.summary,
    prereqs: t.prereqs,
    related_concepts: t.related_concepts ?? [],
    creator: t.creator,
  };
}
