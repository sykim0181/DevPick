import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface HistoryStore {
  viewedKeywords: string[];
  addKeyword: (keyword: string) => void;
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set, get) => ({
      viewedKeywords: [],
      addKeyword: (keyword) => {
        const prev = get().viewedKeywords;
        if (!prev.includes(keyword)) {
          set({ viewedKeywords: [keyword, ...prev].slice(0, 30) });
        }
      },
    }),
    { name: 'devpick-history' }
  )
);
