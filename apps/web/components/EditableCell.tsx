import {
  Box,
  Center,
  Checkbox,
  Group,
  Portal,
  Select,
  TextInput,
} from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { useHotkeys, useHover } from "@mantine/hooks";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import React, { useEffect, useMemo } from "react";
import { useDebouncedCallback } from "use-debounce";
import shallow from "zustand/shallow";
import { InferQueryOutput, trpc } from "../lib/trpc";
import { useActiveCellStore } from "./useActiveCellStore";

export const EditableCell = (
  workspaceId: string,
  tableId: string,
  columns?: InferQueryOutput<"columns.byTableId">
) => {
  const Cell: React.FC<any> = ({
    value: initialValue,
    row: { index: rowIndex, id: rowId },
    column: { id: columnId },
    updateMyData,
  }) => {
    const { data: session } = useSession();
    const { data: membership } = trpc.useQuery([
      "workspace.myMembership",
      { workspaceId },
    ]);
    const [activeCell, setActiveCell] = useActiveCellStore(
      (state) => [state.cell, state.setActiveCell],
      shallow
    );
    const ref = React.useRef<HTMLDivElement>(null);
    const { data: cursors } = trpc.useQuery(["cursors.byTableId", { tableId }]);
    const activeCursor = useMemo(
      () =>
        cursors?.find(
          (cursor) =>
            cursor.rowId === rowId &&
            cursor.columnId === columnId &&
            cursor.userId !== session?.user?.id
        ),
      [cursors, rowId, columnId, session?.user?.id]
    );
    const isActive = useMemo(
      () => activeCell.columnId === columnId && activeCell.rowId === rowId,
      [activeCell, columnId, rowId]
    );
    const [value, setValue] = React.useState(initialValue);
    const [toggle, setToggle] = React.useState(true);
    const debounced = useDebouncedCallback(() => {
      updateMyData(rowIndex, columnId, value);
      console.log("INFO: data-grid synched to database");
    }, 800);

    useEffect(() => {
      setValue(initialValue);
    }, [initialValue]);

    const column = columns?.find((x) => x.id === columnId);
    const styles = {
      input: {
        border: "none",
        height: "100%",
        backgroundColor: "transparent",
        borderRadius: 0,
      },
    };

    function toggleInput() {
      setToggle(false);
    }

    useEffect(() => {
      if (!toggle) {
        ref.current?.focus();
        ref.current?.click();
      }
    }, [toggle]);

    useHotkeys([["enter", () => isActive && setToggle(true)]]);
    const { hovered, ref: hoverRef } = useHover();

    return (
      <Box
        ref={hoverRef}
        style={{ height: "100%" }}
        sx={(theme) => ({
          position: "relative",
          zIndex: 50,
          boxShadow: isActive
            ? `0 0 0 2px ${theme.colors.blue[5]}`
            : activeCursor
            ? `0 0 0 2px ${theme.colors.red[5]}`
            : "none",
        })}
        onClick={() => setActiveCell(rowId, columnId)}
      >
        {activeCursor && hovered ? (
          <Portal zIndex={50}>
            <Box
              sx={(theme) => {
                if (hoverRef.current) {
                  const { left, top } =
                    hoverRef.current.getBoundingClientRect();
                  return {
                    position: "fixed",
                    left: left - 2,
                    top: top - 17,
                    backgroundColor: theme.colors.red[5],
                    color: "white",
                    fontWeight: 700,
                    fontSize: 10,
                    padding: "0px 4px",
                  };
                }
                return {};
              }}
            >
              {activeCursor.user?.name}
            </Box>
          </Portal>
        ) : null}
        <Group
          sx={{ height: "100%", userSelect: "none" }}
          px={12}
          hidden={!toggle || column?.type === "checkbox"}
          onDoubleClick={toggleInput}
        >
          {(() => {
            switch (column?.type) {
              case "date":
                return value ? format(new Date(value), "MMMM d, yyyy") : "";
              default:
                return value;
            }
          })()}
        </Group>
        <Box
          hidden={column?.type !== "checkbox" && toggle}
          sx={{ height: "100%" }}
        >
          {(() => {
            switch (column?.type) {
              case "date":
                if (value && Object.hasOwn(value, "seconds")) {
                  setValue(value.toDate());
                }
                return (
                  <DatePicker
                    ref={ref}
                    dropdownType="modal"
                    onChange={(date) => {
                      setValue(date ? date.toDateString() : "");
                      setToggle(true);
                      debounced();
                    }}
                    onDropdownClose={() => setToggle(true)}
                    styles={styles}
                    value={value && new Date(value)}
                  />
                );
              case "checkbox":
                return (
                  <Center style={{ height: "100%" }}>
                    <Checkbox
                      checked={
                        value ? (value === "true" ? true : false) : false
                      }
                      onChange={
                        membership?.role !== "viewer"
                          ? (event) => {
                              setValue(event.currentTarget.checked.toString());
                              debounced();
                            }
                          : undefined
                      }
                    />
                  </Center>
                );
              case "number":
                return (
                  <TextInput
                    type="number"
                    ref={ref}
                    onBlur={() => setToggle(true)}
                    value={value || ""}
                    onChange={
                      membership?.role !== "viewer"
                        ? (e) => {
                            setValue(e.target.value);
                            debounced();
                          }
                        : undefined
                    }
                    styles={styles}
                  />
                );
              case "url":
                return (
                  <TextInput
                    type="url"
                    ref={ref}
                    onBlur={() => setToggle(true)}
                    styles={styles}
                    value={value || ""}
                    onChange={
                      membership?.role !== "viewer"
                        ? (e) => {
                            setValue(e.target.value);
                            debounced();
                          }
                        : undefined
                    }
                  />
                );
              case "dropdown":
                return (
                  <Select
                    color="blue"
                    styles={styles}
                    value={value}
                    ref={ref}
                    onBlur={() => setToggle(true)}
                    onChange={
                      membership?.role !== "viewer"
                        ? (value) => {
                            setValue(value);
                            debounced();
                          }
                        : undefined
                    }
                    data={
                      column.dropdownOptions?.map((x) => ({
                        label: x,
                        value: x,
                      })) || []
                    }
                  />
                );
              default:
                return (
                  <TextInput
                    styles={styles}
                    value={value || ""}
                    ref={ref}
                    onBlur={() => setToggle(true)}
                    onChange={
                      membership?.role !== "viewer"
                        ? (e) => {
                            setValue(e.target.value);
                            debounced();
                          }
                        : undefined
                    }
                  />
                );
            }
          })()}
        </Box>
      </Box>
    );
  };

  return Cell;
};
