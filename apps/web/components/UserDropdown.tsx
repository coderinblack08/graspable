import {
  Menu,
  UnstyledButton,
  Group,
  Avatar,
  Box,
  Divider,
  useMantineTheme,
  Text,
} from "@mantine/core";
import {
  IconChevronRight,
  IconLogout,
  IconSettings,
  IconWallet,
  IconArrowsLeftRight,
  IconTrash,
} from "@tabler/icons";
import React from "react";
import { useUserData } from "../lib/helpers";

interface UserDropdownProps {
  compact?: boolean;
}

export const UserDropdown: React.FC<UserDropdownProps> = ({ compact }) => {
  const { uid, email, name } = useUserData();
  const theme = useMantineTheme();

  return (
    <Menu
      position="right"
      gutter={12}
      control={
        compact ? (
          <UnstyledButton>
            <Avatar color="blue" size="sm" />
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
              <Avatar color="blue" />
              <Box sx={{ flex: 1 }}>
                <Text size="sm" weight={500}>
                  {name}
                </Text>
                <Text color="dimmed" size="xs">
                  {email}
                </Text>
              </Box>
              <IconChevronRight color={theme.colors.gray[6]} size={18} />
            </Group>
          </UnstyledButton>
        )
      }
    >
      <Menu.Label>Application</Menu.Label>
      <Menu.Item icon={<IconLogout size={14} />}>Logout</Menu.Item>
      <Menu.Item icon={<IconSettings size={14} />}>Settings</Menu.Item>
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
  );
};
