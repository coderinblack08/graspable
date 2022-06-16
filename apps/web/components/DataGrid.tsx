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
} from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useHotkeys, useListState } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons";
import { LexoRank } from "lexorank";
import cloneDeep from "lodash.clonedeep";
import React, { useEffect, useRef } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { useRowSelect, useTable } from "react-table";
import { useDebouncedCallback } from "use-debounce";
import { InferQueryOutput, trpc } from "../lib/trpc";

const useStyles = createStyles((theme) => ({
  table: {
    borderSpacing: 0,
    border: `1px solid ${theme.colors.gray[2]}`,
    borderCollapse: "separate",
  },
  cell: {
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
          <Center>
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
  workspaceId,
  tableId,
}) => {
  const addColumn = trpc.useMutation(["columns.add"]);
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
      <ActionIcon onClick={() => setOpened((o) => !o)}>
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
            await addColumn.mutateAsync({
              name: data.name!,
              type: data.type!,
              dropdownOptions: data.dropdownOptions,
              tableId,
            });
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

const DataGridUI: React.FC<{
  workspaceId: string;
  tableId: string;
  dbRows: InferQueryOutput<"rows.byTableId">;
  dbColumns: InferQueryOutput<"columns.byTableId">;
  dbCells: InferQueryOutput<"cells.byTableId">;
}> = ({ workspaceId, tableId, dbCells, dbColumns, dbRows }) => {
  const { cx, classes } = useStyles();
  const [skipPageReset, setSkipPageReset] = React.useState(false);

  const RT_COLUMNS = React.useMemo(
    () =>
      dbColumns?.map((db_column) => ({
        Header: db_column.name,
        accessor: db_column.id,
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
      createCell.mutate({ tableId, rowId, columnId, value });
      if (index === rowIndex) {
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
      defaultColumn: { Cell: EditableCell(dbColumns) },
      autoResetPage: !skipPageReset,
      updateMyData,
      getRowId,
    },
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((columns) => [
        {
          id: "selection",
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
      ]);
    }
  );

  const updateRowRank = trpc.useMutation(["rows.updateRank"]);
  const addRow = trpc.useMutation(["rows.add"]);
  const utils = trpc.useContext();

  const createNewRow = async () => {
    const rank = LexoRank.parse(dbRows.at(-1)?.rank!).genNext().toString();
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
    state: { selectedRowIds },
  } = tableInstance;

  return (
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
                    recordsCopy[newIndex + (newIndex < oldIndex ? -1 : 0)].rank
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
          <Box className={classes.table} component="table" {...getTableProps()}>
            <thead>
              {
                // Loop over the header rows
                headerGroups.map((headerGroup) => (
                  // Apply the header row props
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {
                      // Loop over the headers in each row
                      headerGroup.headers.map((column) => (
                        // Apply the header cell props
                        <Box
                          component="th"
                          className={classes.cell}
                          sx={{
                            width: column.id === "selection" ? 0 : column.width,
                            minWidth:
                              column.id === "selection" ? 0 : column.minWidth,
                          }}
                          {...column.getHeaderProps()}
                        >
                          {column.render("Header")}
                        </Box>
                      ))
                    }
                    <Box
                      component="th"
                      sx={(theme) => ({
                        backgroundColor: theme.colors.gray[0],
                        width: 0,
                        padding: "4px",
                      })}
                      className={classes.cell}
                    >
                      <NewColumnPopover
                        workspaceId={workspaceId}
                        tableId={tableId}
                      />
                    </Box>
                  </tr>
                ))
              }
            </thead>
            <Droppable droppableId="dnd-list" direction="vertical">
              {(provided) => (
                <tbody
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
                          <tr
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...row.getRowProps()}
                            className={cx({
                              [classes.rowSelected]: row.id in selectedRowIds,
                            })}
                          >
                            {row.cells.map((cell) => {
                              if (cell.column.id === "selection") {
                                return (
                                  <Box
                                    component="th"
                                    className={classes.cell}
                                    {...cell.getCellProps()}
                                    {...provided.dragHandleProps}
                                  >
                                    {row.id} <br />
                                    {records[index].rank}
                                    {cell.render("Cell")}
                                  </Box>
                                );
                              }
                              return (
                                <Box
                                  component="th"
                                  className={classes.cell}
                                  sx={{ padding: 0, width: cell.column.width }}
                                  {...cell.getCellProps()}
                                >
                                  {cell.render("Cell")}
                                </Box>
                              );
                            })}
                            <Box
                              component="th"
                              sx={(theme) => ({
                                width: "38px",
                                backgroundColor:
                                  row.id in selectedRowIds
                                    ? "transparent"
                                    : theme.colors.gray[0],
                              })}
                              className={classes.cell}
                            />
                          </tr>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </tbody>
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
  );
};
