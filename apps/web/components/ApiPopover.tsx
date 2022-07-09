import { Prism } from "@mantine/prism";
import {
  Box,
  Button,
  Divider,
  Drawer,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { IconCode } from "@tabler/icons";
import React, { useMemo, useState } from "react";
import { v4 } from "uuid";

interface ApiPopoverProps {}

export const ApiPopover: React.FC<ApiPopoverProps> = ({}) => {
  const [opened, setOpened] = useState(false);
  const API_KEY = useMemo(() => v4(), []);
  const clipboard = useClipboard({ timeout: 500 });

  return (
    <>
      <Button
        onClick={() => setOpened(true)}
        leftIcon={<IconCode size={16} />}
        variant="outline"
        compact
      >
        API
      </Button>
      <Drawer
        position="right"
        opened={opened}
        onClose={() => setOpened(false)}
        padding="xl"
        size="xl"
      >
        <TextInput
          label="API Key"
          value={API_KEY}
          description="Don't share this with anyone"
          rightSectionWidth={clipboard.copied ? 76 : 64}
          rightSection={
            <Button
              compact
              color="dark"
              onClick={() => clipboard.copy(API_KEY)}
            >
              {clipboard.copied ? "Copied" : "Copy"}
            </Button>
          }
          readOnly
        />
        <Divider
          my={36}
          sx={(theme) => ({ borderColor: theme.colors.dark[5] })}
        />
        <Stack spacing="xl">
          <Box>
            <Title order={4}>Fetch Tables</Title>
            <Prism language="bash" mt="xs">
              {`curl -I 'https://graspable.com/api/tables/<workspace-id>'
                    -H "Authorization: Bearer <api-key>"`}
            </Prism>
          </Box>
          <Box>
            <Title order={4}>Get Table</Title>
            <Prism language="bash" mt="xs">
              {`curl -I 'https://graspable.com/api/tables/<table-id>'
                    -H "Authorization: Bearer <api-key>"`}
            </Prism>
          </Box>
          <Box>
            <Title order={4}>Export CSV</Title>
            <Prism language="bash" mt="xs">
              {`curl -I 'https://graspable.com/api/tables/<table-id>/csv'
                    -H "Authorization: Bearer <api-key>"`}
            </Prism>
          </Box>
          <Box>
            <Title order={4}>Add Row</Title>
            <Prism language="bash" mt="xs">
              {`curl -X POST 'https://graspable.com/api/tables/<table-id>/csv'
                    -H "Authorization: Bearer <api-key>"
                    -H "Content-Type: application/json"
                    -d '<your-data>'`}
            </Prism>
          </Box>
        </Stack>
      </Drawer>
    </>
  );
};
