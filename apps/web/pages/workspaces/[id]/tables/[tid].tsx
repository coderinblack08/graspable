import { ActionIcon, Group, Menu, Tabs, Text } from "@mantine/core";
import { IconDotsVertical } from "@tabler/icons";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useMemo } from "react";
import { TableTabContent } from "../../../../components/TableTabContent";
import { WorkspaceLayout } from "../../../../layouts/WorkspaceLayout";
import { trpc } from "../../../../lib/trpc";

const TablePage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ id, tid }) => {
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
  trpc.useSubscription(["workspace.onDeleteMember", { workspaceId: id }], {
    onNext() {
      window.location.reload();
    },
  });

  const router = useRouter();
  const tableIndex = useMemo(
    () => tables?.findIndex((t) => t.id === tid),
    [tables, tid]
  );

  useEffect(() => {
    if (!membership && !isMembershipLoading) {
      router.push("/app");
    }
  }, [isMembershipLoading, membership, router]);

  return (
    <WorkspaceLayout workspace={workspace}>
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
          active={tableIndex}
          onTabChange={(index) =>
            router.push(`/workspaces/${id}/tables/${tables[index].id}`)
          }
        >
          {tables?.map((table) => (
            <Tabs.Tab
              sx={{ transition: "none" }}
              label={
                <Group spacing={8}>
                  <Text weight={600}>{table.name}</Text>
                  {membership?.role !== "viewer" && (
                    <Menu
                      transition="rotate-right"
                      control={
                        <ActionIcon
                          component="div"
                          onClick={(e: any) => {
                            e.stopPropagation();
                            e.preventDefault();
                          }}
                          color={table.id === tid ? "blue" : "gray"}
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
                              onSuccess: () =>
                                router.push(
                                  `/workspaces/${id}/tables/${
                                    tables[Math.max(0, (tableIndex || 0) - 1)]
                                      .id
                                  }`
                                ),
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
              {table.id === tid ? (
                <TableTabContent tableId={tid} workspaceId={id} />
              ) : null}
            </Tabs.Tab>
          ))}
        </Tabs>
      ) : null}
    </WorkspaceLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: { id: context.query.id, tid: context.query.tid },
  };
};

export default TablePage;
