import { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import ArticleModal from "../components/ArticleModal";
import { SOURCES, trendingToArticle } from "../lib/article";
import { formatKeyword, getKeywordForDate, KEYWORD_DESCRIPTIONS } from "../lib/keywords";
import type { KeywordsData, TrendingData, Article, TrendingArticle } from "../types";

function getDateStr(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(d);
}

function formatDate(dateStr: string): string {
  const [, m, day] = dateStr.split("-");
  return `${parseInt(m)}/${parseInt(day)}`;
}

function pickRecommended(articles: Article[]): Article[] {
  const hn = [...articles]
    .filter((a) => a.source === "hn")
    .sort((a, b) => (b.points ?? 0) - (a.points ?? 0));
  const ko = [...articles].filter((a) => a.lang === "ko");
  const picked: Article[] = [];
  if (hn[0]) picked.push(hn[0]);
  if (ko[0] && !picked.includes(ko[0])) picked.push(ko[0]);
  if (picked.length < 5) {
    const remaining = articles
      .filter((a) => !picked.includes(a))
      .sort((a, b) => (b.one_liner ? 1 : 0) - (a.one_liner ? 1 : 0));
    if (remaining[0]) picked.push(remaining[0]);
  }
  return picked;
}

function DigestItem({ article, onClick }: { article: Article; onClick: () => void }) {
  const s = SOURCES[article.source] ?? { name: article.source, dot: "#888" };
  return (
    <button
      onClick={onClick}
      className="w-full text-left group flex flex-col gap-1.5 py-4 border-b border-[var(--sep)] last:border-0 hover:opacity-80 transition-opacity cursor-pointer"
    >
      <div className="flex items-center gap-1.5">
        <span className="w-[6px] h-[6px] rounded-full shrink-0" style={{ background: s.dot }} />
        <span className="text-[11px] font-semibold text-[var(--sub)]">{s.name}</span>
        {article.lang && (
          <span className="font-mono text-[10px] uppercase bg-[var(--fill)] text-[var(--sub)] px-1.5 py-0.5 rounded">
            {article.lang}
          </span>
        )}
        <div className="flex-1" />
        {article.points != null && (
          <span className="font-mono text-[11px] text-[var(--sub)]">↑ {article.points}</span>
        )}
        {article.minutes != null && (
          <span className="font-mono text-[11px] text-[var(--sub)]">{article.minutes}분</span>
        )}
      </div>
      <p className="text-[15px] font-semibold leading-[1.35] tracking-[-0.015em] text-[#1c1c1e] dark:text-white">
        {article.title}
      </p>
      {article.one_liner && (
        <p className="text-[13px] leading-[1.5] text-[var(--sub)]">{article.one_liner}</p>
      )}
    </button>
  );
}

function TrendingItem({ article, onClick }: { article: TrendingArticle; onClick: () => void }) {
  const s = SOURCES[article.source] ?? { name: article.source, dot: "#888" };
  const CATEGORY_LABELS: Record<string, string> = {
    frontend: "프론트엔드", backend: "백엔드", ai: "AI",
    devops: "DevOps", cs: "CS", other: "기타",
  };
  return (
    <button
      onClick={onClick}
      className="w-full text-left group flex flex-col gap-1.5 py-4 border-b border-[var(--sep)] last:border-0 hover:opacity-80 transition-opacity cursor-pointer"
    >
      <div className="flex items-center gap-1.5">
        <span className="w-[6px] h-[6px] rounded-full shrink-0" style={{ background: s.dot }} />
        <span className="text-[11px] font-semibold text-[var(--sub)]">{s.name}</span>
        <span className="font-mono text-[10px] uppercase bg-[var(--fill)] text-[var(--sub)] px-1.5 py-0.5 rounded">
          {CATEGORY_LABELS[article.category] ?? article.category}
        </span>
        <div className="flex-1" />
        {article.points != null && (
          <span className="font-mono text-[11px] text-[var(--sub)]">↑ {article.points}</span>
        )}
        {article.positive_reactions != null && (
          <span className="font-mono text-[11px] text-[var(--sub)]">♥ {article.positive_reactions}</span>
        )}
      </div>
      <p className="text-[15px] font-semibold leading-[1.35] tracking-[-0.015em] text-[#1c1c1e] dark:text-white">
        {article.title}
      </p>
      {article.one_liner && (
        <p className="text-[13px] leading-[1.5] text-[var(--sub)]">{article.one_liner}</p>
      )}
    </button>
  );
}

const DigestPage = () => {
  const { dark } = useOutletContext<{ dark: boolean }>();
  const [keywordsData, setKeywordsData] = useState<KeywordsData | null>(null);
  const [trendingData, setTrendingData] = useState<TrendingData | null>(null);
  const [schedule, setSchedule] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<Article | null>(null);

  const yesterdayStr = getDateStr(-1);
  const [activeDate, setActiveDate] = useState(yesterdayStr);

  useEffect(() => {
    fetch("/data/keywords-data.json")
      .then((r) => r.json())
      .then(setKeywordsData)
      .catch(() => null);
    fetch("/data/trending-data.json")
      .then((r) => r.json())
      .then(setTrendingData)
      .catch(() => null);
    fetch("/data/keyword-schedule.json")
      .then((r) => r.json())
      .then(setSchedule)
      .catch(() => null);
  }, []);

  const days = Array.from({ length: 7 }, (_, i) => {
    const dateStr = getDateStr(-(i + 1));
    const keyword = schedule[dateStr] ?? getKeywordForDate(dateStr);
    const articles = keywordsData?.keywords[keyword]?.articles ?? [];
    const recommended = pickRecommended(articles);
    const trending = (trendingData?.[dateStr] ?? []).slice(0, 5);
    return { dateStr, keyword, recommended, trending };
  });

  const active = days.find((d) => d.dateStr === activeDate) ?? days[0];
  const keywordDesc =
    keywordsData?.keywords[active.keyword]?.description ??
    KEYWORD_DESCRIPTIONS[active.keyword] ??
    "";

  return (
    <div className="max-w-[980px] mx-auto px-6">
      {/* Header */}
      <div className="pt-6 pb-5 flex flex-col items-start gap-2">
        <span className="inline-flex items-center gap-1.5 text-[13px] font-bold tracking-[0.03em] uppercase text-white bg-[#1c1c1e] px-3 py-[5px] rounded-full">
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "rgba(255,210,0,0.9)" }} />
          모아보기
        </span>
        <div className="flex gap-4 items-center">
          <img src="/cursor_curation.png" width={150} className="hidden sm:block" />
          <div>
            <h1 className="text-[28px] font-bold tracking-[-0.03em] text-[#1c1c1e] dark:text-white">
              지난 7일 돌아보기
            </h1>
            <p className="mt-1 text-[14px] text-[var(--sub)]">
              날짜를 선택해 놓친 키워드와 트렌딩을 확인하세요.
            </p>
          </div>
        </div>
      </div>

      {/* 날짜 탭 */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-8 scrollbar-none">
        {days.map(({ dateStr, keyword }) => {
          const isActive = dateStr === activeDate;
          return (
            <button
              key={dateStr}
              onClick={() => setActiveDate(dateStr)}
              className={`
                flex flex-col items-start gap-0.5 shrink-0 px-3 py-2 rounded-[12px] border text-left transition-colors cursor-pointer
                ${isActive
                  ? "bg-[#1c1c1e] dark:bg-white border-transparent"
                  : "bg-white dark:bg-[#1c1c1e] border-[var(--sep)] hover:border-[#1c1c1e] dark:hover:border-white"
                }
              `}
            >
              <span className={`font-mono text-[11px] ${isActive ? "text-[rgba(255,255,255,0.6)] dark:text-[rgba(0,0,0,0.5)]" : "text-[var(--sub)]"}`}>
                {formatDate(dateStr)}
              </span>
              <span className={`text-[12px] font-semibold leading-tight ${isActive ? "text-white dark:text-[#1c1c1e]" : "text-[#1c1c1e] dark:text-white"}`}>
                {formatKeyword(keyword)}
              </span>
            </button>
          );
        })}
      </div>

      {/* 뉴스레터 본문 */}
      {keywordsData === null ? (
        <p className="text-sm text-[var(--sub)] py-12 text-center">로딩 중...</p>
      ) : (
        <div className="flex flex-col gap-4">
          {/* 키워드 카드 */}
          <div className="bg-white dark:bg-[#1c1c1e] rounded-[20px] border border-[var(--sep)] px-6 py-6">
            <p className="text-[14px] font-semibold uppercase tracking-[0.06em] mb-2">
              {formatDate(active.dateStr)} · 키워드
            </p>
            <div className="text-[32px] font-bold leading-[1.1] tracking-[-0.035em]">
              <span
                style={{
                  background: dark ? "rgba(255, 210, 0, 0.22)" : "rgba(255, 210, 0, 0.4)",
                  borderRadius: "8px",
                  padding: "0px 5px",
                  boxDecorationBreak: "clone",
                  WebkitBoxDecorationBreak: "clone",
                }}
              >
                {formatKeyword(active.keyword)}
              </span>
            </div>
            {keywordDesc && (
              <p className="mt-2 text-[14px] leading-[1.5] text-[var(--sub)]">{keywordDesc}</p>
            )}

            {active.recommended.length > 0 ? (
              <>
                <div className="border-t border-[var(--sep)] my-5" />
                <p className="text-[14px] font-semibold text-[#1c1c1e] dark:text-white mb-1">
                  {formatKeyword(active.keyword)} 관련 글 · {active.recommended.length}
                </p>
                <div>
                  {active.recommended.map((a, i) => (
                    <DigestItem key={`${a.url}-${i}`} article={a} onClick={() => setSelected(a)} />
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 py-10">
                <img src="/cursor_heart.png" width={80} alt="" className="opacity-40" />
                <p className="text-sm text-[var(--sub)]">글이 없습니다.</p>
              </div>
            )}
          </div>

          {/* 트렌딩 카드 */}
          {active.trending.length > 0 && (
            <div className="bg-white dark:bg-[#1c1c1e] rounded-[20px] border border-[var(--sep)] px-6 py-6">
              <div className="flex items-baseline justify-between mb-1">
                <p className="text-[14px] font-semibold text-[#1c1c1e] dark:text-white">
                  🔥 트렌딩 · {active.trending.length}
                </p>
                <p className="text-[12px] text-[var(--sub)]">키워드와 무관한 그날의 인기 글</p>
              </div>
              <div>
                {active.trending.map((a, i) => (
                  <TrendingItem
                    key={`${a.url}-${i}`}
                    article={a}
                    onClick={() => setSelected(trendingToArticle(a))}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="pb-7 mt-6 text-[11px] text-[var(--sub)]">
        <Link
          to="/"
          className="hover:text-[#1c1c1e] dark:hover:text-white transition-colors no-underline text-[var(--sub)]"
        >
          ← 오늘의 키워드로 돌아가기
        </Link>
      </div>

      <ArticleModal
        article={selected}
        onClose={() => setSelected(null)}
        dark={dark}
      />
    </div>
  );
};

export default DigestPage;
