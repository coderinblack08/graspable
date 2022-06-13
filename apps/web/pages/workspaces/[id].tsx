import {
  ActionIcon,
  AppShell,
  Button,
  Divider,
  Group,
  Header,
  Menu,
  Tabs,
  Text,
  Title,
  UnstyledButton,
  useMantineTheme,
} from "@mantine/core";
import {
  IconDotsVertical,
  IconEdit,
  IconMenu2,
  IconShare,
  IconTrash,
} from "@tabler/icons";
import { collection, doc } from "firebase/firestore";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import React from "react";
import { HiChevronDown } from "react-icons/hi";
import {
  useFirestore,
  useFirestoreCollectionData,
  useFirestoreDocDataOnce,
} from "reactfire";
import { TableTabContent } from "../../components/TableTabContent";
import { UserDropdown } from "../../components/UserDropdown";

const WorkspacePage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ id }) => {
  const theme = useMantineTheme();
  const firestore = useFirestore();
  const workspaceRef = doc(firestore, "workspaces", id);
  const tablesRef = collection(firestore, "workspaces", id, "tables");
  const { data: workspace } = useFirestoreDocDataOnce(workspaceRef);
  const { data: tables } = useFirestoreCollectionData(tablesRef, {
    idField: "id",
  });

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
            <Divider sx={{ height: "26px" }} mx={4} orientation="vertical" />
            <Button color="gray" variant="default" compact>
              New Table
            </Button>
            <UserDropdown compact />
          </Group>
        </Header>
      }
    >
      {tables && (
        <Tabs tabPadding={0}>
          {tables?.map((table) => (
            <Tabs.Tab
              label={
                <Group spacing={4}>
                  <Text>{table.name}</Text>
                  <Menu
                    control={
                      <ActionIcon
                        onClick={(e: any) => {
                          e.stopPropagation();
                          e.preventDefault();
                        }}
                        color="blue"
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
