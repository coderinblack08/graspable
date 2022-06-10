import {
  AppShell,
  Avatar,
  Box,
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
import { collection, query } from "firebase/firestore";
import { NextPage } from "next";
import Link from "next/link";
import { useAuth, useFirestore, useFirestoreCollectionData } from "reactfire";
import { NavbarLink } from "../components/NavbarLink";
import { NewWorkspaceModal } from "../components/NewWorkspaceModal";
import { useUserData } from "../lib/helpers";

const AppPage: NextPage = () => {
  const theme = useMantineTheme();
  const { uid, email, name } = useUserData();

  const firestore = useFirestore();
  const auth = useAuth();

  const workspacesRef = query(
    collection(firestore, "workspaces")
    // where("ownerId", "==", uid || null)
  );
  const { data: workspaces } = useFirestoreCollectionData(workspacesRef, {
    idField: "id",
  });

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
              <Menu
                position="right"
                gutter={12}
                control={
                  <UnstyledButton
                    sx={{
                      display: "block",
                      width: "100%",
                      padding: theme.spacing.xs,
                      borderRadius: theme.radius.sm,
                      color:
                        theme.colorScheme === "dark"
                          ? theme.colors.dark[0]
                          : theme.black,
                      "&:hover": {
                        backgroundColor:
                          theme.colorScheme === "dark"
                            ? theme.colors.dark[6]
                            : theme.colors.gray[0],
                      },
                    }}
                  >
                    <Group>
                      <Avatar color="blue" />
                      <Box sx={{ flex: 1 }}>
                        <Text size="sm" weight={500}>
                          {name}
                        </Text>
                        <Text color="dimmed" size="xs">
                          {email}
                        </Text>
                      </Box>
                      <IconChevronRight
                        color={theme.colors.gray[6]}
                        size={18}
                      />
                    </Group>
                  </UnstyledButton>
                }
              >
                <Menu.Label>Application</Menu.Label>
                <Menu.Item icon={<IconLogout size={14} />}>Logout</Menu.Item>
                <Menu.Item icon={<IconSettings size={14} />}>
                  Settings
                </Menu.Item>
                <Menu.Item icon={<IconWallet size={14} />}>Upgrade</Menu.Item>
                <Divider />
                <Menu.Label>Danger zone</Menu.Label>
                <Menu.Item icon={<IconArrowsLeftRight size={14} />}>
                  Transfer my data
                </Menu.Item>
                <Menu.Item color="red" icon={<IconTrash size={14} />}>
                  Delete my account
                </Menu.Item>
              </Menu>
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
                  placement="end"
                  trigger="hover"
                  delay={500}
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
