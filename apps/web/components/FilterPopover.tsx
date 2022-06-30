import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Group,
  Input,
  Popover,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import { IconFilter, IconPlus, IconTrash } from "@tabler/icons";
import { Form, Formik, useField } from "formik";
import React from "react";
import { InferQueryOutput, trpc } from "../lib/trpc";
import { AutoSave } from "./AutoSave";

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
  workspaceId: string;
}

const FilterValueInput: React.FC<{
  column?: InferQueryOutput<"columns.byTableId">[0] | null;
  disabled?: boolean;
}> = ({ column, disabled = false }) => {
  const [{ value, onChange }, _, { setValue }] = useField("value");
  if (column?.type === "checkbox") {
    return null;
  }
  if (column?.type === "dropdown") {
    return (
      <Select
        disabled={disabled}
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
      disabled={disabled}
      placeholder="Value"
      value={value || ""}
      type={column?.type === "number" ? "number" : "text"}
      name="value"
      onChange={onChange}
    />
  );
};

const FilterRow: React.FC<{
  filter: InferQueryOutput<"filters.byTableId">[0];
  columns: InferQueryOutput<"columns.byTableId">;
  tableId: string;
  interactive: boolean;
}> = ({ filter, columns, tableId, interactive = true }) => {
  const deleteFilter = trpc.useMutation(["filters.delete"]);
  const updateFilter = trpc.useMutation(["filters.update"]);
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
        values.value = values.value?.toString() || "";
        updateFilter.mutate(values, {});
      }}
      initialValues={filter}
      enableReinitialize
    >
      {({ values, setFieldValue }) => (
        <Form>
          <Group spacing={8} noWrap>
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
              disabled={!interactive}
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
              disabled={!interactive}
              size="xs"
              placeholder="Operation"
              name="operation"
              value={values.operation}
              onChange={(op: any) =>
                op && setFieldValue("operation", op, false)
              }
            />
            <FilterValueInput
              disabled={!interactive}
              column={values.columnId ? columnsDict[values.columnId] : null}
            />
            {interactive && (
              <ActionIcon
                variant="light"
                onClick={() => {
                  deleteFilter.mutate({
                    tableId: filter.tableId,
                    id: filter.id,
                  });
                }}
                color="red"
              >
                <IconTrash size={16} />
              </ActionIcon>
            )}
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
  workspaceId,
}) => {
  const { data: filters } = trpc.useQuery(["filters.byTableId", { tableId }]);
  const addFilter = trpc.useMutation(["filters.add"]);
  const { data: membership } = trpc.useQuery([
    "workspace.myMembership",
    { workspaceId },
  ]);

  const utils = trpc.useContext();
  const [opened, setOpened] = React.useState(false);

  trpc.useSubscription(["filters.onAdd", { tableId }], {
    onNext(data) {
      utils.setQueryData(["filters.byTableId", { tableId }], (old) =>
        old ? [...old, data] : [data]
      );
    },
  });
  trpc.useSubscription(["filters.onUpdate", { tableId }], {
    onNext(data) {
      utils.setQueryData(["filters.byTableId", { tableId }], (old) =>
        (old || [])?.map((x) => (x.id === data.id ? data : x))
      );
      utils.refetchQueries(["rows.byTableId", { tableId }]);
    },
  });
  trpc.useSubscription(["filters.onDelete", { tableId }], {
    onNext(data) {
      utils.setQueryData(["filters.byTableId", { tableId }], (old) =>
        (old || []).filter((f) => f.id !== data.id)
      );
      utils.refetchQueries(["rows.byTableId", { tableId }]);
    },
  });

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
                <Badge size="xs" variant="outline">
                  {filters.length}
                </Badge>
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
                interactive={membership?.role !== "viewer"}
                tableId={tableId}
                key={item.id}
                filter={item}
                columns={columns}
              />
            ))}
          </Stack>
          <Box mx="xs" mb="xs">
            <Button
              color="dark"
              leftIcon={<IconPlus size={16} />}
              size="xs"
              onClick={() => {
                addFilter.mutate({
                  tableId,
                  columnId: null,
                  operation: null,
                  value: null,
                });
              }}
              fullWidth
              disabled={membership?.role === "viewer"}
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
