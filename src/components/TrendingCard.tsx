import { SOURCES } from "../lib/article";
import type { TrendingArticle, TrendingCategory } from "../types";

const CATEGORY_LABELS: Record<TrendingCategory, string> = {
  frontend: "프론트엔드",
  backend: "백엔드",
  ai: "AI",
  devops: "DevOps",
  cs: "CS",
  other: "기타",
};

interface Props {
  article: TrendingArticle;
  onClick: () => void;
}

const TrendingCard = ({ article, onClick }: Props) => {
  const s = SOURCES[article.source] ?? { name: article.source, dot: "#888" };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      className="
        group bg-white dark:bg-[#1c1c1e]
        rounded-[18px] p-4
        border border-[var(--sep)]
        flex flex-col gap-3
        cursor-pointer
        transition-transform duration-150
        hover:-translate-y-0.5
        outline-none focus-visible:ring-2 focus-visible:ring-[#1c1c1e] dark:focus-visible:ring-white
      "
    >
      {/* Source + category row */}
      <div className="flex items-center gap-2">
        <span
          className="w-[7px] h-[7px] rounded-full shrink-0"
          style={{ background: s.dot }}
        />
        <span className="text-xs font-semibold text-[#1c1c1e] dark:text-white">
          {s.name}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.04em] bg-[var(--fill)] text-[var(--sub)] px-1.5 py-0.5 rounded">
          {CATEGORY_LABELS[article.category]}
        </span>
        <div className="flex-1" />
        <span className="font-mono text-[11px] text-[var(--sub)]">
          {article.published_at}
        </span>
      </div>

      {/* Title */}
      <p className="text-[15px] font-semibold leading-[1.35] tracking-[-0.015em] text-[#1c1c1e] dark:text-white flex-1">
        {article.title}
      </p>

      {/* One-liner if available */}
      {article.one_liner && (
        <p className="text-[13px] leading-[1.45] text-[var(--sub)] -mt-1">
          {article.one_liner}
        </p>
      )}

      {/* Footer: stats */}
      <div className="flex items-center gap-3 font-mono text-[11px] text-[var(--sub)] mt-auto">
        {article.source === "hn" && article.points != null && (
          <span>↑ {article.points}</span>
        )}
        {article.source === "devto" && article.positive_reactions != null && (
          <span>♥ {article.positive_reactions}</span>
        )}
        {article.comments != null && article.comments > 0 && (
          <span>💬 {article.comments}</span>
        )}
        {(article.minutes ?? article.reading_time_minutes) != null && (
          <span>{article.minutes ?? article.reading_time_minutes}분</span>
        )}
      </div>
    </div>
  );
};

export default TrendingCard;
