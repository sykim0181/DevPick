import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import {
  getTodayDateDisplay,
  getTodayDateStr,
  formatKeyword,
  getTimeUntilMidnight,
  KEYWORD_DESCRIPTIONS,
  getTodayKeyword,
} from "../lib/keywords";
import { useHistoryStore } from "../store/historyStore";
import ArticleCard from "../components/ArticleCard";
import ArticleModal from "../components/ArticleModal";
import TrendingCard from "../components/TrendingCard";
import FilterChips from "../components/FilterChips";
import { LANGUAGES, trendingToArticle } from "../lib/article";
import type { KeywordsData, Article, TrendingData } from "../types";

const langOptions = [
  { value: "all", label: "전체" },
  { value: "ko", label: LANGUAGES["ko"] },
  { value: "en", label: LANGUAGES["en"] },
];

const HomePage = () => {
  const { dark } = useOutletContext<{ dark: boolean }>();

  const [langFilter, setLangFilter] = useState("all");
  const [selected, setSelected] = useState<Article | null>(null);
  const [data, setData] = useState<KeywordsData | null>(null);
  const [trendingData, setTrendingData] = useState<TrendingData | null>(null);
  const [countdown, setCountdown] = useState(getTimeUntilMidnight());
  const [keyword, setKeyword] = useState<string>(getTodayKeyword());

  const dateDisplay = getTodayDateDisplay();
  const { addKeyword } = useHistoryStore();

  useEffect(() => {
    const todayStr = getTodayDateStr();
    fetch("/data/keyword-schedule.json")
      .then((r) => r.json())
      .then((schedule: Record<string, string>) => {
        if (schedule[todayStr]) setKeyword(schedule[todayStr]);
      })
      .catch(() => null);
  }, []);

  useEffect(() => {
    addKeyword(keyword);
  }, [keyword, addKeyword]);

  useEffect(() => {
    fetch("/data/keywords-data.json")
      .then((r) => r.json())
      .then((d: KeywordsData) => setData(d))
      .catch(() => null);
  }, []);

  useEffect(() => {
    fetch("/data/trending-data.json")
      .then((r) => r.json())
      .then((d: TrendingData) => setTrendingData(d))
      .catch(() => null);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setCountdown(getTimeUntilMidnight()), 60_000);
    return () => clearInterval(id);
  }, []);

  const allArticles: Article[] = data?.keywords[keyword]?.articles ?? [];
  const filtered = allArticles.filter(
    (a) => langFilter === "all" || a.lang === langFilter,
  );

  const displayKeyword = formatKeyword(keyword);
  const keywordDesc = data?.keywords[keyword]?.description ?? KEYWORD_DESCRIPTIONS[keyword] ?? "";
  const topTrending = (trendingData?.articles ?? []).slice(0, 3);

  return (
    <div className="max-w-[980px] mx-auto px-6">
      {/* ── Hero ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 pt-4 pb-6">
        {/* 서비스 설명 */}
        <div className="flex flex-col gap-1.5 min-w-0 pb-1">
          <p className="text-[20px] font-bold leading-[1.3] tracking-[-0.025em] text-[#1c1c1e] dark:text-white">
            매일 하나의 기술 키워드와 함께
            <br />
            엄선된 글을 전달합니다.
          </p>
          <p className="text-[13px] leading-[1.5] text-[var(--sub)]">
            오늘 뭘 공부할지 고민하지 않아도 됩니다.
          </p>
        </div>

        {/* 키워드 섹션 */}
        <div className="flex flex-col items-start sm:items-end gap-2 min-w-0 shrink-0">
          <span className="inline-flex items-center gap-1.5 text-[13px] font-bold tracking-[0.03em] uppercase text-white dark:text-white bg-[#1c1c1e] px-3 py-[5px] rounded-full">
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: "rgba(255,210,0,0.9)" }}
            />
            오늘의 키워드 · {dateDisplay}
          </span>

          <div
            className="font-bold leading-[0.92] tracking-[-0.045em] sm:text-right"
            style={{ fontSize: "clamp(44px, 7vw, 72px)" }}
          >
            <span
              style={{
                background: dark
                  ? "rgba(255, 210, 0, 0.22)"
                  : "rgba(255, 210, 0, 0.4)",
                borderRadius: "12px",
                padding: "2px 6px",
                boxDecorationBreak: "clone",
                WebkitBoxDecorationBreak: "clone",
              }}
            >
              {displayKeyword}
            </span>
          </div>

          {keywordDesc && (
            <p className="text-[13px] leading-[1.5] text-[var(--sub)] sm:text-right">
              {keywordDesc}
            </p>
          )}
        </div>
      </div>

      {/* ── 메타 행 ── */}
      <p className="text-xs text-[var(--sub)] pb-[22px]">
        아티클 {filtered.length}개
      </p>

      {/* ── 언어 필터 칩 ── */}
      <FilterChips
        options={langOptions}
        active={langFilter}
        onChange={setLangFilter}
        className="mb-5"
      />

      {/* ── 아티클 그리드 ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-sm text-[var(--sub)]">
          {data === null ? "로딩 중..." : "글이 없습니다."}
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-3.5 mb-8">
          {filtered.map((article, i) => (
            <ArticleCard
              key={`${article.url}-${i}`}
              article={article}
              onOpen={setSelected}
            />
          ))}
        </div>
      )}

      {/* ── 지금 트렌딩 ── */}
      {topTrending.length > 0 && (
        <div className="mb-8">
          <div className="pt-6 pb-5 flex flex-col items-start gap-2 min-w-0 shrink-0">
            <span className="inline-flex items-center gap-1.5 text-[13px] font-bold tracking-[0.03em] uppercase text-white dark:text-white bg-[#1c1c1e] px-3 py-[5px] rounded-full">
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: "rgba(255,210,0,0.9)" }}
              />
              트렌딩
            </span>
            <div>
              <h1 className="text-[28px] font-bold tracking-[-0.03em] text-[#1c1c1e] dark:text-white">
                지금 개발자 커뮤니티에서 뜨는 것들
              </h1>
              <p className="mt-1 text-[14px] text-[var(--sub)]">
                실시간으로 화제인 글을 모았습니다. 지금 어떤 기술이 주목받는지
                알아보세요!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-3.5">
            {topTrending.map((article, i) => (
              <TrendingCard
                key={`${article.url}-${i}`}
                article={article}
                onClick={() => setSelected(trendingToArticle(article))}
              />
            ))}
          </div>

          <div className="flex items-center justify-end mt-3">
            <Link
              to="/trending"
              className="text-[12px] font-medium text-[var(--sub)] hover:text-[#1c1c1e] dark:hover:text-white transition-colors no-underline"
            >
              더보기 →
            </Link>
          </div>
        </div>
      )}

      {/* ── 푸터 ── */}
      <div className="flex justify-between text-[11px] text-[var(--sub)] pb-7">
        <span>devpick · 매일 새 키워드</span>
        <span>다음 키워드까지 {countdown}</span>
      </div>

      <ArticleModal
        article={selected}
        onClose={() => setSelected(null)}
        dark={dark}
      />
    </div>
  );
};

export default HomePage;
