import { Button, Input, Popover, Select, Stack } from "@mantine/core";
import { formList, useForm } from "@mantine/form";
import { IconFilter, IconPlus, IconSortAscending } from "@tabler/icons";
import React from "react";
import shallow from "zustand/shallow";
import { InferQueryOutput } from "../lib/trpc";
import { useTableStore } from "./useTableStore";

export interface Filter {
  columnId: string | null;
  value: string | null;
  operation: "equals" | "contains" | "checked" | "unchecked" | null;
}

interface FilterPopoverProps {
  columns: InferQueryOutput<"columns.byTableId">;
}

export const FilterPopover: React.FC<FilterPopoverProps> = ({ columns }) => {
  const [opened, setOpened] = React.useState(false);
  const [filters, setFilters] = useTableStore(
    (store) => [store.filters, store.setFilters],
    shallow
  );
  const form = useForm({
    initialValues: {
      filters: formList(filters),
    },
  });

  return (
    <Popover
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
      width={320}
      position="bottom"
      withArrow
    >
      <form
        onSubmit={form.onSubmit(({ filters }) => {
          setFilters(filters as Filter[]);
          setOpened(false);
        })}
      >
        <Stack>
          {form.values.filters.map((item, index) => (
            <Stack spacing={8}>
              <Select
                data={columns.map((col) => ({
                  value: col.id,
                  label: col.name,
                }))}
                size="xs"
                placeholder="Select a column"
                {...form.getListInputProps("filters", index, "columnId")}
              />
              <Select
                data={[
                  { value: "equals", label: "Equals" },
                  { value: "contains", label: "Contains" },
                  { value: "matches", label: "Matches" },
                  { value: "startsWith", label: "Starts with" },
                  { value: "endsWith", label: "Ends with" },
                  { value: "gt", label: "Greater than" },
                  { value: "lt", label: "Less than" },
                  { value: "checked", label: "Is checked" },
                  { value: "unchecked", label: "Is unchecked" },
                ]}
                size="xs"
                placeholder="Select a column"
                {...form.getListInputProps("filters", index, "operation")}
              />
              <Input
                size="xs"
                placeholder="Value"
                {...form.getListInputProps("filters", index, "value")}
              />
            </Stack>
          ))}
          <Button
            leftIcon={<IconPlus size={16} />}
            size="xs"
            color="gray"
            variant="default"
            onClick={() =>
              form.addListItem("filters", {
                columnId: "",
                operation: null,
                value: "",
              })
            }
            fullWidth
          >
            Add filter column
          </Button>
          <Button color="gray" size="xs" type="submit" fullWidth>
            Apply
          </Button>
        </Stack>
      </form>
    </Popover>
  );
};
