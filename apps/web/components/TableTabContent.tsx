import { Box, ScrollArea } from "@mantine/core";
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
  return (
    <Box
      sx={(theme) => ({
        height: "100%",
      })}
    >
      <DataGrid workspaceId={workspaceId} tableId={tableId} />
    </Box>
  );
};
