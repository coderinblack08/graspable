import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Group,
  Input,
  Loader,
  Popover,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import { IconFilter, IconPlus, IconTrash } from "@tabler/icons";
import { Form, Formik, useField, useFormikContext } from "formik";
import debounce from "lodash.debounce";
import React, { useCallback, useEffect, useState } from "react";
import { InferQueryOutput, trpc } from "../lib/trpc";

export interface Filter {
  columnId: string;
  value: string;
  operation:
    | "equals"
    | "contains"
    | "checked"
    | "unchecked"
    | "startsWith"
    | "endsWith";
}

interface FilterPopoverProps {
  columns: InferQueryOutput<"columns.byTableId">;
  tableId: string;
}

const FilterValueInput: React.FC<{
  column?: InferQueryOutput<"columns.byTableId">[0] | null;
}> = ({ column }) => {
  const [{ value, onChange }, _, { setValue }] = useField("value");
  if (column?.type === "checkbox") {
    return null;
  }
  if (column?.type === "dropdown") {
    return (
      <Select
        styles={{
          input: {
            borderStartStartRadius: 0,
            borderEndStartRadius: 0,
          },
        }}
        color="blue"
        size="xs"
        placeholder="Select a value"
        name="value"
        value={value || ""}
        onChange={(value) => value && setValue(value)}
        data={
          column.dropdownOptions?.map((x) => ({ label: x, value: x })) || []
        }
      />
    );
  }
  return (
    <Input
      size="xs"
      placeholder="Value"
      value={value || ""}
      styles={(theme) => ({
        input: {
          borderStartStartRadius: 0,
          borderEndStartRadius: 0,
          borderColor: theme.colors.gray[4],
        },
      })}
      type={column?.type === "number" ? "number" : "text"}
      name="value"
      onChange={onChange}
    />
  );
};

const AutoSave: React.FC = () => {
  const formik = useFormikContext();
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSubmit = useCallback(
    debounce(() => formik.submitForm().then(() => setIsLoading(false)), 500),
    [formik.submitForm, formik.isValid, formik.initialValues, formik.values]
  );

  useEffect(() => {
    if (formik.isValid && formik.dirty) {
      setIsLoading(true);
      debouncedSubmit();
    }
    return debouncedSubmit.cancel;
  }, [debouncedSubmit, formik.dirty, formik.isValid, formik.values]);

  return isLoading ? <Loader ml={8} size="xs" color="gray" /> : null;
};

const FilterRow: React.FC<{
  filter: InferQueryOutput<"filters.byTableId">[0];
  columns: InferQueryOutput<"columns.byTableId">;
  tableId: string;
}> = ({ filter, columns, tableId }) => {
  const deleteFilter = trpc.useMutation(["filters.delete"]);
  const updateFilter = trpc.useMutation(["filters.update"]);
  const utils = trpc.useContext();
  const columnsDict = React.useMemo(() => {
    return columns.reduce((acc, column) => {
      acc[column.id] = column;
      return acc;
    }, {} as Record<string, InferQueryOutput<"columns.byTableId">[0]>);
  }, [columns]);

  function getOperations(
    type: InferQueryOutput<"columns.byTableId">[0]["type"] | undefined
  ) {
    switch (type) {
      case "dropdown":
        return [{ value: "equals", label: "Equals" }];
      case "text":
        return [
          { value: "equals", label: "Equals" },
          { value: "contains", label: "Contains" },
          { value: "startsWith", label: "Starts with" },
          { value: "endsWith", label: "Ends with" },
        ];
      case "number":
        return [
          { value: "equals", label: "Equals" },
          { value: "gt", label: "Greater than" },
          { value: "lt", label: "Less than" },
        ];
      case "checkbox":
        return [
          { value: "checked", label: "Checked" },
          { value: "unchecked", label: "Unchecked" },
        ];
      default:
        return [];
    }
  }

  return (
    <Formik
      onSubmit={(values) => {
        updateFilter.mutate(values, {
          onSuccess(data) {
            utils.setQueryData(["filters.byTableId", { tableId }], (old) =>
              (old || []).map((x) => (x.id === data.id ? data : x))
            );
            utils.refetchQueries(["rows.byTableId", { tableId }]);
          },
        });
      }}
      initialValues={filter}
      enableReinitialize
    >
      {({ values, setFieldValue }) => (
        <Form>
          <Group spacing={0} noWrap>
            <Text
              px={8}
              weight={500}
              color="dimmed"
              sx={(theme) => ({ fontSize: theme.fontSizes.xs })}
            >
              Where:
            </Text>
            <Select
              size="xs"
              styles={{
                input: {
                  borderEndEndRadius: 0,
                  borderStartEndRadius: 0,
                  borderRight: 0,
                },
              }}
              onChange={(col) => col && setFieldValue("columnId", col, false)}
              value={values.columnId}
              placeholder="Column"
              data={columns.map((col) => ({
                label: col.name,
                value: col.id,
              }))}
            />
            <Select
              data={
                values.columnId
                  ? getOperations(columnsDict[values.columnId]?.type)
                  : []
              }
              size="xs"
              styles={{ input: { borderRadius: 0, borderRight: 0 } }}
              placeholder="Operation"
              name="operation"
              value={values.operation}
              onChange={(op: any) =>
                op && setFieldValue("operation", op, false)
              }
              disabled={!values.columnId}
            />
            <FilterValueInput
              column={values.columnId ? columnsDict[values.columnId] : null}
            />
            <ActionIcon
              variant="outline"
              ml={8}
              onClick={() => {
                deleteFilter.mutate(
                  {
                    tableId: filter.tableId,
                    id: filter.id,
                  },
                  {
                    onSuccess() {
                      utils.setQueryData(
                        ["filters.byTableId", { tableId: filter.tableId }],
                        (old) => {
                          return (old || []).filter((f) => f.id !== filter.id);
                        }
                      );
                      utils.refetchQueries(["rows.byTableId", { tableId }]);
                    },
                  }
                );
              }}
              color="red"
            >
              <IconTrash size={16} />
            </ActionIcon>
            <AutoSave />
          </Group>
        </Form>
      )}
    </Formik>
  );
};

export const FilterPopover: React.FC<FilterPopoverProps> = ({
  columns,
  tableId,
}) => {
  const { data: filters } = trpc.useQuery(["filters.byTableId", { tableId }]);
  const addFilter = trpc.useMutation(["filters.add"]);

  const utils = trpc.useContext();
  const [opened, setOpened] = React.useState(false);

  if (filters) {
    return (
      <Popover
        styles={{
          inner: { padding: 0 },
          body: { width: "100%" },
        }}
        opened={opened}
        onClose={() => setOpened(false)}
        target={
          <Button
            onClick={() => setOpened(true)}
            leftIcon={<IconFilter size={16} />}
            rightIcon={
              filters.length ? (
                <Badge size="xs">{filters.length}</Badge>
              ) : undefined
            }
            compact
          >
            Filter
          </Button>
        }
        width={560}
        position="bottom"
      >
        <Box>
          <Stack spacing={8} p="sm" pt={filters.length ? "sm" : 0}>
            {filters.map((item) => (
              <FilterRow
                tableId={tableId}
                key={item.id}
                filter={item}
                columns={columns}
              />
            ))}
          </Stack>
          <Box mx="xs" mb="xs">
            <Button
              color="gray"
              leftIcon={<IconPlus size={16} />}
              size="xs"
              onClick={() => {
                addFilter.mutate(
                  {
                    tableId,
                    columnId: null,
                    operation: null,
                    value: null,
                  },
                  {
                    onSuccess(data) {
                      utils.setQueryData(
                        ["filters.byTableId", { tableId }],
                        (old) => [...(old || []), data]
                      );
                    },
                  }
                );
              }}
              fullWidth
            >
              Add Condition
            </Button>
          </Box>
        </Box>
      </Popover>
    );
  }

  return null;
};
