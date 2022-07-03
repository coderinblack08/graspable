import { ActionIcon, Box, Group, Menu, MenuItem, Text } from "@mantine/core";
import {
  IconCalendarEvent,
  IconCheckbox,
  IconDots,
  IconEdit,
  IconExternalLink,
  IconHash,
  IconLetterA,
  IconList,
  IconTrash,
} from "@tabler/icons";
import React, { useEffect } from "react";
import { Draggable } from "react-beautiful-dnd";
import { HeaderGroup } from "react-table";
import useHover from "react-use-hover";
import { InferQueryOutput, trpc } from "../lib/trpc";
import { useStyles } from "./DataGrid";

type HeaderCellProps = {
  column: HeaderGroup<Record<string, any>>;
  workspaceId: string;
  index: number;
};

export const HeaderCellIcon: React.FC<{
  type: InferQueryOutput<"columns.byTableId">[0]["type"];
}> = ({ type }) => {
  switch (type) {
    case "dropdown":
      return <IconList size={16} />;
    case "checkbox":
      return <IconCheckbox size={16} />;
    case "date":
      return <IconCalendarEvent size={16} />;
    case "number":
      return <IconHash size={16} />;
    case "text":
      return <IconLetterA size={16} />;
    case "url":
      return <IconExternalLink size={16} />;
    default:
      return null;
  }
};

export const HeaderCell: React.FC<HeaderCellProps> = ({
  workspaceId,
  index,
  column,
}) => {
  const { id: columnId } = column;
  const { classes } = useStyles();
  const [isHovering, hoverProps] = useHover();
  const { data: membership } = trpc.useQuery([
    "workspace.myMembership",
    { workspaceId },
  ]);
  const utils = trpc.useContext();
  const deleteColumn = trpc.useMutation(["columns.delete"]);
  const updateColumn = trpc.useMutation(["columns.update"]);
  const [previousWidth, setPreviousWidth] = React.useState(column.width);
  const cellRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (
      column.width !== previousWidth &&
      column.isResizing === false &&
      column.width &&
      column.id !== "selection" &&
      column.id !== "new-column" &&
      cellRef.current
    ) {
      const newWidth = cellRef.current.clientWidth + 2;
      updateColumn.mutate({ id: columnId, width: newWidth });
      setPreviousWidth(column.width);
    }
  }, [column.id, column.isResizing, column.width, columnId, previousWidth]);

  return (
    <Draggable
      isDragDisabled={
        column.id === "selection" ||
        column.id === "new-column" ||
        column.isResizing ||
        membership?.role === "viewer"
      }
      key={column.id}
      index={index}
      draggableId={column.id}
    >
      {(provided, _snapshot) => {
        // let transform = provided.draggableProps.style?.transform;
        // if (snapshot.isDragging && transform) {
        //   // transform = transform.replace(/\(.+\,/, "(0,");
        //   transform = transform.replace(/\,.+\)/, ",0)");
        // }
        // const style = {
        //   ...provided.draggableProps.style,
        //   transform,
        // };
        return (
          <Box ref={provided.innerRef} {...provided.draggableProps}>
            <Box
              ref={cellRef}
              className={classes.cell}
              sx={(theme) => ({
                backgroundColor: theme.colors.dark[7],
                padding: 0,
                fontWeight: 700,
                userSelect: "none",
                height: "100%",
              })}
              {...column.getHeaderProps()}
            >
              <Box p={8} {...hoverProps} {...provided.dragHandleProps}>
                <Group noWrap position="apart" sx={{ minWidth: 0 }}>
                  <Group spacing={8} sx={{ minWidth: 0, width: "100%" }}>
                    <HeaderCellIcon type={column.type} />
                    <Text
                      sx={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {column.render("Header")}
                    </Text>
                  </Group>
                  {column.id !== "selection" &&
                  column.id !== "new-column" &&
                  membership?.role !== "viewer" ? (
                    <Menu
                      transition="rotate-right"
                      sx={{ display: isHovering ? "block" : "none" }}
                      control={
                        <ActionIcon size="xs" variant="light">
                          <IconDots size={16} />
                        </ActionIcon>
                      }
                    >
                      <MenuItem
                        icon={<IconEdit size={14} />}
                        onClick={() => {
                          const newColumnName =
                            window.prompt("New column name:");
                          if (newColumnName) {
                            updateColumn.mutate(
                              { id: columnId, name: newColumnName },
                              {
                                onSuccess: () => {
                                  utils.setQueryData(
                                    [
                                      "columns.byTableId",
                                      { tableId: column.tableId! },
                                    ],
                                    (old) =>
                                      (old || []).map((c) =>
                                        c.id === columnId
                                          ? { ...c, name: newColumnName }
                                          : c
                                      )
                                  );
                                },
                              }
                            );
                          }
                        }}
                      >
                        Rename Column
                      </MenuItem>
                      <Menu.Item
                        color="red"
                        icon={<IconTrash size={14} />}
                        onClick={() => {
                          deleteColumn.mutate({ id: columnId });
                        }}
                      >
                        Delete Column
                      </Menu.Item>
                    </Menu>
                  ) : null}
                </Group>
              </Box>
              {column?.canResize && (
                <div
                  {...column.getResizerProps()}
                  className={`${classes.resizer} ${
                    column.isResizing ? "isResizing" : ""
                  }`}
                />
              )}
            </Box>
          </Box>
        );
      }}
    </Draggable>
  );
};
