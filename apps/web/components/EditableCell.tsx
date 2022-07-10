import useWindowFocus from "use-window-focus";
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
import { useHover } from "@mantine/hooks";
import { format } from "date-fns";
import { useAtom } from "jotai";
import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useMemo } from "react";
import { useDebouncedCallback } from "use-debounce";
import { InferQueryOutput, trpc } from "../lib/trpc";
import { RichTextEditor } from "./RichTextEditor";
import { activeCellAtom } from "./useActiveCellStore";

function getTextFromHTMLString(html: string) {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || "";
}

export const EditableCell = (
  workspaceId: string,
  tableId: string,
  columns: InferQueryOutput<"columns.byTableId">,
  rows: InferQueryOutput<"rows.byTableId">
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
    const [activeCell, setActiveCell] = useAtom(activeCellAtom);
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
      () =>
        activeCell.cell.columnId === columnId &&
        activeCell.cell.rowId === rowId,
      [activeCell, columnId, rowId]
    );
    const windowFocused = useWindowFocus();
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
        setRichTextModalOpened(!richTextModalOpened);
      } else {
        setToggle(!toggle);
      }
    }

    const debouncedUpdateActiveCell = useCallback(
      (activeCell: { columnId: string; rowId: string }) => {
        setTimeout(() => {
          setActiveCell((base) => {
            base.cell = activeCell;
            return base;
          });
        }, 0);
      },
      [setActiveCell]
    );

    useEffect(() => {
      if (!toggle) {
        ref.current?.focus();
        ref.current?.click();
      }
    }, [toggle]);

    const { hovered, ref: hoverRef } = useHover();
    const [selectMenuOpened, setSelectMenuOpened] = React.useState(false);

    function handleArrowDown() {
      const activeColumnIndex = columns.findIndex((x) => x.id === columnId);
      const ref = hoverRef.current.parentElement?.parentElement?.parentElement
        ?.nextElementSibling?.children[0].children[
        activeColumnIndex + (membership?.role === "viewer" ? 0 : 1)
      ].children[0] as any;
      if (ref) ref.focus();
      const activeRowIndex = rows.findIndex((x) => x.id === rowId);

      debouncedUpdateActiveCell({
        columnId,
        rowId: rows[Math.min(rows.length - 1, activeRowIndex + 1)].id,
      });

      if (rows.length - 1 === activeRowIndex) {
        hoverRef.current.focus();
      }
    }

    let CellInput;

    switch (column?.type) {
      case "date":
        if (value && Object.hasOwn(value, "seconds")) {
          setValue(value.toDate());
        }
        CellInput = (
          <DatePicker
            ref={ref}
            clearable={false}
            dropdownType="modal"
            onChange={(date) => {
              setValue(date ? date.toDateString() : "");
              setToggle(true);
              debounced();
            }}
            onDropdownOpen={() => {
              setSelectMenuOpened(true);
            }}
            onDropdownClose={() => {
              setToggle(true);
              hoverRef.current.focus();
              setSelectMenuOpened(false);
            }}
            styles={{
              dropdownWrapper: {
                zIndex: 100,
              },
              input: {
                backgroundColor: "transparent",
              },
            }}
            value={value && new Date(value)}
            readOnly={membership?.role === "viewer"}
          />
        );
        break;
      case "checkbox":
        CellInput = (
          <Center style={{ height: "100%" }}>
            <Checkbox
              checked={value ? (value === "true" ? true : false) : false}
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
        break;
      case "number":
        CellInput = (
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
        break;
      case "url":
        CellInput = (
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
        break;
      case "dropdown":
        CellInput = (
          <>
            <Select
              onDropdownOpen={() => {
                setSelectMenuOpened(true);
              }}
              onDropdownClose={() => {
                setSelectMenuOpened(false);
              }}
              color="blue"
              transition="slide-up"
              transitionDuration={80}
              transitionTimingFunction="ease"
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
            />{" "}
          </>
        );
        break;
      default:
        CellInput = (
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
        break;
    }

    return (
      <Box
        ref={hoverRef}
        tabIndex={0}
        className="data-grid-cell"
        onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
          if (
            richTextModalOpened ||
            (selectMenuOpened && column?.type === "date")
          )
            return;
          if (isActive && e.key === "Enter") {
            if (column?.type === "checkbox") {
              if (value === "true") {
                setValue("false");
              } else {
                setValue("true");
              }
              debounced();
            }
            if (column?.type === "checkbox" || !toggle) {
              handleArrowDown();
              setSelectMenuOpened(false);
            }
            toggleInput();
            e.preventDefault();
          }
          if (selectMenuOpened) return;
          if (
            e.key === "Backspace" &&
            document.activeElement === hoverRef.current
          ) {
            setValue("");
            debounced();
          }
          if (
            e.key === "Escape" &&
            // document.activeElement === hoverRef.current.children[0] &&
            ["text", "number", "url"].includes(column?.type!)
          ) {
            toggleInput();
            hoverRef.current.focus();
            e.preventDefault();
          }
          if (e.key === "ArrowLeft" && columns) {
            const ref = hoverRef.current.parentElement?.previousElementSibling
              ?.children[0] as any;
            if (ref) ref.focus();
            const activeColumnIndex = columns.findIndex(
              (x) => x.id === columnId
            );
            debouncedUpdateActiveCell({
              columnId: columns[Math.max(0, activeColumnIndex - 1)].id,
              rowId,
            });
            e.preventDefault();
          }
          if (e.key === "ArrowRight" && columns) {
            const ref = hoverRef.current.parentElement?.nextElementSibling
              ?.children[0] as any;
            if (ref) ref.focus();
            const activeColumnIndex = columns.findIndex(
              (x) => x.id === columnId
            );
            debouncedUpdateActiveCell({
              columnId:
                columns[Math.min(columns.length - 1, activeColumnIndex + 1)].id,
              rowId,
            });
            e.preventDefault();
          }
          if (e.key === "ArrowUp" && columns && rows) {
            const activeColumnIndex = columns.findIndex(
              (x) => x.id === columnId
            );
            const ref = hoverRef.current.parentElement?.parentElement
              ?.parentElement?.previousElementSibling?.children[0].children[
              activeColumnIndex + (membership?.role === "viewer" ? 0 : 1)
            ].children[0] as any;
            if (ref) ref.focus();
            const activeRowIndex = rows.findIndex((x) => x.id === rowId);
            debouncedUpdateActiveCell({
              columnId,
              rowId: rows[Math.max(0, activeRowIndex - 1)].id,
            });
            e.preventDefault();
          }
          if (e.key === "ArrowDown" && columns && rows) {
            handleArrowDown();
            e.preventDefault();
          }
          // function isPrintable(char: string) {
          //   return !/[\x00-\x08\x0E-\x1F\x80-\xFF]/.test(char);
          // }
          // if (
          //   isPrintable(String.fromCharCode(e.keyCode)) &&
          //   document.activeElement === hoverRef.current &&
          //   ["text", "number", "url"].includes(column?.type!)
          // ) {
          //   setValue(String.fromCharCode(e.keyCode));
          //   toggleInput();
          //   debounced();
          //   e.preventDefault();
          // }
        }}
        style={{ height: "100%" }}
        sx={(theme) => ({
          position: "relative",
          zIndex: 50,
          boxShadow: activeCursor
            ? `0 0 0 2px ${theme.colors.red[5]}`
            : isActive && !windowFocused
            ? `0 0 0 2px ${theme.colors.blue[5]}`
            : "none",
          "&:focus, &:focus-within": {
            outline: "none",
            boxShadow: `0 0 0 2px ${theme.colors.blue[5]}`,
          },
        })}
        onClick={() =>
          setActiveCell((base) => {
            base.cell = { columnId, rowId };
            return base;
          })
        }
      >
        <Modal
          size="lg"
          opened={richTextModalOpened}
          onClose={() => setRichTextModalOpened(false)}
          withCloseButton={false}
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
          {CellInput}
        </Box>
      </Box>
    );
  };

  return Cell;
};
