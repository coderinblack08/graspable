import {
  ActionIcon,
  Box,
  Button,
  createStyles,
  Group,
  ScrollArea,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { useHotkeys, useListState } from "@mantine/hooks";
import {
  IconEyeOff,
  IconFilter,
  IconFrame,
  IconLayout,
  IconList,
  IconPlus,
  IconRobot,
  IconSearch,
  IconTrash,
} from "@tabler/icons";
import { LexoRank } from "lexorank";
import cloneDeep from "lodash.clonedeep";
import React, { useEffect } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import {
  useBlockLayout,
  useColumnOrder,
  useResizeColumns,
  useRowSelect,
  useTable,
} from "react-table";
import { InferQueryInput, InferQueryOutput, trpc } from "../lib/trpc";
import { SortPopover } from "./SortPopover";
import shallow from "zustand/shallow";
import { HeaderCell } from "./HeaderCell";
import { EditableCell } from "./EditableCell";
import { NewColumnPopover } from "./NewColumnPopover";
import { IndeterminateCheckbox } from "./IndeterminateCheckbox";
import { useTableStore } from "./useTableStore";

export const useStyles = createStyles((theme) => ({
  table: {
    display: "inline-block",
    borderSpacing: 0,
    border: `1px solid ${theme.colors.gray[2]}`,
    borderCollapse: "separate",
  },
  cell: {
    position: "relative",
    margin: 0,
    textAlign: "left",
    padding: "8px",
    fontSize: theme.fontSizes.sm,
    border: `1px solid ${theme.colors.gray[2]}`,
    "&:focus-within": {
      position: "relative",
      zIndex: 50,
      borderColor: theme.colors.blue[5],
      boxShadow: `0 0 0 1px ${theme.colors.blue[5]}`,
    },
  },
  rowSelected: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.fn.rgba(theme.colors[theme.primaryColor][7], 0.2)
        : theme.colors[theme.primaryColor][0],
  },
  rowUnselected: {
    backgroundColor: "white",
  },
  resizer: {
    display: "inline-block",
    background: theme.colors.gray[2],
    width: 2,
    height: "100%",
    position: "absolute",
    right: 0,
    top: 0,
    transform: "translateX(2px)",
    zIndex: 1,
    touchAction: "none",
    "&:hover": {
      width: 4,
      background: theme.colors.blue[3],
      transform: "translateX(3px)",
    },
    "&.isResizing": {
      background: theme.colors.blue[3],
      transform: "translateX(3px)",
      width: 4,
    },
  },
}));

interface DataGridProps {
  workspaceId: string;
  tableId: string;
}

export const DataGrid: React.FC<DataGridProps> = ({ workspaceId, tableId }) => {
  const [sorts] = useTableStore((state) => [state.sorts], shallow);
  const { data: rows } = trpc.useQuery(
    [
      "rows.byTableId",
      { tableId, sorts: sorts.filter((x) => x.columnId !== null) as any },
    ],
    { keepPreviousData: true }
  );
  const { data: columns } = trpc.useQuery(["columns.byTableId", { tableId }]);
  const { data: cells } = trpc.useQuery(["cells.byTableId", { tableId }]);
  const utils = trpc.useContext();

  if (rows && cells && columns) {
    return (
      <DataGridUI
        workspaceId={workspaceId}
        tableId={tableId}
        dbRows={rows}
        dbCells={cells}
        dbColumns={columns}
      />
    );
  }

  return null;
};

const DataGridUI: React.FC<{
  workspaceId: string;
  tableId: string;
  dbRows: InferQueryOutput<"rows.byTableId">;
  dbColumns: InferQueryOutput<"columns.byTableId">;
  dbCells: InferQueryOutput<"cells.byTableId">;
}> = ({ workspaceId, tableId, dbCells, dbColumns, dbRows }) => {
  const { cx, classes } = useStyles();
  const theme = useMantineTheme();
  const [skipPageReset, setSkipPageReset] = React.useState(false);

  const RT_COLUMNS = React.useMemo(
    () =>
      dbColumns?.map((db_column) => ({
        Header: db_column.name,
        accessor: db_column.id,
        width: db_column.width || 150,
      })),
    [dbColumns]
  );

  const RT_DATA = React.useMemo(() => {
    // console.log(dbRows);
    return dbRows?.map((row) => {
      const defaultObj = dbColumns.reduce(
        (acc: Record<string, any>, col) => {
          acc[col.id] = null;
          return acc;
        },
        { id: row.id, rank: row.rank }
      );
      return dbCells
        ?.filter((cell) => cell.rowId === row.id)
        .reduce((acc: Record<string, any>, curr) => {
          if (!acc.id) acc.id = row.id;
          acc[curr.columnId] = curr.value || null;
          return acc;
        }, defaultObj);
    });
  }, [dbRows, dbColumns, dbCells]);

  const [records, handlers] = useListState(cloneDeep(RT_DATA));

  useEffect(() => {
    handlers.setState(cloneDeep(RT_DATA));
  }, [RT_DATA]);

  const getRowId = React.useCallback((row) => {
    return row.id;
  }, []);

  const createCell = trpc.useMutation(["cells.upsert"]);

  const updateMyData = (rowIndex: number, columnId: string, value: any) => {
    setSkipPageReset(true);
    handlers.apply((row, index) => {
      const rowId = records[rowIndex].id;
      if (index === rowIndex) {
        createCell.mutate({ tableId, rowId, columnId, value });
        return {
          ...row,
          [columnId]: value,
        };
      }
      return row;
    });
  };

  React.useEffect(() => {
    setSkipPageReset(false);
  }, [records]);

  const currentColOrder = React.useRef<any[]>();

  const tableInstance = useTable(
    {
      columns: RT_COLUMNS,
      data: records,
      defaultColumn: {
        Cell: EditableCell(dbColumns),
        minWidth: 100,
        maxWidth: 400,
      },
      autoResetPage: !skipPageReset,
      updateMyData,
      getRowId,
    },
    useRowSelect,
    useBlockLayout,
    useResizeColumns,
    useColumnOrder,
    (hooks) => {
      hooks.visibleColumns.push((columns) => [
        {
          id: "selection",
          width: "auto",
          disableResizing: true,
          Header: ({ getToggleAllRowsSelectedProps }) => (
            <div>
              <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
            </div>
          ),
          Cell: ({ row }) => (
            <div>
              <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
            </div>
          ),
        },
        ...columns,
        {
          id: "new-column",
          width: 40,
          minWidth: 40,
          disableResizing: true,
          Header: () => (
            <div>
              <NewColumnPopover
                lastRank={dbColumns.at(-1)?.rank}
                workspaceId={workspaceId}
                tableId={tableId}
              />
            </div>
          ),
          Cell: () => <div></div>,
        },
      ]);
    }
  );

  const updateRowRank = trpc.useMutation(["rows.updateRank"]);
  const updateColumn = trpc.useMutation(["columns.update"]);
  const addRow = trpc.useMutation(["rows.add"]);
  const removeRows = trpc.useMutation(["rows.delete"]);
  const utils = trpc.useContext();

  const [sorts] = useTableStore((state) => [state.sorts], shallow);
  const rowsQueryKey = React.useMemo<
    ["rows.byTableId", InferQueryInput<"rows.byTableId">]
  >(
    () => [
      "rows.byTableId",
      {
        tableId,
        sorts: sorts.filter((x) => x.columnId !== null) as any,
      },
    ],
    [tableId, sorts]
  );

  const createNewRow = async () => {
    const rank = dbRows.length
      ? LexoRank.parse(dbRows.at(-1)?.rank!).genNext().toString()
      : LexoRank.middle().toString();
    await addRow.mutateAsync(
      { tableId, rank },
      {
        onSuccess: (row) => {
          utils.setQueryData(rowsQueryKey, (old) => [...(old || []), row]);
        },
      }
    );
  };

  const getNewRank = (
    values: any[],
    oldIndex: number,
    newIndex: number,
    oneIndexed = false
  ) => {
    if (values.length === (oneIndexed ? 2 : 0)) {
      return LexoRank.middle();
    } else if (newIndex === (oneIndexed ? 1 : 0)) {
      const firstItem = values[oneIndexed ? 1 : 0].rank;
      let rank = LexoRank.parse(firstItem).genPrev();
      return rank;
    } else if (newIndex === values.length - (oneIndexed ? 2 : 1)) {
      const lastItem = values[values.length - (oneIndexed ? 2 : 1)];
      let rank = LexoRank.parse(lastItem.rank).genNext();
      return rank;
    } else {
      const over = LexoRank.parse(values[newIndex].rank);
      const second = LexoRank.parse(
        values[newIndex + (newIndex < oldIndex ? -1 : 1)].rank
      );
      return over.between(second);
    }
  };

  useHotkeys([["shift+enter", createNewRow]]);

  const {
    setColumnOrder,
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    flatHeaders,
    prepareRow,
    state,
  } = tableInstance;

  return (
    <Box>
      <Group
        position="apart"
        p={8}
        sx={{
          backgroundColor: "white",
          borderBottom: "2px solid",
          borderColor: theme.colors.gray[2],
        }}
      >
        <Group spacing={8}>
          {/* <ActionIcon color="blue" variant="outline" size="sm">
            <IconPlus size={16} />
          </ActionIcon> */}
          <Button variant="outline" leftIcon={<IconLayout size={16} />} compact>
            Views
          </Button>
          {Object.keys(state.selectedRowIds).length > 0 ? (
            <>
              <Button
                loading={removeRows.isLoading}
                leftIcon={<IconTrash size={16} />}
                color="red"
                compact
                onClick={() =>
                  removeRows.mutate(
                    { ids: Object.keys(state.selectedRowIds) },
                    {
                      onSuccess: () => {
                        utils.setQueryData(rowsQueryKey, (old) =>
                          (old || [])?.filter(
                            (row) => !state.selectedRowIds[row.id]
                          )
                        );
                      },
                    }
                  )
                }
              >
                Delete
              </Button>
            </>
          ) : (
            <>
              <Button leftIcon={<IconFilter size={16} />} compact>
                Filter
              </Button>
              <Button leftIcon={<IconFrame size={16} />} compact>
                Group
              </Button>
              <SortPopover columns={dbColumns} />
              <Button leftIcon={<IconEyeOff size={16} />} compact>
                Hide Columns
              </Button>
            </>
          )}
        </Group>
        <Group spacing={8}>
          <Button leftIcon={<IconList size={16} />} variant="outline" compact>
            Form
          </Button>
          <Button leftIcon={<IconRobot size={16} />} variant="outline" compact>
            Automation
          </Button>
          <ActionIcon color="blue" variant="transparent" size="sm">
            <IconSearch size={16} />
          </ActionIcon>
        </Group>
      </Group>
      <Box mt={-2}>
        <ScrollArea>
          <Box
            // component="table"
            className={classes.table}
            {...getTableProps()}
          >
            <DragDropContext
              onDragStart={() => {
                currentColOrder.current = flatHeaders.map((o) => o.id);
              }}
              onDragUpdate={({ source, destination, draggableId }, b) => {
                const colOrder = [...(currentColOrder.current || [])];
                const sIndex = source.index;
                const dIndex = destination && destination.index;
                if (typeof sIndex === "number" && typeof dIndex === "number") {
                  colOrder.splice(sIndex, 1);
                  colOrder.splice(dIndex, 0, draggableId);
                  setColumnOrder(colOrder);
                }
              }}
              onDragEnd={({ source, destination }) => {
                if (
                  source &&
                  destination &&
                  source.index !== destination.index
                ) {
                  const colOrder = [...(currentColOrder.current || [])];
                  const sIndex = source.index;
                  const dIndex = destination.index;
                  if (dIndex === 0 || dIndex === colOrder.length - 1) return;
                  const rank = getNewRank(
                    colOrder.map((col) => ({
                      rank: dbColumns?.find((c) => c.id === col)?.rank,
                    })),
                    sIndex,
                    dIndex,
                    true
                  );
                  updateColumn.mutate(
                    {
                      id: colOrder[sIndex],
                      rank: rank.toString(),
                    },
                    {
                      onSuccess: () => {
                        utils.setQueryData(
                          ["columns.byTableId", { tableId }],
                          (old) => {
                            if (!old) return [];
                            const cloned = cloneDeep(old).filter(Boolean);
                            const item = old[sIndex - 1];

                            cloned.splice(sIndex - 1, 1);
                            cloned.splice(dIndex - 1, 0, item);

                            const returnValue = cloned.map((column) =>
                              column.id === colOrder[sIndex]
                                ? { ...column, rank: rank.toString() }
                                : column
                            );

                            return returnValue;
                          }
                        );
                      },
                    }
                  );
                }
              }}
            >
              <Droppable droppableId="column-list" direction="horizontal">
                {(provided) => (
                  <>
                    <Box {...provided.droppableProps} ref={provided.innerRef}>
                      {headerGroups.map((headerGroup) => (
                        <Box
                          {...headerGroup.getHeaderGroupProps()}
                          sx={{ backgroundColor: theme.colors.gray[0] }}
                        >
                          {headerGroup.headers.map((column, index) => (
                            <HeaderCell
                              index={index}
                              key={column.id}
                              column={column}
                            />
                          ))}
                          {provided.placeholder}
                        </Box>
                      ))}
                    </Box>
                  </>
                )}
              </Droppable>
            </DragDropContext>
            <DragDropContext
              onDragEnd={async ({ destination, source }) => {
                if (
                  source &&
                  destination &&
                  source.index !== destination.index
                ) {
                  const recordsCopy = cloneDeep(records);
                  handlers.reorder({
                    from: source.index,
                    to: destination.index,
                  });
                  const id = recordsCopy[source.index].id;
                  const rank = getNewRank(
                    recordsCopy,
                    source.index,
                    destination.index
                  ).toString();
                  await updateRowRank.mutateAsync(
                    { id, rank },
                    {
                      onSuccess: () => {
                        // utils.refetchQueries(rowsQueryKey);
                        utils.setQueryData(rowsQueryKey, (old) => {
                          if (!old) return [];
                          const cloned = [...old];
                          const item = old[source.index];

                          cloned.splice(source.index, 1);
                          cloned.splice(destination.index, 0, item);

                          return cloned.map((row) =>
                            row.id === id ? { ...row, rank } : row
                          );
                        });
                      },
                    }
                  );
                }
                console.log("INFO: Reordering stored");
              }}
            >
              <Droppable droppableId="row-list" direction="vertical">
                {(provided) => (
                  <Box
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    {...getTableBodyProps()}
                  >
                    {rows.map((row, index) => {
                      prepareRow(row);
                      return (
                        <Draggable
                          key={row.id}
                          index={index}
                          draggableId={row.id}
                        >
                          {(provided) => {
                            return (
                              <Box
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                              >
                                <Box
                                  {...row.getRowProps()}
                                  className={cx(classes.rowUnselected, {
                                    [classes.rowSelected]:
                                      row.id in state.selectedRowIds,
                                  })}
                                >
                                  {row.cells.map((cell) => {
                                    if (cell.column.id === "selection") {
                                      return (
                                        <Box
                                          className={classes.cell}
                                          {...cell.getCellProps()}
                                          {...provided.dragHandleProps}
                                        >
                                          {cell.render("Cell")}
                                        </Box>
                                      );
                                    }
                                    return (
                                      <Box
                                        className={classes.cell}
                                        sx={{
                                          padding: 0,
                                          width: cell.column.width,
                                        }}
                                        {...cell.getCellProps()}
                                      >
                                        {cell.render("Cell")}
                                      </Box>
                                    );
                                  })}
                                </Box>
                              </Box>
                            );
                          }}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </DragDropContext>
          </Box>
        </ScrollArea>
        <Group spacing="sm" m="sm" align="center">
          <Tooltip withArrow label="shift + enter" position="bottom">
            <Button
              loading={addRow.isLoading}
              variant="default"
              color="gray"
              leftIcon={<IconPlus size={16} />}
              onClick={createNewRow}
              compact
            >
              New Row
            </Button>
          </Tooltip>
          <Button color="gray" variant="default" compact disabled>
            Load More
          </Button>
        </Group>
      </Box>
    </Box>
  );
};
