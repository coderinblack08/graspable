import {
  ActionIcon,
  AppShell,
  Button,
  Group,
  Header,
  Menu,
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
import React from "react";
import { HiChevronDown } from "react-icons/hi";
import { TableTabContent } from "../../components/TableTabContent";
import { trpc } from "../../lib/trpc";

const WorkspacePage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ id }) => {
  const [tab, setTab] = React.useState(0);
  const createTable = trpc.useMutation(["tables.add"]);
  const { data: workspace } = trpc.useQuery(["workspace.byId", { id }]);
  const { data: tables } = trpc.useQuery([
    "tables.byWorkspaceId",
    { workspaceId: id },
  ]);

  return (
    <AppShell
      padding={0}
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
              <Menu.Item icon={<IconEdit size={14} />}>
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
              onClick={() => createTable.mutate({ workspaceId: id })}
            >
              New Table
            </Button>
          </Group>
        </Header>
      }
    >
      {tables && (
        <Tabs tabPadding={0} mt="xs" onTabChange={(index) => setTab(index)}>
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
                    <Menu.Item>Export CSV</Menu.Item>
                    <Menu.Item>Rename Table</Menu.Item>
                    <Menu.Item color="red">Delete Table</Menu.Item>
                  </Menu>
                </Group>
              }
              key={table.id}
            >
              <TableTabContent tableId={table.id} workspaceId={id} />
            </Tabs.Tab>
          ))}
        </Tabs>
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
