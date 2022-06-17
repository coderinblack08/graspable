import {
  ActionIcon,
  Box,
  Button,
  Center,
  Checkbox,
  createStyles,
  Group,
  Modal,
  MultiSelect,
  NumberInput,
  ScrollArea,
  Select,
  Stack,
  TextInput,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useBooleanToggle, useHotkeys, useListState } from "@mantine/hooks";
import {
  IconEyeOff,
  IconFilter,
  IconFrame,
  IconLayout,
  IconList,
  IconPlus,
  IconRobot,
  IconSearch,
  IconSortAscending,
  IconTrash,
} from "@tabler/icons";
import { LexoRank } from "lexorank";
import cloneDeep from "lodash.clonedeep";
import React, { useEffect, useRef } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import {
  HeaderGroup,
  useBlockLayout,
  useResizeColumns,
  useRowSelect,
  useTable,
} from "react-table";
import { useDebouncedCallback } from "use-debounce";
import { InferQueryOutput, trpc } from "../lib/trpc";

const useStyles = createStyles((theme) => ({
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
      transform: "translateX(3px)",
    },
    "&.isResizing": {
      background: theme.colors.gray[4],
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
  const { data: rows } = trpc.useQuery(["rows.byTableId", { tableId }]);
  const { data: columns } = trpc.useQuery(["columns.byTableId", { tableId }]);
  const { data: cells } = trpc.useQuery(["cells.byTableId", { tableId }]);

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

const IndeterminateCheckbox = React.forwardRef<HTMLInputElement, any>(
  ({ indeterminate, ...rest }, ref) => {
    const defaultRef = useRef<HTMLInputElement>();
    const resolvedRef = ref || defaultRef;

    return (
      <Checkbox indeterminate={indeterminate} ref={resolvedRef} {...rest} />
    );
  }
);

const EditableCell = (columns?: InferQueryOutput<"columns.byTableId">) => {
  const Cell: React.FC<any> = ({
    value: initialValue,
    row: { index: rowIndex, id: _rowId },
    column: { id: columnId },
    updateMyData,
  }) => {
    const [value, setValue] = React.useState(initialValue);
    const debounced = useDebouncedCallback(() => {
      updateMyData(rowIndex, columnId, value);
      console.log("INFO: data-grid synched to database");
    }, 800);

    useEffect(() => {
      setValue(initialValue);
    }, [initialValue]);

    const column = columns?.find((x) => x.id === columnId);
    const styles = {
      input: {
        border: "none",
        height: "100%",
        backgroundColor: "transparent",
        borderRadius: 0,
      },
    };

    switch (column?.type) {
      case "date":
        if (value && Object.hasOwn(value, "seconds")) {
          setValue(value.toDate());
        }
        return (
          <>
            <DatePicker
              onChange={(date) => {
                setValue(date?.toDateString());
                debounced();
              }}
              styles={styles}
              value={value && new Date(value)}
            />
          </>
        );
      case "checkbox":
        return (
          <Center style={{ height: "100%" }}>
            <Checkbox
              checked={!!value}
              onChange={(event) => {
                setValue(event.currentTarget.checked);
                debounced();
              }}
            />
          </Center>
        );
      case "number":
        return (
          <NumberInput
            value={value}
            onChange={(val) => {
              setValue(val || null);
              debounced();
            }}
            styles={styles}
          />
        );
      case "url":
        return (
          <TextInput
            type="url"
            styles={styles}
            value={value || ""}
            onChange={(e) => {
              setValue(e.target.value);
              debounced();
            }}
          />
        );
      case "dropdown":
        return (
          <Select
            color="blue"
            styles={styles}
            value={value}
            onChange={(value) => {
              setValue(value);
              debounced();
            }}
            data={
              column.dropdownOptions?.map((x) => ({ label: x, value: x })) || []
            }
          />
        );
      default:
        return (
          <TextInput
            styles={styles}
            value={value || ""}
            onChange={(e) => {
              setValue(e.target.value);
              debounced();
            }}
          />
        );
    }
  };

  return Cell;
};

const NewColumnPopover: React.FC<{ workspaceId: string; tableId: string }> = ({
  tableId,
}) => {
  const addColumn = trpc.useMutation(["columns.add"]);
  const utils = trpc.useContext();
  const [opened, setOpened] = React.useState(false);
  const [msData, setMsData] = React.useState<any[]>([]);
  const form = useForm({
    initialValues: {
      name: "",
      type: "" as
        | "number"
        | "text"
        | "url"
        | "dropdown"
        | "tags"
        | "checkbox"
        | "date"
        | "file",
      dropdownOptions: [] as string[],
    },
  });

  return (
    <>
      <ActionIcon onClick={() => setOpened((o) => !o)} size="sm">
        <IconPlus size={16} />
      </ActionIcon>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="New Column"
      >
        <form
          onSubmit={form.onSubmit(async (values) => {
            const data: Partial<typeof values> = Object.assign({}, values);
            if (data.type !== "dropdown") delete data.dropdownOptions;
            await addColumn.mutateAsync(
              {
                name: data.name!,
                type: data.type!,
                dropdownOptions: data.dropdownOptions,
                tableId,
              },
              {
                onSuccess: (data) => {
                  utils.setQueryData(
                    ["columns.byTableId", { tableId }],
                    (old) => [...(old || []), data]
                  );
                },
              }
            );
            setOpened(false);
          })}
        >
          <Stack>
            <TextInput
              size="xs"
              label="Name"
              placeholder="Column name"
              required
              {...form.getInputProps("name")}
            />
            <Select
              size="xs"
              label="Type"
              placeholder="Pick one a column type"
              data={[
                { value: "text", label: "Text" },
                { value: "number", label: "Number" },
                { value: "dropdown", label: "Dropdown" },
                { value: "checkbox", label: "Checkbox" },
                { value: "date", label: "Date" },
                { value: "url", label: "URL" },
                { value: "formula", label: "Formula", disabled: true },
              ]}
              {...form.getInputProps("type")}
              searchable
              required
            />
            {form.values.type === "dropdown" && (
              <MultiSelect
                size="xs"
                label="Dropdown options"
                data={msData}
                placeholder="Create dropdown options"
                searchable
                creatable
                getCreateLabel={(query) => `+ Create ${query}`}
                onCreate={(query) =>
                  setMsData((current) => [...current, query])
                }
                {...form.getInputProps("dropdownOptions")}
              />
            )}
            <Button type="submit" size="xs" color="gray">
              Create column
            </Button>
          </Stack>
        </form>
      </Modal>
    </>
  );
};

type HeaderCellProps = {
  column: HeaderGroup<Record<string, any>>;
};

export const HeaderCell: React.FC<HeaderCellProps> = ({ column }) => {
  const { id: columnId } = column;
  const { classes } = useStyles();

  const updateColumn = trpc.useMutation(["columns.update"]);
  const cellRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      column.isResizing === false &&
      column.width &&
      column.id !== "selection" &&
      column.id !== "new-column" &&
      cellRef.current
    ) {
      updateColumn.mutate({
        id: columnId,
        width: cellRef.current.clientWidth + 2,
      });
    }
  }, [column.id, column.isResizing, column.width, columnId]);

  return (
    <Box
      ref={cellRef}
      className={classes.cell}
      sx={{ fontWeight: 700, userSelect: "none" }}
      {...column.getHeaderProps()}
    >
      {column.render("Header")}
      {column?.canResize && (
        <div
          {...column.getResizerProps()}
          className={`${classes.resizer} ${
            column.isResizing ? "isResizing" : ""
          }`}
        />
      )}
    </Box>
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
          disableResizing: true,
          Header: () => (
            <div>
              <NewColumnPopover workspaceId={workspaceId} tableId={tableId} />
            </div>
          ),
          Cell: () => <div></div>,
        },
      ]);
    }
  );

  const updateRowRank = trpc.useMutation(["rows.updateRank"]);
  const addRow = trpc.useMutation(["rows.add"]);
  const removeRows = trpc.useMutation(["rows.delete"]);
  const utils = trpc.useContext();

  const createNewRow = async () => {
    const rank = dbRows.length
      ? LexoRank.parse(dbRows.at(-1)?.rank!).genNext().toString()
      : LexoRank.middle().toString();
    await addRow.mutateAsync(
      { tableId, rank },
      {
        onSuccess: (row) => {
          utils.setQueryData(["rows.byTableId", { tableId }], (old) => [
            ...(old || []),
            row,
          ]);
        },
      }
    );
  };

  useHotkeys([["shift+enter", createNewRow]]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state,
  } = tableInstance;

  return (
    <Box>
      <Group
        position="apart"
        p={8}
        sx={{
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
                        utils.setQueryData(
                          ["rows.byTableId", { tableId }],
                          (old) =>
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
              <Button leftIcon={<IconSortAscending size={16} />} compact>
                Sort
              </Button>
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
      <Box m="sm">
        <ScrollArea>
          <DragDropContext
            onDragEnd={async ({ destination, source }) => {
              if (source && destination && source.index !== destination.index) {
                const recordsCopy = cloneDeep(records);
                handlers.reorder({
                  from: source.index,
                  to: destination.index,
                });
                const id = recordsCopy[source.index].id;

                const getNewRank = (oldIndex: number, newIndex: number) => {
                  if (recordsCopy.length === 0) {
                    return LexoRank.middle();
                  } else if (newIndex === 0) {
                    const firstItem = recordsCopy[0].rank;
                    let rank = LexoRank.parse(firstItem).genPrev();
                    return rank;
                  } else if (newIndex === recordsCopy.length - 1) {
                    const lastItem = recordsCopy[recordsCopy.length - 1];
                    let rank = LexoRank.parse(lastItem.rank).genNext();
                    return rank;
                  } else {
                    const over = LexoRank.parse(recordsCopy[newIndex].rank);
                    const second = LexoRank.parse(
                      recordsCopy[newIndex + (newIndex < oldIndex ? -1 : 1)]
                        .rank
                    );
                    return over.between(second);
                  }
                };

                const rank = getNewRank(
                  source.index,
                  destination.index
                ).toString();
                await updateRowRank.mutateAsync(
                  { id, rank },
                  {
                    onSuccess: () => {
                      // utils.refetchQueries(["rows.byTableId", { tableId }]);
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
            <Box
              // component="table"
              className={classes.table}
              {...getTableProps()}
            >
              <Box>
                {headerGroups.map((headerGroup) => (
                  <Box {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <HeaderCell key={column.id} column={column} />
                    ))}
                  </Box>
                ))}
              </Box>
              <Droppable droppableId="dnd-list" direction="vertical">
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
                          {(provided) => (
                            <Box
                              // component="tr"
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
                                        // component="td"
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
                                {/* <Box
                                sx={(theme) => ({
                                  width: "38px",
                                  backgroundColor:
                                    row.id in state.selectedRowIds
                                      ? "transparent"
                                      : theme.colors.gray[0],
                                })}
                                className={classes.cell}
                              /> */}
                              </Box>
                            </Box>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </Box>
          </DragDropContext>
        </ScrollArea>
        <Group spacing="sm" my="sm" align="center">
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
