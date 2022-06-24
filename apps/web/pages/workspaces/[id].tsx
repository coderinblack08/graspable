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
  Title,
  UnstyledButton,
} from "@mantine/core";
import {
  IconDotsVertical,
  IconEdit,
  IconMenu2,
  IconShare,
  IconTrash,
} from "@tabler/icons";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Image from "next/image";
import React from "react";
import { HiChevronDown } from "react-icons/hi";
import { TableTabContent } from "../../components/TableTabContent";
import { trpc } from "../../lib/trpc";
import DashboardSkeleton from "../../public/dashboard-skeleton.svg";

const WorkspacePage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ id }) => {
  const [tab, setTab] = React.useState(0);
  const createTable = trpc.useMutation(["tables.add"]);
  const updateTable = trpc.useMutation(["tables.update"]);
  const updateWorkspace = trpc.useMutation(["workspace.update"]);
  const deleteTable = trpc.useMutation(["tables.delete"]);
  const { data: workspace } = trpc.useQuery(["workspace.byId", { id }]);
  const { data: tables } = trpc.useQuery([
    "tables.byWorkspaceId",
    { workspaceId: id },
  ]);
  const utils = trpc.useContext();

  return (
    <AppShell
      padding={0}
      styles={(theme) => ({
        root: {
          display: "flex",
          flexDirection: "column",
          backgroundColor: theme.colors.gray[0],
          overflow: "auto",
          height: "100vh",
        },
        body: { height: "100%" },
      })}
      header={
        <Header height="auto" sx={{ borderColor: "transparent" }} p={8}>
          <Group align="center" spacing={8}>
            <ActionIcon color="gray">
              <IconMenu2 size={16} />
            </ActionIcon>
            <Menu
              transition="rotate-right"
              control={
                <UnstyledButton>
                  <Group spacing={8}>
                    <Title order={6} sx={{ fontWeight: 500 }}>
                      {workspace?.name}
                    </Title>
                    <HiChevronDown size={16} />
                  </Group>
                </UnstyledButton>
              }
            >
              <Menu.Label>Actions</Menu.Label>
              <Menu.Item icon={<IconShare size={14} />}>
                Share workspace
              </Menu.Item>
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
                        id,
                      },
                      {
                        onSuccess: () => {
                          utils.setQueryData(["workspace.all"], (old) => {
                            return (old || []).map((w) =>
                              w.id === id ? { ...w, name: newWorkspaceName } : w
                            );
                          });
                          utils.setQueryData(
                            ["workspace.byId", { id }],
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
              <Menu.Item color="red" icon={<IconTrash size={14} />}>
                Delete workspace
              </Menu.Item>
            </Menu>
            <Button
              color="gray"
              variant="default"
              compact
              onClick={() =>
                createTable.mutate(
                  { workspaceId: id },
                  {
                    onSuccess: () => {
                      utils.refetchQueries([
                        "tables.byWorkspaceId",
                        { workspaceId: id },
                      ]);
                    },
                  }
                )
              }
            >
              New Table
            </Button>
          </Group>
        </Header>
      }
    >
      {tables && tables.length ? (
        <Tabs
          tabPadding={0}
          styles={{
            tabsListWrapper: {
              backgroundColor: "white",
              paddingTop: 8,
            },
            root: {
              height: "100%",
              display: "flex",
              flexDirection: "column",
            },
            body: { height: "100%" },
          }}
          initialTab={tab}
          onTabChange={(index) => setTab(index)}
        >
          {tables?.map((table, index) => (
            <Tabs.Tab
              sx={{ transition: "none" }}
              label={
                <Group spacing={8}>
                  <Text weight={600}>{table.name}</Text>
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
                          updateTable.mutate(
                            {
                              name: newTableName,
                              tableId: table.id,
                            },
                            {
                              onSuccess: () => {
                                utils.setQueryData(
                                  ["tables.byWorkspaceId", { workspaceId: id }],
                                  (old) => {
                                    return (old || []).map((t) =>
                                      t.id === table.id
                                        ? { ...t, name: newTableName }
                                        : t
                                    );
                                  }
                                );
                              },
                            }
                          );
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
                            onSuccess: () => {
                              utils.refetchQueries([
                                "tables.byWorkspaceId",
                                { workspaceId: id },
                              ]);
                            },
                          }
                        )
                      }
                      color="red"
                    >
                      Delete Table
                    </Menu.Item>
                  </Menu>
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
              color: theme.colors.gray[5],
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
