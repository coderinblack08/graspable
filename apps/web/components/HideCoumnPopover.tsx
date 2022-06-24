import { Button, Checkbox, Group, Popover, Stack } from "@mantine/core";
import { IconEyeOff } from "@tabler/icons";
import React from "react";

export const HideColumnPopover: React.FC<{
  allColumns: any;
}> = ({ allColumns }) => {
  const [opened, setOpened] = React.useState(false);

  return (
    <Popover
      opened={opened}
      onClose={() => setOpened(false)}
      target={
        <Button
          onClick={() => setOpened(true)}
          leftIcon={<IconEyeOff size={16} />}
          compact
        >
          Hide Columns
        </Button>
      }
      width={240}
      position="bottom"
    >
      <Stack spacing={8}>
        {allColumns.map((column: any) =>
          column.id !== "selection" && column.id !== "new-column" ? (
            <div key={column.id}>
              <label>
                <Group spacing={8} sx={{ cursor: "pointer" }}>
                  <Checkbox {...column.getToggleHiddenProps()} />
                  {column.Header}
                </Group>
              </label>
            </div>
          ) : null
        )}
      </Stack>
    </Popover>
  );
};
