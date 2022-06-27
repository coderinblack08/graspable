import {
  Button,
  Group,
  Popover,
  Radio,
  RadioGroup,
  Select,
  Stack,
} from "@mantine/core";
import { formList, useForm } from "@mantine/form";
import { IconPlus, IconSortAscending } from "@tabler/icons";
import React from "react";
import shallow from "zustand/shallow";
import { InferQueryOutput } from "../lib/trpc";
import { useTableStore } from "./useTableStore";

export interface Sort {
  direction: "asc" | "desc";
  columnId: string | null;
}

export const SortPopover: React.FC<{
  columns: InferQueryOutput<"columns.byTableId">;
}> = ({ columns }) => {
  const [opened, setOpened] = React.useState(false);
  const [sorts, setSort] = useTableStore(
    (store) => [store.sorts, store.setSort],
    shallow
  );
  const form = useForm({
    initialValues: {
      sorts: formList(sorts),
    },
  });

  return (
    <Popover
      opened={opened}
      onClose={() => setOpened(false)}
      target={
        <Button
          onClick={() => setOpened(true)}
          leftIcon={<IconSortAscending size={16} />}
          compact
        >
          Sort
        </Button>
      }
      width={360}
      position="bottom"
    >
      <form
        onSubmit={form.onSubmit(({ sorts }) => {
          setSort(sorts.filter((s) => Boolean(s.columnId)) as Sort[]);
          setOpened(false);
        })}
      >
        <Stack>
          {form.values.sorts.map((item, index) => (
            <Stack spacing={8}>
              <Select
                data={columns.map((col) => ({
                  value: col.id,
                  label: col.name,
                }))}
                size="xs"
                placeholder="Select a column"
                {...form.getListInputProps("sorts", index, "columnId")}
              />
              <Group position="apart">
                <RadioGroup
                  size="xs"
                  spacing={8}
                  required
                  {...form.getListInputProps("sorts", index, "direction")}
                >
                  <Radio value="asc" label="Asc." />
                  <Radio value="desc" label="Desc." />
                </RadioGroup>
                <Button
                  onClick={() => form.removeListItem("sorts", index)}
                  color="red"
                  size="xs"
                  compact
                >
                  Delete
                </Button>
              </Group>
            </Stack>
          ))}
          <Group spacing="xs" noWrap>
            <Button
              variant="light"
              color="gray"
              leftIcon={<IconPlus size={16} />}
              size="xs"
              onClick={() =>
                form.addListItem("sorts", { columnId: "", direction: "asc" })
              }
              fullWidth
            >
              Add Condition
            </Button>
            <Button color="gray" size="xs" type="submit" fullWidth>
              Apply
            </Button>
          </Group>
        </Stack>
      </form>
    </Popover>
  );
};
