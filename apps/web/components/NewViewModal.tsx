import {
  Button,
  Group,
  Modal,
  Select,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  UnstyledButton,
  useMantineTheme,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons";
import { Field, Form, Formik } from "formik";
import React, { useState } from "react";
import { trpc } from "../lib/trpc";

interface NewViewModalProps {
  tableId: string;
}

export const NewViewModal: React.FC<NewViewModalProps> = ({ tableId }) => {
  const [opened, setOpened] = useState(false);
  const { data: columns } = trpc.useQuery(["columns.byTableId", { tableId }]);
  const theme = useMantineTheme();
  const createView = trpc.useMutation(["views.add"]);

  return (
    <>
      <Modal opened={opened} onClose={() => setOpened(false)} title="New View">
        <Formik
          onSubmit={async (values) =>
            createView.mutateAsync(
              { ...values, tableId },
              {
                onSuccess: () => setOpened(false),
              }
            )
          }
          validate={(values) => {
            const errors: Record<string, string> = {};
            if (values.type === "kanban" && !values.kanbanOnColumnId) {
              errors.kanbanOnColumnId = "Required";
            }
            return errors;
          }}
          initialValues={{ name: "", kanbanOnColumnId: "", type: "" as any }}
        >
          {({
            isSubmitting,
            setFieldTouched,
            values,
            errors,
            setFieldValue,
          }) => (
            <Form>
              <Stack>
                <Field
                  size="xs"
                  name="name"
                  label="Name"
                  placeholder="View name"
                  as={TextInput}
                  required
                />
                <Select
                  size="xs"
                  label="Type"
                  placeholder="View type"
                  value={values.type}
                  onChange={(type) => setFieldValue("type", type, false)}
                  data={[
                    { value: "table", label: "Table" },
                    { value: "queue", label: "Queue" },
                    { value: "kanban", label: "Kanban" },
                  ]}
                  required
                />
                {values.type === "kanban" ? (
                  <Select
                    size="xs"
                    label="Dropdown Column"
                    description="Column to use for each group within the kanban board"
                    value={values.kanbanOnColumnId}
                    onChange={(column) =>
                      setFieldValue("kanbanOnColumnId", column, false)
                    }
                    onBlur={() => setFieldTouched("kanbanOnColumnId", true)}
                    error={errors.kanbanOnColumnId}
                    data={(columns || [])
                      .filter((col) => col.type === "dropdown")
                      .map((col) => ({
                        value: col.id,
                        label: col.name,
                      }))}
                    required
                  />
                ) : null}
                <Button loading={isSubmitting} type="submit" size="xs">
                  Create View
                </Button>
              </Stack>
            </Form>
          )}
        </Formik>
      </Modal>
      <UnstyledButton
        onClick={() => setOpened(true)}
        p="6px"
        sx={{
          display: "block",
          width: "100%",
          borderRadius: theme.radius.sm,
        }}
      >
        <Group spacing={10}>
          <ThemeIcon size="md" color="gray">
            <IconPlus size={16} />
          </ThemeIcon>
          <Text weight={500} color="dimmed" size="md">
            New View
          </Text>
        </Group>
      </UnstyledButton>
    </>
  );
};
