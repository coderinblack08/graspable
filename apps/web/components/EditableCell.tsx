import {
  Box,
  Center,
  Checkbox,
  Group,
  Modal,
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
import { RichTextEditor } from "./RichTextEditor";
import { useActiveCellStore } from "./useActiveCellStore";

function getTextFromHTMLString(html: string) {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || "";
}

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
    const ref = React.useRef<any>(null);
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
    const [prev, setPrev] = React.useState(initialValue);
    const [toggle, setToggle] = React.useState(true);
    const debounced = useDebouncedCallback(() => {
      if (value !== prev) {
        updateMyData(rowIndex, columnId, value);
        setPrev(value);
      }
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

    const [richTextModalOpened, setRichTextModalOpened] = React.useState(false);
    function toggleInput() {
      if (column?.type === "richtext") {
        setRichTextModalOpened(true);
      } else {
        setToggle(false);
      }
    }

    useEffect(() => {
      if (!toggle) {
        ref.current?.focus();
        ref.current?.click();
      }
    }, [toggle]);

    useHotkeys([
      [
        "Enter",
        () => {
          if (
            document.activeElement === document.body &&
            !richTextModalOpened &&
            isActive &&
            membership?.role !== "viewer"
          )
            toggleInput();
        },
      ],
    ]);

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
        <Modal
          size="lg"
          opened={richTextModalOpened}
          onClose={() => setRichTextModalOpened(false)}
        >
          <RichTextEditor
            onChange={(text) => {
              setValue(text);
              debounced();
            }}
            value={value}
          />
        </Modal>
        {activeCursor && hovered ? (
          <Portal zIndex={50}>
            <Box
              sx={(theme) => {
                if (hoverRef.current) {
                  const { left, top } =
                    hoverRef.current.getBoundingClientRect();
                  return {
                    position: "fixed",
                    borderTopLeftRadius: 4,
                    borderTopRightRadius: 4,
                    left: left - 2,
                    top: top - 17,
                    backgroundColor: theme.colors.red[5],
                    color: "white",
                    fontWeight: 700,
                    fontSize: 10,
                    padding: "0px 6px",
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
          sx={{
            height: "38px",
            userSelect: "none",
            padding: 8,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          px={12}
          hidden={!toggle || column?.type === "checkbox"}
          onDoubleClick={membership?.role !== "viewer" ? toggleInput : () => {}}
        >
          {(() => {
            switch (column?.type) {
              case "date":
                return value ? format(new Date(value), "MMMM d, yyyy") : "";
              case "richtext":
                return getTextFromHTMLString(value);
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
                    readOnly={membership?.role === "viewer"}
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
                      readOnly={membership?.role === "viewer"}
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
                    readOnly={membership?.role === "viewer"}
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
                    readOnly={membership?.role === "viewer"}
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
                    readOnly={membership?.role === "viewer"}
                    allowDeselect
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
                    readOnly={membership?.role === "viewer"}
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
