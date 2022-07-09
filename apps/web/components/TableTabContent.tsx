import { Box } from "@mantine/core";
import React from "react";
import { DataDisplay } from "./DataDisplay";

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
      sx={(_theme) => ({
        height: "100%",
      })}
    >
      <DataDisplay workspaceId={workspaceId} tableId={tableId} />
    </Box>
  );
};
