import create from "zustand";
import { combine } from "zustand/middleware";

export const useActiveCellStore = create(
  combine(
    {
      cell: {
        rowId: "",
        columnId: "",
      },
      id: null as string | null,
    },
    (set) => ({
      setActiveCell: (rowId: string, columnId: string) =>
        set((state) => ({ cell: { rowId, columnId } })),
      setId: (id: string | null) => set((state) => ({ id })),
    })
  )
);
