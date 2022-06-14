/* eslint-disable react-hooks/rules-of-hooks */
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
import { useListState } from "@mantine/hooks";
import { IconPlus, IconTrash } from "@tabler/icons";
import {
  CollectionReference,
  doc,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { LexoRank } from "lexorank";
import cloneDeep from "lodash.clonedeep";
import React, { useEffect, useRef } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { useRowSelect, useTable } from "react-table";
import {
  useFirestore,
  useFirestoreCollectionData,
  useFunctions,
} from "reactfire";
import { useDebouncedCallback } from "use-debounce";
import { Cell, Column, Row } from "../types";
import { AsyncLoadingButton } from "./AsyncLoadingButton";

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
  columnsRef: CollectionReference;
  rowsRef: CollectionReference;
  cellsRef: CollectionReference;
}

export const DataGrid: React.FC<DataGridProps> = ({
  columnsRef,
  rowsRef,
  cellsRef,
}) => {
  const { data: columns } = useFirestoreCollectionData<Column>(
    columnsRef as any,
    {
      idField: "id",
    }
  );
  const { data: rows } = useFirestoreCollectionData<Row>(
    query(rowsRef as any, orderBy("rank", "asc")),
    {
      idField: "id",
    }
  );
  const { data: cells } = useFirestoreCollectionData<Cell>(cellsRef as any, {
    idField: "id",
  });

  const [_, workspaceId, __, tableId] = cellsRef.path.split("/");

  if (rows && cells && columns) {
    return (
      <DataGridUI
        workspaceId={workspaceId}
        tableId={tableId}
        cellsRef={cellsRef}
        rowsRef={rowsRef}
        db_rows={rows}
        db_cells={cells}
        db_columns={columns}
      />
    );
  }

  return null;
};

// eslint-disable-next-line react/display-name
const IndeterminateCheckbox = React.forwardRef<HTMLInputElement, any>(
  ({ indeterminate, ...rest }, ref) => {
    const defaultRef = useRef<HTMLInputElement>();
    const resolvedRef = ref || defaultRef;

    return (
      <Checkbox indeterminate={indeterminate} ref={resolvedRef} {...rest} />
    );
  }
);

const EditableCell = (columns?: Column[]) => {
  // console.log(columns);

  // eslint-disable-next-line react/display-name
  return ({
    value: initialValue,
    row: { index: rowIndex, id: _rowId },
    column: { id: columnId },
    updateMyData,
  }: any) => {
    const [value, setValue] = React.useState(initialValue);
    const debounced = useDebouncedCallback(() => {
      updateMyData(rowIndex, columnId, value);
      console.log("INFO: data-grid synched to database");
    }, 800);

    React.useEffect(() => {
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
      // case "text":

      case "date":
        if (value && Object.hasOwn(value, "seconds")) {
          setValue(value.toDate());
        }
        return (
          <>
            <DatePicker
              onChange={(date) => {
                setValue(date);
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
};

const NewColumnPopover: React.FC<{ workspaceId: string; tableId: string }> = ({
  workspaceId,
  tableId,
}) => {
  const functions = useFunctions();
  const createNewColumn = httpsCallable(functions, "createNewColumn");
  const [opened, setOpened] = React.useState(false);
  const [msData, setMsData] = React.useState<any[]>([]);
  const form = useForm({
    initialValues: {
      name: "",
      type: "",
      dropdownOptions: [],
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
            const data: any = Object.assign({}, values);
            if (data.type !== "dropdown") delete data.dropdownOptions;
            await createNewColumn({ ...data, workspaceId, tableId });
            // console.log(data);
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
  db_rows: Row[];
  db_columns: Column[];
  db_cells: Cell[];
  cellsRef: CollectionReference;
  rowsRef: CollectionReference;
}> = ({
  workspaceId,
  tableId,
  cellsRef,
  db_cells,
  rowsRef,
  db_columns,
  db_rows,
}) => {
  const { cx, classes } = useStyles();
  const [skipPageReset, setSkipPageReset] = React.useState(false);

  const functions = useFunctions();
  const createNewRow = httpsCallable(functions, "createNewRow");

  const RT_COLUMNS = React.useMemo(
    () =>
      db_columns?.map((db_column) => ({
        Header: db_column.name,
        accessor: db_column.id,
      })),
    [db_columns]
  );

  const cell_ids = React.useMemo(() => {
    const result: Record<string, Record<string, string>> = {};
    for (let i = 0; i < db_rows.length; i++) {
      for (let j = 0; j < db_columns.length; j++) {
        const cell = db_cells.find(
          (x) => x.rowId === db_rows[i].id && x.columnId === db_columns[j].id
        );
        if (cell) {
          if (!result.hasOwnProperty(db_rows[i].id)) {
            result[db_rows[i].id] = {};
          }
          result[db_rows[i].id][db_columns[j].id] = cell.id;
        }
      }
    }
    return result;
  }, [db_cells, db_columns, db_rows]);

  const RT_DATA = React.useMemo(
    () =>
      db_rows?.map((row) => {
        return db_cells
          ?.filter((cell) => cell.rowId === row.id)
          .reduce((acc: Record<string, any>, curr) => {
            if (!acc.id) acc.id = row.id;
            acc[curr.columnId] = curr.value || null;
            return acc;
          }, new Object());
      }),
    [db_rows, db_cells]
  );

  const [records, handlers] = useListState(cloneDeep(RT_DATA));

  useEffect(() => {
    handlers.setState(cloneDeep(RT_DATA));
  }, [RT_DATA]);

  const getRowId = React.useCallback((row) => {
    return row.id;
  }, []);

  const firestore = useFirestore();

  const updateMyData = (rowIndex: number, columnId: string, value: any) => {
    setSkipPageReset(true);
    handlers.apply((row, index) => {
      if (index === rowIndex) {
        const docRef = doc(
          firestore as any,
          ...cellsRef.path.split("/").concat(cell_ids[row.id][columnId])
        );
        updateDoc(docRef, { value });
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
      defaultColumn: { Cell: EditableCell(db_columns) },
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
            if (source && destination) {
              handlers.reorder({ from: source.index, to: destination.index });
              let above, below;
              if (destination.index > 0)
                below = db_rows.find(
                  (x) => x.id === records[destination.index - 1].id
                );
              if (destination.index < records.length - 1)
                above = db_rows.find(
                  (x) => x.id === records[destination.index + 1].id
                );
              let rank: LexoRank | undefined;
              if (above && below) {
                rank = LexoRank.parse(above.rank).between(
                  LexoRank.parse(below.rank)
                );
              }
              if (above && !below) {
                rank = LexoRank.parse(above.rank).genPrev();
              }
              if (below && !above) {
                rank = LexoRank.parse(below.rank).genNext();
              }
              await updateDoc(
                doc(
                  firestore as any,
                  ...rowsRef.path.split("/"),
                  records[source.index].id
                ),
                { rank: rank?.toString() }
              );
            }
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
          <AsyncLoadingButton
            variant="default"
            color="gray"
            leftIcon={<IconPlus size={16} />}
            onClick={async () => {
              await createNewRow({
                previousRank: records.length ? db_rows.at(-1)!.rank : null,
                workspaceId,
                tableId,
              });
            }}
            compact
          >
            New Row
          </AsyncLoadingButton>
        </Tooltip>
        <Button color="gray" variant="default" compact disabled>
          Load More
        </Button>
      </Group>
    </Box>
  );
};
