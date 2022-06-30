import {
  Avatar,
  Box,
  Button,
  Group,
  Modal,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { Field, Form, Formik } from "formik";
import React, { useState } from "react";
import { trpc } from "../lib/trpc";

interface ShareModalProps {
  workspaceId: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ workspaceId }) => {
  const [opened, setOpened] = useState(false);
  const createMember = trpc.useMutation(["workspace.addMember"]);
  const { data: members } = trpc.useQuery([
    "workspace.getMembers",
    { workspaceId },
  ]);

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Workspace sharing"
      >
        <Formik
          initialValues={{ email: "", role: "viewer" }}
          onSubmit={(values) => {
            createMember.mutate({
              workspaceId,
              email: values.email,
              role: values.role as any,
            });
          }}
        >
          {({ values, handleSubmit, setFieldValue }) => (
            <Form
              onSubmit={handleSubmit}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit();
                }
              }}
            >
              <Group noWrap align="start" spacing={8}>
                <Field
                  as={TextInput}
                  sx={{ width: "100%" }}
                  name="email"
                  placeholder="Enter user email"
                  error={
                    createMember.error
                      ? createMember.error.data?.code === "CONFLICT"
                        ? "Member already exists"
                        : createMember.error.data?.code === "NOT_FOUND"
                        ? "User doesn't exist"
                        : "Invalid email"
                      : false
                  }
                />
                <Select
                  sx={{ width: 100, flexShrink: 0 }}
                  value={values.role}
                  onChange={(value) => setFieldValue("role", value, true)}
                  data={[
                    { value: "viewer", label: "Viewer" },
                    { value: "editor", label: "Editor" },
                    { value: "owner", label: "Owner", disabled: true },
                  ]}
                />
              </Group>
            </Form>
          )}
        </Formik>
        <Stack my="lg">
          {members?.map((member) => (
            <Group position="apart" key={member.userId}>
              <Group spacing="sm">
                <Avatar color="blue" size="md" />
                <Box>
                  <Text weight="bold">{member.User.name}</Text>
                  <Text color="dimmed">{member.User.email}</Text>
                </Box>
              </Group>
              <Select
                variant="default"
                sx={{ width: 100 }}
                value={member.role}
                data={[
                  { value: "viewer", label: "Viewer" },
                  { value: "editor", label: "Editor" },
                  { value: "owner", label: "Owner", disabled: true },
                ]}
              />
            </Group>
          ))}
        </Stack>
      </Modal>
      <Button
        onClick={() => setOpened(true)}
        color="dark"
        variant="default"
        compact
      >
        Share
      </Button>
    </>
  );
};
