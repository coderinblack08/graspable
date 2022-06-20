import create from "zustand";
import { combine } from "zustand/middleware";
import { Filter } from "./FilterPopover";
import { Sort } from "./SortPopover";

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
      setFilters: (filters: Filter[]) => set((state) => ({ filters })),
    })
  )
);
