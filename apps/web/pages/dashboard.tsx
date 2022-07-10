import {
  AppShell,
  Box,
  Card,
  Group,
  Input,
  Kbd,
  Navbar,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconDatabase,
  IconLayout,
  IconSearch,
  IconSettings,
  IconTable,
  IconTrash,
  IconUser,
} from "@tabler/icons";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { NavbarLink } from "../components/NavbarLink";
import { NewWorkspaceModal } from "../components/NewWorkspaceModal";
import { UserDropdown } from "../components/UserDropdown";
import { WorkspaceDropdown } from "../components/WorkspaceDropdown";
import { trpc } from "../lib/trpc";

const AppPage: NextPage = () => {
  const theme = useMantineTheme();
  const { data: session } = useSession();
  const { data: workspaces } = trpc.useQuery(["workspace.all"]);
  const mediumScreen = useMediaQuery(
    `(min-width: ${theme.breakpoints.md}px)`,
    false
  );

  return (
    <AppShell
      sx={{ backgroundColor: theme.colors.dark[9] }}
      navbar={
        <Navbar
          width={{ base: 300 }}
          height="100vh"
          p="xs"
          sx={(theme) => ({
            borderRight: 0,
            backgroundColor: theme.colors.dark[7],
          })}
        >
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
            <Stack spacing={8}>
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
                    ? theme.colors.dark[5]
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
      <Head>
        <title>Graspable - Dashboard</title>
      </Head>
      <NewWorkspaceModal />
      <SimpleGrid cols={mediumScreen ? 2 : 1} my="md">
        {workspaces?.map((workspace) => (
          <Link
            href="/workspaces/[id]"
            as={`/workspaces/${workspace.id}`}
            key={workspace.id}
            passHref
          >
            <Card
              component="a"
              href="#"
              p="md"
              radius="md"
              shadow="lg"
              sx={(theme) => ({
                backgroundColor: theme.colors.dark[7],
              })}
            >
              <Group position="apart">
                <Box>
                  <Text weight="bold" size="xl">
                    {workspace.name}
                  </Text>
                </Box>
                <WorkspaceDropdown workspace={workspace} />
              </Group>
              <Group spacing="xs" mt={4}>
                <ThemeIcon variant="light" size="xs">
                  <IconUser />
                </ThemeIcon>
                <Text size="sm" style={{ lineHeight: 1.5 }} color="dimmed">
                  Owned by{" "}
                  {workspace.User.id === session?.user.id
                    ? "me"
                    : workspace.User.name}
                </Text>
              </Group>
              <Group spacing="xs">
                <ThemeIcon variant="light" size="xs">
                  <IconTable />
                </ThemeIcon>
                <Text size="sm" style={{ lineHeight: 1.5 }} color="dimmed">
                  {workspace.Table.length} Table
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
