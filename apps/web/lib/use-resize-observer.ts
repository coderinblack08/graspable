import * as React from "react";
import { TableState } from "react-table";

export interface ColumnResizing {
  /**
   * The default column width. This doesn't change.
   */
  columnWidth: number | null;
  /**
   * Map of column IDs to column widths.
   */
  columnWidths: Record<string, number>;
  startX: number;
  /**
   * I don't know why this exists. And I don't know why header widths vary from the column widths.
   */
  headerIdWidths?: [string, number][];
  /**
   * The ID of the column being resized. Will be null if no column is being resized.
   * This is a bit of misleading name because "is" imply it's a boolean but it is not.
   */
  isResizingColumn?: string;
}

export const useResizeObserver = (
  state: TableState<Record<string, any>>,
  callback: (columnId: string, columnSize: number) => void
) => {
  // This Ref will contain the id of the column being resized or undefined
  const columnResizeRef = React.useRef<string | undefined>();
  React.useEffect(() => {
    // We are interested in calling the resize event only when "state.columnResizing?.isResizingColumn" changes from
    // a string to undefined, because it indicates that it WAS resizing but it no longer is.
    if (
      state.columnResizing &&
      !state.columnResizing?.isResizingColumn &&
      columnResizeRef.current
    ) {
      // Trigger resize event
      callback(
        columnResizeRef.current,
        state.columnResizing.columnWidths[columnResizeRef.current]
      );
    }
    columnResizeRef.current = state.columnResizing?.isResizingColumn;
  }, [state.columnResizing?.isResizingColumn]);
};
