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
      <DataGrid workspaceId={workspaceId} tableId={tableId} />
    </Box>
  );
};
