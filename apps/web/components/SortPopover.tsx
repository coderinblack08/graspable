import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Group,
  Popover,
  SegmentedControl,
  Select,
  Stack,
} from "@mantine/core";
import { IconPlus, IconSortAscending, IconTrash } from "@tabler/icons";
import { Form, Formik } from "formik";
import React from "react";
import { InferQueryOutput, trpc } from "../lib/trpc";
import { AutoSave } from "./AutoSave";

export interface Sort {
  direction: "asc" | "desc";
  columnId: string | null;
}

const SortRow: React.FC<{
  sort: InferQueryOutput<"sorts.byTableId">[0];
  columns: InferQueryOutput<"columns.byTableId">;
  tableId: string;
}> = ({ sort, columns, tableId }) => {
  const updateSort = trpc.useMutation("sorts.update");
  const deleteSort = trpc.useMutation("sorts.delete");
  const utils = trpc.useContext();

  return (
    <Formik
      onSubmit={(values) => {
        updateSort.mutate(values);
      }}
      initialValues={sort}
      enableReinitialize
    >
      {({ values, setFieldValue }) => (
        <Form>
          <Group spacing={8} noWrap>
            <Select
              size="xs"
              onChange={(col) => setFieldValue("columnId", col, false)}
              value={values.columnId}
              placeholder="Column"
              sx={{ width: "100%" }}
              data={columns.map((col) => ({
                label: col.name,
                value: col.id,
              }))}
            />
            <SegmentedControl
              value={values.direction || ""}
              onChange={(dir) => setFieldValue("direction", dir, false)}
              sx={{ flexShrink: 0 }}
              size="xs"
              data={[
                { label: "Asc.", value: "asc" },
                { label: "Desc.", value: "desc" },
              ]}
            />
            <ActionIcon
              variant="light"
              onClick={() => {
                deleteSort.mutate({
                  tableId: sort.tableId,
                  id: sort.id,
                });
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

export const SortPopover: React.FC<{
  columns: InferQueryOutput<"columns.byTableId">;
  tableId: string;
}> = ({ columns, tableId }) => {
  const [opened, setOpened] = React.useState(false);
  const addSort = trpc.useMutation(["sorts.add"]);
  const utils = trpc.useContext();
  const { data: sorts } = trpc.useQuery(["sorts.byTableId", { tableId }]);

  trpc.useSubscription(["sorts.onAdd", { tableId }], {
    onNext(data) {
      utils.setQueryData(["sorts.byTableId", { tableId }], (old) =>
        old ? [...old, data] : [data]
      );
    },
  });
  trpc.useSubscription(["sorts.onUpdate", { tableId }], {
    onNext(data) {
      utils.setQueryData(["sorts.byTableId", { tableId }], (old) =>
        (old || [])?.map((x) => (x.id === data.id ? data : x))
      );
      utils.refetchQueries(["rows.byTableId", { tableId }]);
    },
  });
  trpc.useSubscription(["sorts.onDelete", { tableId }], {
    onNext(data) {
      utils.setQueryData(["sorts.byTableId", { tableId }], (old) =>
        (old || []).filter((f) => f.id !== data.id)
      );
      utils.refetchQueries(["rows.byTableId", { tableId }]);
    },
  });

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
          leftIcon={<IconSortAscending size={16} />}
          rightIcon={
            sorts?.length ? (
              <Badge variant="outline" size="xs">
                {sorts.length}
              </Badge>
            ) : undefined
          }
          compact
        >
          Sort
        </Button>
      }
      width={400}
      position="bottom"
    >
      <Stack spacing={8} m="xs" mb={sorts?.length ? "xs" : 0}>
        {sorts?.map((sort) => (
          <SortRow
            key={sort.id}
            columns={columns}
            sort={sort}
            tableId={tableId}
          />
        ))}
      </Stack>
      <Box mb="xs" mx="xs">
        <Button
          color="dark"
          leftIcon={<IconPlus size={16} />}
          onClick={() =>
            addSort.mutate({ tableId, columnId: null, direction: "asc" })
          }
          size="xs"
          fullWidth
        >
          Add Condition
        </Button>
      </Box>
    </Popover>
  );
};
