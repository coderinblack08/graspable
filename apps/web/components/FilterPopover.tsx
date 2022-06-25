import { Form, Formik, useField } from "formik";
import {
  Button,
  Checkbox,
  Input,
  Popover,
  Select,
  Stack,
  Tabs,
} from "@mantine/core";
import { IconFilter } from "@tabler/icons";
import React from "react";
import shallow from "zustand/shallow";
import { InferQueryOutput } from "../lib/trpc";
import { useTableStore } from "./useTableStore";

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
}

const FilterValueInput: React.FC<{
  item: {
    columnId: string;
    value: string;
    operation: string;
    column: InferQueryOutput<"columns.byTableId">[0];
  };
  index: number;
}> = ({ item, index }) => {
  const [{ value, onChange }, _, { setValue }] = useField(`filters[${index}]`);
  if (item.column.type === "checkbox") {
    return null;
  }
  if (item.column.type === "dropdown") {
    return (
      <Select
        color="blue"
        size="xs"
        placeholder="Select a value"
        value={value.value}
        onChange={(value) => value && setValue({ ...item, value })}
        data={
          item.column.dropdownOptions?.map((x) => ({ label: x, value: x })) ||
          []
        }
      />
    );
  }
  return (
    <Input
      size="xs"
      placeholder="Value"
      value={value.value}
      type={item.column.type === "number" ? "number" : "text"}
      name={`filters[${index}].value`}
      onChange={onChange}
    />
  );
};

export const FilterPopover: React.FC<FilterPopoverProps> = ({ columns }) => {
  const [opened, setOpened] = React.useState(false);
  const [tab, setTab] = React.useState(0);
  const [filters, setFilters] = useTableStore(
    (store) => [store.filters, store.setFilters],
    shallow
  );
  const ALL_FILTERS = React.useMemo(() => {
    const existingFilters: Record<string, Filter> = {};
    filters.forEach((filter) => {
      existingFilters[filter.columnId] = filter;
    });
    const output = columns.map((c) => ({
      columnId: c.id,
      column: c,
      value: "",
      operation: "",
      ...(existingFilters.hasOwnProperty(c.id) ? existingFilters[c.id] : {}),
    }));
    return output;
  }, [columns, filters]);

  function getOperations(
    type: InferQueryOutput<"columns.byTableId">[0]["type"]
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
    }
  }

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
          compact
        >
          Filter
        </Button>
      }
      width={480}
      position="bottom"
    >
      <Formik
        initialValues={{ filters: ALL_FILTERS }}
        onSubmit={({ filters }) => {
          setFilters(
            filters
              .filter((f) => f.columnId && f.operation)
              .map((f: any) => {
                delete f.column;
                return f;
              }) as Filter[]
          );
          setOpened(false);
        }}
        enableReinitialize
      >
        {({ values, handleChange, setValues }) => (
          <Form>
            <Stack>
              <Tabs
                initialTab={tab}
                onTabChange={(tabIndex) => setTab(tabIndex)}
                styles={{
                  tabsListWrapper: { flexShrink: 0 },
                  body: { width: "100%", paddingRight: 10 },
                }}
                orientation="vertical"
                pt="sm"
              >
                {values.filters.map(
                  (item, index) =>
                    item.column && (
                      <Tabs.Tab
                        key={index}
                        label={item.column.name}
                        disabled={
                          ![
                            "number",
                            "text",
                            "dropdown",
                            "checkbox",
                            // "tags",
                            // "url",
                            // "date",
                          ].includes(item.column.type)
                        }
                      >
                        <Stack spacing={8}>
                          <Select
                            data={getOperations(item.column.type) || []}
                            size="xs"
                            placeholder="Select a operation"
                            name={`filters[${index}].operation`}
                            value={values.filters[index].operation}
                            onChange={(op: any) =>
                              op &&
                              setValues({
                                filters: [
                                  ...values.filters.map((f) =>
                                    f.columnId === item.columnId
                                      ? { ...item, operation: op }
                                      : f
                                  ),
                                ],
                              })
                            }
                          />
                          <FilterValueInput index={index} item={item} />
                          <Button
                            size="xs"
                            variant="default"
                            onClick={() => {
                              setFilters(
                                filters.filter(
                                  (f) => f.columnId !== item.columnId
                                )
                              );
                              setOpened(false);
                            }}
                          >
                            Clear Filter
                          </Button>
                        </Stack>
                      </Tabs.Tab>
                    )
                )}
              </Tabs>
              <Stack spacing="sm" px="sm" pb="sm">
                <Button color="gray" size="xs" type="submit" fullWidth>
                  Apply
                </Button>
              </Stack>
            </Stack>
          </Form>
        )}
      </Formik>
    </Popover>
  );
};
