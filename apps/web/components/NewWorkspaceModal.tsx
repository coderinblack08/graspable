import { Button, Modal, Select, TextInput } from "@mantine/core";
import { useForm } from "@mantine/hooks";
import { httpsCallable } from "firebase/functions";
import React, { useState } from "react";
import { useFunctions } from "reactfire";

interface NewWorkspaceModalProps {}

export const NewWorkspaceModal: React.FC<NewWorkspaceModalProps> = ({}) => {
  const functions = useFunctions();
  const createWorkspace = httpsCallable(functions, "createWorkspace");

  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(false);
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
            setLoading(true);
            await createWorkspace({ name });
            setLoading(false);
            setOpened(false);
          })}
        >
          <TextInput label="Name" required {...form.getInputProps("name")} />
          <Select
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
          <Button loading={loading} type="submit" mt={20} fullWidth>
            Spin it up!
          </Button>
        </form>
      </Modal>
      <Button onClick={() => setOpened(true)}>New Workspace</Button>
    </>
  );
};
