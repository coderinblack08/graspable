import { Button, Modal, Select, TextInput } from "@mantine/core";
import { useForm } from "@mantine/hooks";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import React, { useState } from "react";
import { useFirestore } from "reactfire";
import { useUserData } from "../lib/helpers";

interface NewWorkspaceModalProps {}

export const NewWorkspaceModal: React.FC<NewWorkspaceModalProps> = ({}) => {
  const [opened, setOpened] = useState(false);
  const { uid } = useUserData();
  const db = useFirestore();
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
            const { id } = await addDoc(collection(db, "workspaces"), {
              name,
              ownerId: uid,
              createdAt: serverTimestamp(),
            });
            await setDoc(doc(db, "workspaces", id, "members", uid!), {
              role: "owner",
              joinedAt: serverTimestamp(),
            });
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
          <Button type="submit" mt={20} fullWidth>
            Spin it up!
          </Button>
        </form>
      </Modal>
      <Button onClick={() => setOpened(true)}>New Workspace</Button>
    </>
  );
};
