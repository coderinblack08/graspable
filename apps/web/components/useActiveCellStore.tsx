import { atomWithImmer } from "jotai/immer";

export const activeCellAtom = atomWithImmer<{
  id: string | null;
  cell: {
    columnId: string | null;
    rowId: string | null;
  };
}>({
  id: null,
  cell: { columnId: null, rowId: null },
});
