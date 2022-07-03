import {
  Box,
  Button,
  Center,
  createStyles,
  Group,
  Loader,
  ScrollArea,
  Select,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { useHotkeys, useListState } from "@mantine/hooks";
import { IconLayout, IconPlus, IconRobot, IconTrash } from "@tabler/icons";
import { LexoRank } from "lexorank";
import cloneDeep from "lodash.clonedeep";
import { useSession } from "next-auth/react";
import React, { useEffect } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import {
  useBlockLayout,
  useColumnOrder,
  useResizeColumns,
  useRowSelect,
  useTable,
} from "react-table";
import { useDebouncedCallback } from "use-debounce";
import shallow from "zustand/shallow";
import { InferQueryOutput, trpc } from "../lib/trpc";
import { EditableCell } from "./EditableCell";
import { FilterPopover } from "./FilterPopover";
import { HeaderCell } from "./HeaderCell";
import { HideColumnPopover } from "./HideCoumnPopover";
import { IndeterminateCheckbox } from "./IndeterminateCheckbox";
import { NewColumnPopover } from "./NewColumnPopover";
import { NewFormModal } from "./NewFormModal";
import { SortPopover } from "./SortPopover";
import { useActiveCellStore } from "./useActiveCellStore";

export const useStyles = createStyles((theme) => ({
  table: {
    display: "inline-block",
    borderSpacing: 0,
    border: `1px solid ${theme.colors.dark[6]}`,
  },
  cell: {
    position: "relative",
    margin: 0,
    textAlign: "left",
    padding: "8px",
    fontSize: theme.fontSizes.sm,
    border: `1px solid ${theme.colors.dark[6]}`,
    // "&:focus-within": {
    //   position: "relative",
    //   zIndex: 50,
    //   borderColor: theme.colors.blue[5],
    //   boxShadow: `0 0 0 1px ${theme.colors.blue[5]}`,
    // },
  },
  rowSelected: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.fn.rgba(theme.colors[theme.primaryColor][7], 0.2)
        : theme.colors[theme.primaryColor][0],
  },
  rowUnselected: {
    backgroundColor: theme.colors.dark[8],
  },
  resizer: {
    display: "inline-block",
    background: theme.colors.dark[5],
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
  const { data: rows } = trpc.useQuery(["rows.byTableId", { tableId }], {
    keepPreviousData: true,
  });
  const { data: columns } = trpc.useQuery(["columns.byTableId", { tableId }]);
  const { data: cells } = trpc.useQuery(["cells.byTableId", { tableId }]);
  const utils = trpc.useContext();
  trpc.useSubscription(["cells.onUpsert", { tableId }], {
    onNext(data) {
      // upsert on cell might affect the rows, so we need to re-query them
      // ...
      utils.setQueryData(["cells.byTableId", { tableId }], (old) => {
        if (!old) return [];
        const existingCell = old.find((x) => x.id === data.id);
        if (existingCell) {
          return old.map((x) => (x.id === data.id ? data : x));
        } else {
          return [...old, data];
        }
      });
    },
  });
  trpc.useSubscription(["rows.onAdd", { tableId }], {
    onNext(data) {
      utils.refetchQueries(["rows.byTableId", { tableId }]);
      // utils.setQueryData(["rows.byTableId", { tableId }], (old) => {
      //   if (!old) return [];
      //   return [...old, data];
      // });
    },
  });
  trpc.useSubscription(["columns.onUpdate", { tableId }], {
    onNext() {
      utils.refetchQueries(["columns.byTableId", { tableId }]);
    },
  });
  trpc.useSubscription(["rows.onDelete", { tableId }], {
    onNext(ids) {
      console.log(ids);

      utils.setQueryData(["rows.byTableId", { tableId }], (old) => {
        if (!old) return [];
        return old.filter((x) => !ids.includes(x.id));
      });
    },
  });

  trpc.useSubscription(["columns.onAdd", { tableId }], {
    onNext(data) {
      utils.setQueryData(["columns.byTableId", { tableId }], (old) => {
        if (!old) return [];
        return [...old, data];
      });
    },
  });
  trpc.useSubscription(["columns.onDelete", { tableId }], {
    onNext(data) {
      utils.setQueryData(
        ["columns.byTableId", { tableId: data.tableId! }],
        (old) => {
          return (old || []).filter((c) => c.id !== data.id);
        }
      );
    },
  });

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

  return (
    <Center sx={{ height: "100%" }}>
      <Loader variant="dots" color="dark" />
    </Center>
  );
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
  const { data: session } = useSession();
  const [skipPageReset, setSkipPageReset] = React.useState(false);

  const { data: sorts } = trpc.useQuery(["sorts.byTableId", { tableId }]);
  const { data: filters } = trpc.useQuery(["filters.byTableId", { tableId }]);
  const { data: membership } = trpc.useQuery([
    "workspace.myMembership",
    { workspaceId },
  ]);
  const [cursorId, activeCell, setActiveCell, setCursorId] = useActiveCellStore(
    (store) => [store.id, store.cell, store.setActiveCell, store.setId],
    shallow
  );

  const RT_COLUMNS = React.useMemo(
    () =>
      dbColumns?.map((db_column) => ({
        Header: db_column.name,
        accessor: db_column.id,
        width: db_column.width || 150,
        type: db_column.type,
        tableId: db_column.tableId,
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
        createCell.mutate(
          { tableId, rowId, columnId, value },
          {
            onSuccess: (data) => {
              // utils.refetchQueries(["cells.byTableId", { tableId }]);
              utils.setQueryData(["cells.byTableId", { tableId }], (old) => {
                let found = false;
                old = (old || []).map((x) => {
                  found = true;
                  return x.rowId === rowId && x.columnId === columnId
                    ? { ...x, value }
                    : x;
                });
                if (!found) {
                  old.push(data);
                }
                return old;
              });
            },
          }
        );
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
        Cell: EditableCell(workspaceId, tableId, dbColumns),
        minWidth: 100,
        maxWidth: 400,
        disableResizing: membership?.role === "viewer",
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
      hooks.visibleColumns.push((columns) => {
        if (membership?.role === "viewer") return columns;
        return [
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
        ];
      });
    }
  );

  const updateRowRank = trpc.useMutation(["rows.updateRank"]);
  const updateColumn = trpc.useMutation(["columns.update"]);
  const addRow = trpc.useMutation(["rows.add"]);
  const removeRows = trpc.useMutation(["rows.delete"]);
  const utils = trpc.useContext();

  const updateCursor = trpc.useMutation(["cursors.update"]);
  trpc.useSubscription(["cursors.onCreate", { tableId }], {
    onNext(cursor) {
      utils.setQueryData(["cursors.byTableId", { tableId }], (old) => {
        if (cursor.userId === session?.user.id) {
          setCursorId(cursor.id);
        }
        return [...(old || []), cursor];
      });
    },
  });
  trpc.useSubscription(["cursors.onUpdate", { tableId }], {
    onNext(cursor) {
      utils.setQueryData(["cursors.byTableId", { tableId }], (old) => {
        return (old || [])?.map((x) => (x.id === cursor.id ? cursor : x));
      });
    },
  });
  trpc.useSubscription(["cursors.onDelete", { tableId }], {
    onNext(data) {
      utils.setQueryData(["cursors.byTableId", { tableId }], (old) => {
        return (old || []).filter((x) => x.id !== data.id);
      });
    },
  });

  const debouncedUpdateCursor = useDebouncedCallback(
    (activeCell: any, tableId: string, cursorId: string | null) => {
      updateCursor.mutate({ tableId, ...activeCell, id: cursorId });
    },
    500
  );

  useEffect(() => {
    debouncedUpdateCursor(activeCell, tableId, cursorId);
  }, [activeCell, cursorId, tableId]);

  trpc.useSubscription(["rows.onUpdateRank", { tableId }], {
    onNext() {
      utils.refetchQueries(["rows.byTableId", { tableId }]);
      // utils.setQueryData(["rows.byTableId", { tableId }], (old) => {
      //   console.log(data);
      //   old = (old || []).map((x) => (x.id === data.id ? data : x));
      //   return (old || [])?.sort((a, b) => a.rank - b.rank);
      // });
    },
  });

  const createNewRow = async () => {
    const rank = dbRows.length
      ? LexoRank.parse(dbRows.at(-1)?.rank!).genNext().toString()
      : LexoRank.middle().toString();
    await addRow.mutateAsync({ tableId, rank });
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

  useHotkeys([
    ["shift+enter", createNewRow],
    [
      "ArrowLeft",
      () => {
        const activeColumnIndex = dbColumns.findIndex(
          (x) => x.id === activeCell.columnId
        );
        setActiveCell(
          activeCell.rowId,
          dbColumns[Math.max(0, activeColumnIndex - 1)].id
        );
      },
    ],
    [
      "ArrowRight",
      () => {
        const activeColumnIndex = dbColumns.findIndex(
          (x) => x.id === activeCell.columnId
        );
        setActiveCell(
          activeCell.rowId,
          dbColumns[Math.min(dbColumns.length - 1, activeColumnIndex + 1)].id
        );
      },
    ],
    [
      "ArrowDown",
      () => {
        const activeRowIndex = dbRows.findIndex(
          (x) => x.id === activeCell.rowId
        );
        setActiveCell(
          dbRows[Math.min(dbRows.length - 1, activeRowIndex + 1)].id,
          activeCell.columnId
        );
      },
    ],
    [
      "ArrowUp",
      () => {
        const activeRowIndex = dbRows.findIndex(
          (x) => x.id === activeCell.rowId
        );
        setActiveCell(
          dbRows[Math.max(0, activeRowIndex - 1)].id,
          activeCell.columnId
        );
      },
    ],
  ]);

  const {
    setColumnOrder,
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    flatHeaders,
    allColumns,
    prepareRow,
    state,
  } = tableInstance;

  const { data: cursors } = trpc.useQuery(["cursors.byTableId", { tableId }]);

  return (
    <Box>
      <Group
        position="apart"
        p={8}
        sx={{
          backgroundColor: theme.colors.dark[8],
          borderBottom: "2px solid",
          borderColor: theme.colors.dark[5],
        }}
      >
        <Group spacing={8} align="center">
          {JSON.stringify(cursors?.length)}

          {/* <Select
            value="table"
            size="xs"
            variant="filled"
            color="blue"
            icon={<IconLayout size={16} />}
            styles={{
              input: { fontWeight: 700, fontSize: 14 },
              wrapper: { width: 120 },
            }}
            data={[
              { label: "Table", value: "table" },
              { label: "Cards", value: "cards" },
              { label: "Calendar", value: "calendar" },
            ]}
          /> */}
          {Object.keys(state.selectedRowIds).length > 0 ? (
            <>
              <Button
                loading={removeRows.isLoading}
                leftIcon={<IconTrash size={16} />}
                color="red"
                compact
                onClick={() =>
                  removeRows.mutate({
                    ids: Object.keys(state.selectedRowIds),
                    tableId,
                  })
                }
              >
                Delete
              </Button>
            </>
          ) : (
            <>
              <FilterPopover
                workspaceId={workspaceId}
                tableId={tableId}
                columns={dbColumns}
              />
              {/* <Button leftIcon={<IconFrame size={16} />} compact>
                Group
              </Button> */}
              <SortPopover
                workspaceId={workspaceId}
                tableId={tableId}
                columns={dbColumns}
              />
              <HideColumnPopover allColumns={allColumns} />
            </>
          )}
        </Group>
        <Group spacing={8}>
          <NewFormModal tableId={tableId} />
          <Button leftIcon={<IconRobot size={16} />} variant="outline" compact>
            Automation
          </Button>
        </Group>
      </Group>

      <ScrollArea scrollbarSize={0}>
        <Box mt={-2}>
          <Box
            // component="table"
            className={classes.table}
            // ref={outsideRef}
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
                          sx={(theme) => ({
                            backgroundColor: theme.colors.dark[8],
                          })}
                        >
                          {headerGroup.headers.map((column, index) => (
                            <HeaderCell
                              index={index}
                              workspaceId={workspaceId}
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
                        utils.setQueryData(
                          ["rows.byTableId", { tableId }],
                          (old) => {
                            if (!old) return [];
                            const cloned = [...old];
                            const item = old[source.index];

                            cloned.splice(source.index, 1);
                            cloned.splice(destination.index, 0, item);

                            return cloned.map((row) =>
                              row.id === id ? { ...row, rank } : row
                            );
                          }
                        );
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
                          isDragDisabled={
                            (filters &&
                              sorts &&
                              (filters?.length > 0 || sorts?.length > 0)) ||
                            membership?.role === "viewer"
                          }
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
          <Group spacing="sm" p="sm" align="center">
            <Tooltip withArrow label="shift + enter" position="bottom">
              <Button
                loading={addRow.isLoading}
                variant="default"
                color="dark"
                leftIcon={<IconPlus size={16} />}
                onClick={createNewRow}
                compact
              >
                New Row
              </Button>
            </Tooltip>
            <Button color="dark" variant="default" compact disabled>
              Load More
            </Button>
          </Group>
        </Box>
      </ScrollArea>
    </Box>
  );
};
