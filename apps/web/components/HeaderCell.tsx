import { Box, Group } from "@mantine/core";
import {
  IconCalendarEvent,
  IconCheckbox,
  IconHash,
  IconLetterA,
  IconList,
} from "@tabler/icons";
import React, { useEffect } from "react";
import { Draggable } from "react-beautiful-dnd";
import { HeaderGroup } from "react-table";
import { InferQueryOutput, trpc } from "../lib/trpc";
import { useStyles } from "./DataGrid";

type HeaderCellProps = {
  column: HeaderGroup<Record<string, any>>;
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
    default:
      return null;
  }
};

export const HeaderCell: React.FC<HeaderCellProps> = ({ index, column }) => {
  const { id: columnId } = column;
  const { classes } = useStyles();

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
        column.isResizing
      }
      key={column.id}
      index={index}
      draggableId={column.id}
    >
      {(provided, snapshot) => {
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
              sx={{
                backgroundColor: "white",
                fontWeight: 700,
                userSelect: "none",
                height: "100%",
              }}
              {...column.getHeaderProps()}
            >
              <Group spacing={8} {...provided.dragHandleProps}>
                <HeaderCellIcon type={column.type} />
                <div>{column.render("Header")}</div>
              </Group>
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
