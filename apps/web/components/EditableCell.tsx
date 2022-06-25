import {
  Center,
  Checkbox,
  NumberInput,
  Select,
  TextInput,
} from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import React, { useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";
import { InferQueryOutput } from "../lib/trpc";

export const EditableCell = (
  columns?: InferQueryOutput<"columns.byTableId">
) => {
  const Cell: React.FC<any> = ({
    value: initialValue,
    row: { index: rowIndex, id: _rowId },
    column: { id: columnId },
    updateMyData,
  }) => {
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
              onChange={(date) => {
                setValue(date ? date.toDateString() : "");
                debounced();
              }}
              styles={styles}
              value={value && new Date(value)}
            />
          </>
        );
      case "checkbox":
        return (
          <Center style={{ height: "100%" }}>
            <Checkbox
              checked={!!value}
              onChange={(event) => {
                setValue(event.currentTarget.checked);
                debounced();
              }}
            />
          </Center>
        );
      case "number":
        return (
          <TextInput
            type="number"
            value={value || ""}
            onChange={(e) => {
              setValue(e.target.value);
              debounced();
            }}
            styles={styles}
          />
        );
      case "url":
        return (
          <TextInput
            type="url"
            styles={styles}
            value={value || ""}
            onChange={(e) => {
              setValue(e.target.value);
              debounced();
            }}
          />
        );
      case "dropdown":
        return (
          <Select
            color="blue"
            styles={styles}
            value={value}
            onChange={(value) => {
              setValue(value);
              debounced();
            }}
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
            onChange={(e) => {
              setValue(e.target.value);
              debounced();
            }}
          />
        );
    }
  };

  return Cell;
};
