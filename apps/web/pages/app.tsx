import {
  AppShell,
  Avatar,
  Box,
  Button,
  Card,
  Divider,
  Group,
  Input,
  Kbd,
  Menu,
  Navbar,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
  UnstyledButton,
  useMantineTheme,
} from "@mantine/core";
import {
  IconArrowsLeftRight,
  IconCalendarEvent,
  IconChevronRight,
  IconDatabase,
  IconEdit,
  IconLayout,
  IconLogout,
  IconSearch,
  IconSettings,
  IconShare,
  IconTable,
  IconTrash,
  IconUser,
  IconWallet,
} from "@tabler/icons";
import { collection, query, where } from "firebase/firestore";
import { NextPage } from "next";
import Link from "next/link";
import { useAuth, useFirestore, useFirestoreCollectionData } from "reactfire";
import { NavbarLink } from "../components/NavbarLink";
import { NewWorkspaceModal } from "../components/NewWorkspaceModal";
import { UserDropdown } from "../components/UserDropdown";
import { useUserData } from "../lib/helpers";
import { Workspace } from "../types";

const AppPage: NextPage = () => {
  const theme = useMantineTheme();
  const { uid } = useUserData();

  const firestore = useFirestore();
  const auth = useAuth();

  const workspacesRef = query(
    collection(firestore, "workspaces"),
    where("ownerId", "==", uid || null)
  );
  const { data: workspaces } = useFirestoreCollectionData<Workspace>(
    workspacesRef as any,
    {
      idField: "id",
    }
  );

  return (
    <AppShell
      sx={{ backgroundColor: theme.colors.gray[0] }}
      navbar={
        <Navbar width={{ base: 300 }} height="100vh" p="xs">
          <Navbar.Section>
            <Title order={5}>Graspable</Title>
          </Navbar.Section>
          <Navbar.Section mt={8} grow>
            <Input
              mb={8}
              icon={<IconSearch size={16} />}
              placeholder="Search"
              rightSectionWidth={56}
              styles={{ rightSection: { pointerEvents: "none" } }}
              rightSection={<Kbd>⌘ + K</Kbd>}
            />
            <Stack spacing={4}>
              <NavbarLink
                icon={<IconDatabase size={16} />}
                color="teal"
                label="Workspaces"
              />
              <NavbarLink
                icon={<IconLayout size={16} />}
                color="blue"
                label="Templates"
              />
              <NavbarLink
                icon={<IconSettings size={16} />}
                color="violet"
                label="Settings"
              />
              <NavbarLink
                icon={<IconTrash size={16} />}
                color="red"
                label="Trash"
              />
            </Stack>
          </Navbar.Section>
          <Navbar.Section>
            <Box
              sx={{
                paddingTop: theme.spacing.sm,
                borderTop: `1px solid ${
                  theme.colorScheme === "dark"
                    ? theme.colors.dark[4]
                    : theme.colors.gray[2]
                }`,
              }}
            >
              <UserDropdown />
            </Box>
          </Navbar.Section>
        </Navbar>
      }
    >
      <NewWorkspaceModal />
      <SimpleGrid cols={2} my="md">
        {workspaces?.map((workspace) => (
          <Link
            href="/workspaces/[id]"
            as={`/workspaces/${workspace.id}`}
            passHref
          >
            <Card
              component="a"
              href="#"
              shadow="xs"
              p="md"
              radius="md"
              key={workspace.id}
            >
              <Group position="apart">
                <Text weight={500} size="xl">
                  {workspace.name}
                </Text>
                <Menu
                  transition="rotate-left"
                  position="bottom"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  placement="end"
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
              </Group>
              <Group spacing="xs">
                <ThemeIcon variant="light" size="xs">
                  <IconUser />
                </ThemeIcon>
                <Text size="sm" style={{ lineHeight: 1.5 }} color="dimmed">
                  Owned by me
                </Text>
              </Group>
              <Group spacing="xs">
                <ThemeIcon variant="light" size="xs">
                  <IconCalendarEvent />
                </ThemeIcon>
                <Text size="sm" style={{ lineHeight: 1.5 }} color="dimmed">
                  Opened just now
                </Text>
              </Group>
              <Group spacing="xs">
                <ThemeIcon variant="light" size="xs">
                  <IconTable />
                </ThemeIcon>
                <Text size="sm" style={{ lineHeight: 1.5 }} color="dimmed">
                  1 Table
                </Text>
              </Group>
            </Card>
          </Link>
        ))}
      </SimpleGrid>
    </AppShell>
  );
};

export default AppPage;