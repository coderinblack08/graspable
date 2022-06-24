import { Form, Formik } from "formik";
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
                        label={item.column.name}
                        disabled={
                          ![
                            "number",
                            "text",
                            "url",
                            "dropdown",
                            // "tags",
                            "checkbox",
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
                          {item.column.type === "dropdown" &&
                          values.filters[index].operation === "equals" ? (
                            <Select
                              color="blue"
                              size="xs"
                              placeholder="Select a value"
                              name={`filters[${index}].value`}
                              value={values.filters[index].value}
                              onChange={(value) =>
                                value &&
                                setValues({
                                  filters: [
                                    ...values.filters.map((f) =>
                                      f.columnId === item.columnId
                                        ? { ...item, value }
                                        : f
                                    ),
                                  ],
                                })
                              }
                              data={
                                item.column.dropdownOptions?.map((x) => ({
                                  label: x,
                                  value: x,
                                })) || []
                              }
                            />
                          ) : (
                            item.column.type !== "checkbox" && (
                              <Input
                                size="xs"
                                placeholder="Value"
                                name={`filters[${index}].value`}
                                value={values.filters[index].value}
                                onChange={handleChange}
                              />
                            )
                          )}
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
