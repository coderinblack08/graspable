import {
  ActionIcon,
  AppShell,
  Button,
  Center,
  Group,
  Header,
  Menu,
  Stack,
  Tabs,
  Text,
} from "@mantine/core";
import { IconDotsVertical, IconMenu2 } from "@tabler/icons";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { ShareModal } from "../../components/ShareModal";
import { TableTabContent } from "../../components/TableTabContent";
import { WorkspaceDropdown } from "../../components/WorkspaceDropdown";
import { trpc } from "../../lib/trpc";
import DashboardSkeleton from "../../public/dashboard-skeleton.svg";

const WorkspacePage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ id }) => {
  const [tab, setTab] = React.useState(0);
  const createTable = trpc.useMutation(["tables.add"]);
  const updateTable = trpc.useMutation(["tables.update"]);
  const deleteTable = trpc.useMutation(["tables.delete"]);
  const { data: membership, isLoading: isMembershipLoading } = trpc.useQuery([
    "workspace.myMembership",
    { workspaceId: id },
  ]);
  const { data: workspace } = trpc.useQuery(["workspace.byId", { id }]);
  const { data: tables } = trpc.useQuery([
    "tables.byWorkspaceId",
    { workspaceId: id },
  ]);
  const utils = trpc.useContext();

  trpc.useSubscription(["tables.onUpdate", { workspaceId: id }], {
    onNext(data) {
      utils.setQueryData(
        ["tables.byWorkspaceId", { workspaceId: id }],
        (old) => {
          return (old || []).map((t) =>
            t.id === data.id ? { ...t, name: data.name } : t
          );
        }
      );
    },
  });
  trpc.useSubscription(["tables.onAdd", { workspaceId: id }], {
    onNext(data) {
      utils.setQueryData(
        ["tables.byWorkspaceId", { workspaceId: id }],
        (old) => [...(old || []), data]
      );
    },
  });
  trpc.useSubscription(["tables.onDelete", { workspaceId: id }], {
    onNext(data) {
      utils.setQueryData(["tables.byWorkspaceId", { workspaceId: id }], (old) =>
        (old || []).filter((t) => t.id !== data.id)
      );
    },
  });

  const router = useRouter();

  useEffect(() => {
    if (!membership && !isMembershipLoading) {
      router.push("/app");
    }
  }, [isMembershipLoading, membership, router]);

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
            <ActionIcon color="gray">
              <IconMenu2 size={16} />
            </ActionIcon>
            <WorkspaceDropdown includeControl workspace={workspace} />
            <Button
              color="dark"
              variant="default"
              compact
              onClick={() =>
                createTable.mutate(
                  { workspaceId: id },
                  {
                    onSuccess: () => {
                      if (tables) setTab(tables.length);
                    },
                  }
                )
              }
            >
              New Table
            </Button>
            <ShareModal workspaceId={id} />
          </Group>
        </Header>
      }
    >
      <Head>
        <title>Workspace: {workspace?.name}</title>
      </Head>
      {tables && tables.length ? (
        <Tabs
          tabPadding={0}
          styles={(theme) => ({
            tabsListWrapper: {
              backgroundColor: theme.colors.dark[8],
              paddingTop: 8,
              borderBottom: `2px solid ${theme.colors.dark[5]} !important`,
            },
            root: {
              height: "100%",
              display: "flex",
              flexDirection: "column",
            },
            body: { height: "100%" },
          })}
          active={tab}
          onTabChange={(index) => setTab(index)}
        >
          {tables?.map((table, index) => (
            <Tabs.Tab
              sx={{ transition: "none" }}
              label={
                <Group spacing={8}>
                  <Text weight={600}>{table.name}</Text>
                  {membership?.role !== "viewer" && (
                    <Menu
                      control={
                        <ActionIcon
                          component="div"
                          onClick={(e: any) => {
                            e.stopPropagation();
                            e.preventDefault();
                          }}
                          color={tab === index ? "blue" : "gray"}
                        >
                          <IconDotsVertical size={16} />
                        </ActionIcon>
                      }
                    >
                      <Menu.Item disabled>Export CSV</Menu.Item>
                      <Menu.Item
                        onClick={(e: any) => {
                          e.stopPropagation();
                          e.preventDefault();
                          const newTableName = prompt("New table name:");
                          if (newTableName) {
                            updateTable.mutate({
                              name: newTableName,
                              tableId: table.id,
                            });
                          }
                        }}
                      >
                        Rename Table
                      </Menu.Item>
                      <Menu.Item
                        onClick={() =>
                          deleteTable.mutate(
                            { tableId: table.id },
                            {
                              onSuccess: () => setTab(Math.max(0, tab - 1)),
                            }
                          )
                        }
                        color="red"
                      >
                        Delete Table
                      </Menu.Item>
                    </Menu>
                  )}
                </Group>
              }
              key={table.id}
            >
              <TableTabContent tableId={table.id} workspaceId={id} />
            </Tabs.Tab>
          ))}
        </Tabs>
      ) : (
        <Center sx={{ height: "100%" }}>
          <Stack
            align="center"
            sx={(theme) => ({
              color: theme.colors.dark[3],
              userSelect: "none",
            })}
          >
            <Image
              src={DashboardSkeleton}
              alt="Dashboard skeleton placeholder"
            />
            Press new table in the upper left to begin
          </Stack>
        </Center>
      )}
    </AppShell>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: { id: context.query.id },
  };
};

export default WorkspacePage;
