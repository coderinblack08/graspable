import { Box, useMantineTheme } from "@mantine/core";
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
    <Box
      sx={(theme) => ({
        backgroundColor: theme.colors.gray[0],
        width: "100%",
        height: "100%",
      })}
    >
      <DataGrid workspaceId={workspaceId} tableId={tableId} />
    </Box>
  );
};
