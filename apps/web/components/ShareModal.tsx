import {
  ActionIcon,
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
import { IconTrash } from "@tabler/icons";
import { Field, Form, Formik } from "formik";
import React, { useState } from "react";
import { trpc } from "../lib/trpc";

interface ShareModalProps {
  workspaceId: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ workspaceId }) => {
  const [opened, setOpened] = useState(false);
  const createMember = trpc.useMutation(["workspace.addMember"]);
  const deleteMember = trpc.useMutation(["workspace.deleteMember"]);
  const updateMemberRole = trpc.useMutation(["workspace.updateMemberRole"]);
  const { data: membership } = trpc.useQuery(
    ["workspace.myMembership", { workspaceId }],
    {
      enabled: opened,
    }
  );
  const { data: members } = trpc.useQuery(
    ["workspace.getMembers", { workspaceId }],
    {
      enabled: opened,
    }
  );
  const utils = trpc.useContext();

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Workspace sharing"
      >
        <Formik
          initialValues={{ email: "", role: "viewer" }}
          onSubmit={(values, { resetForm }) => {
            createMember.mutate(
              {
                workspaceId,
                email: values.email,
                role: values.role as any,
              },
              {
                onSuccess: (data) => {
                  utils.setQueryData(
                    ["workspace.getMembers", { workspaceId }],
                    (old) => [...(old || []), data!]
                  );
                  resetForm();
                },
              }
            );
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
                  disabled={membership?.role !== "owner"}
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
                  disabled={membership?.role !== "owner"}
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
        <Stack mt="lg">
          {members?.map((member) => (
            <Group position="apart" key={member.userId}>
              <Group>
                <Avatar src={member.User.image} color="blue" size="md" />
                <Box>
                  <Text weight="bold">{member.User.name}</Text>
                  <Text color="dimmed">{member.User.email}</Text>
                </Box>
              </Group>
              <Group spacing={8}>
                <Select
                  variant="default"
                  disabled={
                    membership?.role !== "owner" || member.role === "owner"
                  }
                  onChange={(value) => {
                    updateMemberRole.mutate(
                      {
                        workspaceId,
                        userId: member.userId,
                        role: value as any,
                      },
                      {
                        onSuccess: (data) => {
                          utils.setQueryData(
                            ["workspace.getMembers", { workspaceId }],
                            (old) =>
                              (old || []).map((m) =>
                                m.userId === member.userId ? data : m
                              )
                          );
                        },
                      }
                    );
                  }}
                  sx={{ width: 100 }}
                  value={member.role}
                  data={[
                    { value: "viewer", label: "Viewer" },
                    { value: "editor", label: "Editor" },
                    { value: "owner", label: "Owner", disabled: true },
                  ]}
                />
                {membership?.role === "owner" && (
                  <ActionIcon
                    onClick={() =>
                      deleteMember.mutate(
                        {
                          workspaceId,
                          userId: member.userId,
                        },
                        {
                          onSuccess: (data) => {
                            utils.setQueryData(
                              ["workspace.getMembers", { workspaceId }],
                              (old) =>
                                (old || []).filter(
                                  (m) => m.userId !== member.userId
                                )
                            );
                          },
                        }
                      )
                    }
                    color="red"
                    variant="light"
                    size="lg"
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                )}
              </Group>
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
