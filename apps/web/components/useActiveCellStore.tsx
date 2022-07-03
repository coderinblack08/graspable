import create from "zustand";

type NString = string | null;
export const useActiveCellStore = create<{
  id: NString;
  cell: {
    columnId: NString;
    rowId: NString;
  };
  setActiveCell: (rowId: NString, columnId: NString) => void;
  setId: (id: NString) => void;
}>((set) => ({
  id: null,
  cell: {
    columnId: null,
    rowId: null,
  },
  setActiveCell: (rowId, columnId) =>
    set((state) => ({ cell: { rowId, columnId } })),
  setId: (id) => set((state) => ({ id })),
}));
