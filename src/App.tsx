import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";

function DarkToggle({
  dark,
  onToggle,
}: {
  dark: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      aria-label="테마 변경"
      className="w-8 h-8 rounded-full bg-[var(--fill)] text-[#1c1c1e] dark:text-white flex items-center justify-center border-none cursor-pointer"
    >
      <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
        {dark ? (
          <path
            d="M8 2v1.5M8 12.5V14M2 8h1.5M12.5 8H14M3.5 3.5l1 1M11.5 11.5l1 1M3.5 12.5l1-1M11.5 4.5l1-1M8 5.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z"
            stroke="currentColor"
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
          />
        ) : (
          <path d="M11.5 9.5a4 4 0 01-5-5 5 5 0 105 5z" />
        )}
      </svg>
    </button>
  );
}

export default function App() {
  const [dark, setDark] = useState(false);

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-[#f2f2f7] dark:bg-black text-[#1c1c1e] dark:text-white font-sans tracking-[-0.01em] transition-colors duration-300">
        {/* ── Nav ── */}
        <div className="max-w-[980px] mx-auto px-6">
          <div className="flex items-center justify-between gap-2 pt-3.5">
            {/* 브랜드 + 페이지 링크 */}
            <div className="flex items-center gap-5">
              <NavLink to="/" className="flex items-center gap-2 no-underline">
                <span className="font-bold text-[17px] tracking-[-0.025em] leading-none text-[#1c1c1e] dark:text-white">
                  DevPick
                </span>
                <span className="hidden sm:block text-[12px] font-medium text-[var(--sub)] leading-none ml-0.5">
                  · Every day, one keyword
                </span>
              </NavLink>
              <NavLink
                to="/trending"
                className={({ isActive }) =>
                  `text-[13px] font-semibold no-underline transition-colors ${
                    isActive
                      ? "text-[#1c1c1e] dark:text-white"
                      : "text-[var(--sub)] hover:text-[#1c1c1e] dark:hover:text-white"
                  }`
                }
              >
                트렌딩
              </NavLink>
            </div>
            <DarkToggle dark={dark} onToggle={() => setDark((d) => !d)} />
          </div>
        </div>

        {/* ── 페이지 콘텐츠 ── */}
        <Outlet context={{ dark }} />
      </div>
    </div>
  );
}
