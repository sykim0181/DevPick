import { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import TrendingCard from "../components/TrendingCard";
import ArticleModal from "../components/ArticleModal";
import FilterChips from "../components/FilterChips";
import { trendingToArticle } from "../lib/article";
import type { TrendingData, TrendingCategory, Article } from "../types";

const CATEGORIES = [
  { value: "all", label: "전체" },
  { value: "frontend", label: "프론트엔드" },
  { value: "backend", label: "백엔드" },
  { value: "ai", label: "AI" },
  { value: "devops", label: "DevOps" },
  { value: "cs", label: "CS" },
];

const TrendingPage = () => {
  const { dark } = useOutletContext<{ dark: boolean }>();
  const [data, setData] = useState<TrendingData | null>(null);
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState<Article | null>(null);

  useEffect(() => {
    fetch("/data/trending-data.json")
      .then((r) => r.json())
      .then((d: TrendingData) => setData(d))
      .catch(() => null);
  }, []);

  const latestDate = Object.keys(data ?? {}).sort().reverse()[0] ?? null;
  const latestArticles = latestDate ? (data?.[latestDate] ?? []) : [];

  const filtered = latestArticles.filter(
    (a) => category === "all" || a.category === (category as TrendingCategory),
  );

  const generatedAt = latestDate
    ? new Date(latestDate).toLocaleString("ko-KR", {
        month: "numeric",
        day: "numeric",
      })
    : null;

  return (
    <div className="max-w-[980px] mx-auto px-6">
      {/* Header */}
      <div className="pt-6 pb-5 flex flex-col items-start gap-2 min-w-0 shrink-0">
        {/* 라벨 */}
        <span className="inline-flex items-center gap-1.5 text-[13px] font-bold tracking-[0.03em] uppercase text-white dark:text-white bg-[#1c1c1e] px-3 py-[5px] rounded-full">
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ background: "rgba(255,210,0,0.9)" }}
          />
          트렌딩
        </span>
        <div className="flex gap-4 items-center">
          <img src="/cursor_running.png" width={150} className="hidden sm:block" />

          <div>
            <div className="flex items-baseline gap-3">
              <h1 className="text-[28px] font-bold tracking-[-0.03em] text-[#1c1c1e] dark:text-white">
                지금 개발자 커뮤니티에서 뜨는 것들
              </h1>
            </div>
            <p className="mt-1 text-[14px] text-[var(--sub)]">
              실시간으로 화제인 글을 모았습니다. 지금 어떤 기술이 주목받는지
              알아보세요!
            </p>
          </div>
        </div>
      </div>

      {/* ── 메타 행 ── */}
      <div className="flex gap-3 pb-[22px]">
        <p className="text-xs text-[var(--sub)]">아티클 {filtered.length}개 </p>
        <span className="text-xs text-[var(--sub)]">·</span>
        {generatedAt && (
          <span className="text-xs text-[var(--sub)]">
            업데이트 {generatedAt}
          </span>
        )}
      </div>

      {/* Category tabs */}
      <FilterChips
        options={CATEGORIES}
        active={category}
        onChange={setCategory}
        className="mb-5"
      />

      {/* Card grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16">
          <img src="/cursor_heart.png" width={80} alt="" className="opacity-40" />
          <p className="text-sm text-[var(--sub)]">글이 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-3.5 mb-8">
          {filtered.map((article, i) => (
            <TrendingCard
              key={`${article.url}-${i}`}
              article={article}
              onClick={() => setSelected(trendingToArticle(article))}
            />
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="pb-7 text-[11px] text-[var(--sub)]">
        <Link
          to="/"
          className="hover:text-[#1c1c1e] dark:hover:text-white transition-colors no-underline text-[var(--sub)]"
        >
          ← 오늘의 키워드로 돌아가기
        </Link>
      </div>

      {/* Modal */}
      <ArticleModal
        article={selected}
        onClose={() => setSelected(null)}
        dark={dark}
      />
    </div>
  );
};

export default TrendingPage;
