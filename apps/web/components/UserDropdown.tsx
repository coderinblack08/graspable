import {
  Avatar,
  Box,
  Divider,
  Group,
  Menu,
  Text,
  UnstyledButton,
  useMantineTheme,
} from "@mantine/core";
import {
  IconArrowsLeftRight,
  IconChevronRight,
  IconLogout,
  IconSettings,
  IconTrash,
  IconWallet,
} from "@tabler/icons";
import { signOut, useSession } from "next-auth/react";
import React from "react";

interface UserDropdownProps {
  compact?: boolean;
}

export const UserDropdown: React.FC<UserDropdownProps> = ({ compact }) => {
  const { data: session } = useSession();
  const theme = useMantineTheme();

  if (session?.user) {
    return (
      <Menu
        position="right"
        gutter={12}
        control={
          compact ? (
            <UnstyledButton>
              <Avatar color="gray" size="sm" />
            </UnstyledButton>
          ) : (
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
                <Avatar color="gray" />
                <Box sx={{ flex: 1 }}>
                  <Text size="sm" weight={500}>
                    {session.user.name}
                  </Text>
                  <Text color="dimmed" size="xs">
                    {session.user.email}
                  </Text>
                </Box>
                <IconChevronRight color={theme.colors.gray[6]} size={18} />
              </Group>
            </UnstyledButton>
          )
        }
      >
        <Menu.Label>Application</Menu.Label>
        <Menu.Item
          icon={<IconLogout size={14} />}
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
        >
          Logout
        </Menu.Item>
        {/* <Menu.Item icon={<IconSettings size={14} />}>Settings</Menu.Item>
        <Menu.Item icon={<IconWallet size={14} />}>Upgrade</Menu.Item> */}
        <Divider />
        <Menu.Label>Danger zone</Menu.Label>
        {/* <Menu.Item icon={<IconArrowsLeftRight size={14} />}>
          Transfer my data
        </Menu.Item> */}
        <Menu.Item color="red" icon={<IconTrash size={14} />}>
          Delete my account
        </Menu.Item>
      </Menu>
    );
  }

  return null;
};
