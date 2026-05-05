import { useState, useEffect, useEffectEvent } from "react";
import { createPortal } from "react-dom";
import type { Article } from "../types";
import { SOURCES } from "../lib/article";

interface Props {
  article: Article | null;
  onClose: () => void;
  dark: boolean;
}

const Section = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="px-7 pt-5 pb-[22px] border-t border-[var(--sep)]">
      <div className="flex items-baseline gap-2 mb-3.5 flex-wrap">
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] font-semibold text-[var(--sub)]">
          {title}
        </span>
        {subtitle && (
          <span className="text-xs text-[var(--sub)]">· {subtitle}</span>
        )}
      </div>
      {children}
    </div>
  );
};

const ArticleModal = ({ article, onClose, dark }: Props) => {
  const visible = !!article;
  const [render, setRender] = useState(visible);
  const [enter, setEnter] = useState(false);

  const showModal = useEffectEvent(() => {
    setRender(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setEnter(true)));
  });

  const closeModal = useEffectEvent(() => {
    if (render) {
      setEnter(false);
      const t = setTimeout(() => setRender(false), 240);
      return () => clearTimeout(t);
    }
  });

  useEffect(() => {
    if (visible) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      showModal();
    } else {
      closeModal();
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [visible, onClose]);

  useEffect(() => {
    document.body.style.overflow = visible ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [visible]);

  if (!render || !article) return null;

  const s = SOURCES[article.source] ?? {
    name: article.source,
    short: article.source,
    dot: "#888",
    host: "",
  };
  const accent = dark ? "#ffffff" : "#000000";
  const accentText = dark ? "#000000" : "#ffffff";

  return createPortal(
    <div className={dark ? "dark" : ""}>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-9"
        style={{
          background: enter ? "rgba(20,18,16,0.42)" : "rgba(20,18,16,0)",
          backdropFilter: enter ? "blur(8px) saturate(140%)" : "blur(0px)",
          WebkitBackdropFilter: enter
            ? "blur(8px) saturate(140%)"
            : "blur(0px)",
          transition: "background .22s ease, backdrop-filter .22s ease",
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[560px] max-h-full bg-white dark:bg-[#1c1c1e] flex flex-col overflow-hidden rounded-[22px] border border-[var(--sep)]"
          style={{
            boxShadow:
              "0 32px 80px rgba(0,0,0,0.28), 0 8px 24px rgba(0,0,0,0.12)",
            transform: enter
              ? "translateY(0) scale(1)"
              : "translateY(16px) scale(0.985)",
            opacity: enter ? 1 : 0,
            transition:
              "transform .25s cubic-bezier(.2,.8,.3,1), opacity .22s ease",
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-2.5 px-[22px] pt-4 pb-3 shrink-0">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: s.dot }}
            />
            <span className="text-xs font-semibold text-[#1c1c1e] dark:text-white">
              {s.name}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.06em] font-medium bg-[var(--fill)] text-[var(--sub)] px-[7px] py-0.5 rounded">
              {article.lang}
            </span>
            {article.minutes != null && (
              <span className="flex items-center gap-1 font-mono text-[11px] text-[var(--sub)]">
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                >
                  <circle cx="6" cy="6" r="4.5" />
                  <path d="M6 3.5V6l1.8 1.2" />
                </svg>
                예상 {article.minutes}분
              </span>
            )}
            <div className="flex-1" />
            <button
              onClick={onClose}
              aria-label="닫기"
              className="w-7 h-7 rounded-full bg-[var(--fill)] text-[#1c1c1e] dark:text-white flex items-center justify-center shrink-0 border-none cursor-pointer hover:bg-[var(--fill-strong)] transition-colors"
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              >
                <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" />
              </svg>
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {/* Title block */}
            <div className="px-7 pt-1 pb-[22px]">
              <h2 className="text-[24px] font-bold leading-[1.25] tracking-[-0.025em] text-[#1c1c1e] dark:text-white">
                {article.title}
              </h2>
              <p className="mt-2.5 font-mono text-xs text-[var(--sub)]">
                {article.collected_at}
                {article.points != null && <> · ↑ {article.points}</>}
              </p>
            </div>

            {/* Summary */}
            {article.summary && (
              <Section title="요약">
                <p className="m-0 text-[15px] leading-[1.7] tracking-[-0.005em] text-[#1c1c1e] dark:text-white">
                  {article.summary}
                </p>
              </Section>
            )}

            {/* Prerequisites */}
            {article.prereqs && article.prereqs.length > 0 && (
              <Section
                title="사전 지식"
                subtitle="읽기 전에 알아두면 좋은 개념"
              >
                <div className="flex flex-col gap-3.5">
                  {article.prereqs.map((p, i) => (
                    <div key={p.name} className="flex gap-3.5 items-start">
                      <div className="w-[22px] h-[22px] rounded-[6px] shrink-0 bg-[var(--fill)] text-[var(--sub)] flex items-center justify-center font-mono text-[11px] font-semibold mt-0.5">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold tracking-[-0.01em] text-[#1c1c1e] dark:text-white mb-1">
                          {p.name}
                        </p>
                        <p className="text-[13px] leading-[1.55] text-[var(--sub)]">
                          {p.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Related concepts */}
            {article.related_concepts.length > 0 && (
              <Section
                title="함께 보면 좋은 개념"
                subtitle="이 글과 같이 탐색해 보세요"
              >
                <div className="flex flex-wrap gap-[7px]">
                  {article.related_concepts.map((c) => (
                    <button
                      key={c.keyword}
                      title={c.reason}
                      className="px-3 py-[7px] rounded-full border border-[var(--sep)] bg-[var(--fill)] text-[#1c1c1e] dark:text-white text-[12.5px] font-medium tracking-[-0.005em] cursor-pointer hover:bg-[var(--fill-strong)] transition-colors border-none"
                      style={{ border: "0.5px solid var(--sep)" }}
                    >
                      {c.keyword}
                    </button>
                  ))}
                </div>
              </Section>
            )}

            <div className="h-2" />
          </div>

          {/* Sticky CTA */}
          <div className="flex items-center gap-2.5 px-[22px] py-3.5 border-t border-[var(--sep)] bg-white dark:bg-[#1c1c1e] shrink-0">
            <span className="flex-1 font-mono text-[11px] text-[var(--sub)] truncate">
              {s.host}
            </span>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-2 px-[18px] py-[11px] rounded-xl text-[13px] font-semibold tracking-[-0.005em] no-underline hover:brightness-110 transition-[filter]"
              style={{ background: accent, color: accentText }}
            >
              {s.short}에서 읽기
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9L9 3M5 3h4v4" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ArticleModal;
