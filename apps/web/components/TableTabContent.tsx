import { ActionIcon, Box, Button, Group, useMantineTheme } from "@mantine/core";
import {
  IconFilter,
  IconFrame,
  IconLayout,
  IconList,
  IconRobot,
  IconSearch,
  IconSortAscending,
} from "@tabler/icons";
import React from "react";
import { DataGrid } from "./DataGrid";

interface TableTabContentProps {
  workspaceId: string;
  tableId: string;
}

export const TableTabContent: React.FC<TableTabContentProps> = ({
  workspaceId,
  tableId,
}) => {
  const theme = useMantineTheme();

  return (
    <Box>
      <Group
        position="apart"
        p={8}
        sx={{
          borderBottom: "2px solid",
          borderColor: theme.colors.gray[2],
        }}
      >
        <Group spacing={8}>
          {/* <ActionIcon color="blue" variant="outline" size="sm">
            <IconPlus size={16} />
          </ActionIcon> */}
          <Button variant="outline" leftIcon={<IconLayout size={16} />} compact>
            Views
          </Button>
          <Button leftIcon={<IconFilter size={16} />} compact>
            Filter
          </Button>
          <Button leftIcon={<IconFrame size={16} />} compact>
            Group
          </Button>
          <Button leftIcon={<IconSortAscending size={16} />} compact>
            Sort
          </Button>
        </Group>
        <Group spacing={8}>
          <Button leftIcon={<IconList size={16} />} variant="outline" compact>
            Form
          </Button>
          <Button leftIcon={<IconRobot size={16} />} variant="outline" compact>
            Automation
          </Button>
          <ActionIcon color="blue" variant="transparent" size="sm">
            <IconSearch size={16} />
          </ActionIcon>
        </Group>
      </Group>
      <DataGrid workspaceId={workspaceId} tableId={tableId} />
    </Box>
  );
};
