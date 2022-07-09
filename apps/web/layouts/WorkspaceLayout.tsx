import { ActionIcon, AppShell, Button, Group, Header } from "@mantine/core";
import { IconMenu2 } from "@tabler/icons";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { ShareModal } from "../components/ShareModal";
import { WorkspaceDropdown } from "../components/WorkspaceDropdown";
import { InferQueryOutput, trpc } from "../lib/trpc";

interface WorkspaceLayoutProps {
  workspace?: InferQueryOutput<"workspace.byId">;
  children: React.ReactNode;
}

export const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({
  workspace,
  children,
}) => {
  const createTable = trpc.useMutation(["tables.add"]);
  const router = useRouter();

  return (
    <AppShell
      padding={0}
      styles={(theme) => ({
        root: {
          display: "flex",
          flexDirection: "column",
          backgroundColor: theme.colors.dark[8],
          overflow: "auto",
          height: "100vh",
        },
        body: { height: "100%" },
      })}
      header={
        <Header
          height="auto"
          sx={(theme) => ({
            borderColor: "transparent",
            backgroundColor: theme.colors.dark[8],
          })}
          p={8}
        >
          <Group align="center" spacing={8}>
            <Link href="/app" passHref>
              <ActionIcon color="gray" component="a">
                <IconMenu2 size={16} />
              </ActionIcon>
            </Link>
            <WorkspaceDropdown includeControl workspace={workspace} />
            <Button
              color="dark"
              variant="default"
              compact
              onClick={() =>
                createTable.mutate(
                  { workspaceId: workspace?.id || "" },
                  {
                    onSuccess: (data) => {
                      router.push(
                        `/workspaces/${workspace?.id}/tables/${data.id}`
                      );
                    },
                  }
                )
              }
            >
              New Table
            </Button>
            <ShareModal workspaceId={workspace?.id || ""} />
          </Group>
        </Header>
      }
    >
      {children}
    </AppShell>
  );
};
