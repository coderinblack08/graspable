import {
  ActionIcon,
  Group,
  Menu,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { useModals } from "@mantine/modals";
import { IconDots, IconEdit, IconTrash } from "@tabler/icons";
import { useRouter } from "next/router";
import React from "react";
import { HiChevronDown } from "react-icons/hi";
import { InferQueryOutput, trpc } from "../lib/trpc";

interface WorkspaceDropdownProps {
  workspace: InferQueryOutput<"workspace.byId"> | undefined;
  includeControl?: boolean;
}

export const WorkspaceDropdown: React.FC<WorkspaceDropdownProps> = ({
  workspace,
  includeControl = false,
}) => {
  const router = useRouter();
  const utils = trpc.useContext();
  const modals = useModals();
  const updateWorkspace = trpc.useMutation(["workspace.update"]);
  const deleteWorkspace = trpc.useMutation(["workspace.delete"]);

  return (
    <Menu
      transition="rotate-right"
      control={
        includeControl ? (
          <UnstyledButton>
            <Group spacing={4}>
              <Title order={6} sx={{ fontWeight: 500 }}>
                {workspace?.name}
              </Title>
              <HiChevronDown size={16} />
            </Group>
          </UnstyledButton>
        ) : (
          <ActionIcon
            color="gray"
            variant="light"
            onClick={(e: any) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            <IconDots size={16} />
          </ActionIcon>
        )
      }
    >
      <Menu.Item
        icon={<IconEdit size={14} />}
        onClick={(e: any) => {
          e.stopPropagation();
          e.preventDefault();
          const newWorkspaceName = prompt("New workspace name:");
          if (newWorkspaceName) {
            updateWorkspace.mutate(
              {
                name: newWorkspaceName,
                id: workspace!.id,
              },
              {
                onSuccess: () => {
                  utils.setQueryData(["workspace.all"], (old) => {
                    return (old || []).map((w) =>
                      w.id === workspace!.id
                        ? { ...w, name: newWorkspaceName }
                        : w
                    );
                  });
                  utils.setQueryData(
                    ["workspace.byId", { id: workspace!.id }],
                    (old) =>
                      old
                        ? {
                            ...old,
                            name: newWorkspaceName,
                          }
                        : ({} as any)
                  );
                },
              }
            );
          }
        }}
      >
        Rename workspace
      </Menu.Item>
      <Menu.Item
        color="red"
        icon={<IconTrash size={14} />}
        onClick={() => {
          modals.openConfirmModal({
            title: "Delete workspace",
            centered: true,
            children: (
              <Text size="sm">
                Are you sure you want to delete this workspace? This action is
                destructive and you will have to contact support to restore your
                data.
              </Text>
            ),
            labels: {
              confirm: "Delete workspace",
              cancel: "No don't delete it",
            },
            confirmProps: { color: "red" },
            onConfirm: () => {
              deleteWorkspace.mutate(
                { id: workspace!.id },
                {
                  onSuccess: () => {
                    utils.invalidateQueries(["workspace.all"]);
                    router.push("/app");
                  },
                }
              );
            },
          });
        }}
      >
        Delete workspace
      </Menu.Item>
    </Menu>
  );
};
