import { SOURCES } from "../lib/article";
import type { Article } from "../types";

interface Props {
  article: Article;
  onOpen: (article: Article) => void;
}

const ArticleCard = ({ article, onOpen }: Props) => {
  const s = SOURCES[article.source] ?? {
    name: article.source,
    dot: "#888",
    short: article.source,
    host: "",
  };

  return (
    <div
      onClick={() => onOpen(article)}
      className="
        group bg-white dark:bg-[#1c1c1e]
        rounded-[18px] p-4
        border border-[var(--sep)]
        flex flex-col gap-3
        cursor-pointer
        transition-transform duration-150
        hover:-translate-y-0.5
      "
    >
      {/* Source row */}
      <div className="flex items-center gap-2">
        <span
          className="w-[7px] h-[7px] rounded-full shrink-0"
          style={{ background: s.dot }}
        />
        <span className="text-xs font-semibold text-[#1c1c1e] dark:text-white">
          {article.source === "velopers" && article.creator ? article.creator : s.name}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.04em] bg-[var(--fill)] text-[var(--sub)] px-1.5 py-0.5 rounded">
          {article.lang}
        </span>
        <div className="flex-1" />
        <span className="font-mono text-[11px] text-[var(--sub)]">
          {article.published_at}
        </span>
      </div>

      {/* Title */}
      <p className="text-[15px] font-semibold leading-[1.35] tracking-[-0.015em] text-[#1c1c1e] dark:text-white">
        {article.title}
      </p>

      {/* One-liner */}
      {article.one_liner && (
        <p className="text-[13px] leading-[1.5] text-[var(--sub)] line-clamp-2 flex-1">
          {article.one_liner}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center font-mono text-[11px] text-[var(--sub)] mt-auto">
        <div className="flex-1" />
        {article.points != null && <span>↑ {article.points}</span>}
      </div>
    </div>
  );
};

export default ArticleCard;
