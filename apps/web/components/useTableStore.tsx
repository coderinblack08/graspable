import create from "zustand";
import { combine } from "zustand/middleware";
import { Sort } from "./SortPopover";

export interface Filter {}
export interface Hide {
  columnId: string | null;
}

export const useTableStore = create(
  combine(
    {
      filters: [] as Filter[],
      sorts: [] as Sort[],
      hides: [] as Hide[],
    },
    (set) => ({
      clearAll: () => set(() => ({ filters: [], sorts: [], hides: [] })),
      setSort: (sorts: Sort[]) => set((state) => ({ sorts })),
    })
  )
);
