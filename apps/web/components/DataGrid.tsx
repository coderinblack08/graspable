/* eslint-disable react-hooks/rules-of-hooks */
import {
  ActionIcon,
  Box,
  Button,
  Checkbox,
  createStyles,
  Group,
  ScrollArea,
  Select,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { useListState } from "@mantine/hooks";
import { IconPlus, IconTrash } from "@tabler/icons";
import { useDebounce, useDebouncedCallback } from "use-debounce";
import { CollectionReference, doc, updateDoc } from "firebase/firestore";
import cloneDeep from "lodash.clonedeep";
import React, { useRef } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { useRowSelect, useTable } from "react-table";
import { useFirestore, useFirestoreCollectionData } from "reactfire";
import { Cell, Column, Row } from "../types";

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
  const { data: rows } = useFirestoreCollectionData<Row>(rowsRef as any, {
    idField: "id",
  });
  const { data: cells } = useFirestoreCollectionData<Cell>(cellsRef as any, {
    idField: "id",
  });

  if (rows && cells && columns) {
    return (
      <DataGridUI
        cellsRef={cellsRef}
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
    row: { index: rowIndex, id: rowId },
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
        backgroundColor: "transparent",
        borderRadius: 0,
      },
    };
    switch (column?.type) {
      case "text":
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
        return null;
    }
  };
};

const DataGridUI: React.FC<{
  db_rows: Row[];
  db_columns: Column[];
  db_cells: Cell[];
  cellsRef: CollectionReference;
}> = ({ cellsRef, db_cells, db_columns, db_rows }) => {
  const { cx, classes } = useStyles();
  const [skipPageReset, setSkipPageReset] = React.useState(false);

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
            acc[curr.columnId] = curr.value;
            return acc;
          }, new Object());
      }),
    [db_rows, db_cells]
  );

  const [records, handlers] = useListState(cloneDeep(RT_DATA));

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
          onDragEnd={({ destination, source }) => {
            if (source && destination) {
              handlers.reorder({ from: source.index, to: destination.index });
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
                      <ActionIcon>
                        <IconPlus size={16} />
                      </ActionIcon>
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
                                  sx={{ padding: 0 }}
                                  {...cell.getCellProps()}
                                >
                                  {cell.render("Cell")}
                                </Box>
                              );
                            })}
                            <Box
                              component="th"
                              sx={(theme) => ({
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
      <Group spacing="sm">
        <Tooltip withArrow label="shift + enter" position="bottom">
          <Button
            my="sm"
            variant="default"
            color="gray"
            leftIcon={<IconPlus size={16} />}
            compact
          >
            New Row
          </Button>
        </Tooltip>
        <Button leftIcon={<IconTrash size={16} />} color="red" compact>
          Delete Table
        </Button>
      </Group>
    </Box>
  );
};
