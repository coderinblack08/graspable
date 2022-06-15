import { Button, Modal, Select, TextInput } from "@mantine/core";
import { useForm } from "@mantine/hooks";
import React, { useState } from "react";
import { trpc } from "../lib/trpc";

interface NewWorkspaceModalProps {}

export const NewWorkspaceModal: React.FC<NewWorkspaceModalProps> = ({}) => {
  const mutation = trpc.useMutation(["workspace.add"]);
  const utils = trpc.useContext();

  const [opened, setOpened] = useState(false);
  const form = useForm({
    initialValues: {
      name: "",
      template: "Blank Workspace",
    },
  });

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="New Workspace"
      >
        <form
          onSubmit={form.onSubmit(async ({ name, template }) => {
            await mutation.mutateAsync(
              { name },
              {
                onSuccess: () => {
                  utils.invalidateQueries(["workspace.all"]);
                },
              }
            );
            setOpened(false);
          })}
        >
          <TextInput label="Name" required {...form.getInputProps("name")} />
          <Select
            mt={12}
            required
            label="Template"
            data={[
              "Blank Workspace",
              "Project Tracker",
              "Product Catalog",
              "Event Planning",
              "Personal Blog",
            ]}
            {...form.getInputProps("template")}
          />
          <Button loading={mutation.isLoading} type="submit" mt={20} fullWidth>
            Spin it up!
          </Button>
        </form>
      </Modal>
      <Button onClick={() => setOpened(true)}>New Workspace</Button>
    </>
  );
};
