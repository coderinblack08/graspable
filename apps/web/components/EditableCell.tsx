import { Center, Checkbox, Select, TextInput } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import React, { useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";
import { InferQueryOutput, trpc } from "../lib/trpc";

export const EditableCell = (
  workspaceId: string,
  columns?: InferQueryOutput<"columns.byTableId">
) => {
  const Cell: React.FC<any> = ({
    value: initialValue,
    row: { index: rowIndex, id: _rowId },
    column: { id: columnId },
    updateMyData,
  }) => {
    const { data: membership } = trpc.useQuery([
      "workspace.myMembership",
      { workspaceId },
    ]);
    const [value, setValue] = React.useState(initialValue);
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

    switch (column?.type) {
      case "date":
        if (value && Object.hasOwn(value, "seconds")) {
          setValue(value.toDate());
        }
        return (
          <>
            <DatePicker
              onChange={
                membership?.role !== "viewer"
                  ? (date) => {
                      setValue(date ? date.toDateString() : "");
                      debounced();
                    }
                  : undefined
              }
              styles={styles}
              value={value && new Date(value)}
            />
          </>
        );
      case "checkbox":
        return (
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
            />
          </Center>
        );
      case "number":
        return (
          <TextInput
            type="number"
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
            onChange={
              membership?.role !== "viewer"
                ? (value) => {
                    setValue(value);
                    debounced();
                  }
                : undefined
            }
            data={
              column.dropdownOptions?.map((x) => ({ label: x, value: x })) || []
            }
          />
        );
      default:
        return (
          <TextInput
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
    }
  };

  return Cell;
};
