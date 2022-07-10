import {
  ActionIcon,
  Button,
  Modal,
  MultiSelect,
  Select,
  Stack,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconPlus } from "@tabler/icons";
import { atom, useAtom } from "jotai";
import { LexoRank } from "lexorank";
import React from "react";
import { trpc } from "../lib/trpc";

const openedAtom = atom(false);

export const NewColumnPopover: React.FC<{
  lastRank?: string;
  workspaceId: string;
  tableId: string;
}> = ({ tableId, lastRank }) => {
  const addColumn = trpc.useMutation(["columns.add"]);
  const [opened, setOpened] = useAtom(openedAtom);
  const [msData, setMsData] = React.useState<any[]>([]);
  const form = useForm({
    initialValues: {
      name: "",
      type: "" as
        | "number"
        | "text"
        | "richtext"
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
      <ActionIcon onClick={() => setOpened(true)} size="sm">
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
              rank: lastRank
                ? LexoRank.parse(lastRank).genNext().toString()
                : undefined,
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
                { value: "richtext", label: "Richtext" },
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
            <Button type="submit" size="xs" color="blue">
              Create column
            </Button>
          </Stack>
        </form>
      </Modal>
    </>
  );
};
