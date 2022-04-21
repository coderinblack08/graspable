import { Box, HStack, Icon, IconButton } from "@chakra-ui/react";
import { IconBold, IconItalic, IconUnderline } from "@tabler/icons";
import EditorPopover from "./EditorPopover";

export default function HoveringToolbar() {
  return (
    <EditorPopover placement="top">
      <HStack
        bg="white"
        p={1}
        rounded="lg"
        border="1px solid"
        borderColor="gray.200"
        shadow="lg"
      >
        <IconButton
          aria-label="Bold"
          variant="ghost"
          icon={<Icon color="gray.500" as={IconBold} boxSize={4} />}
          size="xs"
        />
        <IconButton
          aria-label="Bold"
          variant="ghost"
          icon={<Icon color="gray.500" as={IconItalic} boxSize={4} />}
          size="xs"
        />
        <IconButton
          aria-label="Bold"
          variant="ghost"
          icon={<Icon color="gray.500" as={IconUnderline} boxSize={4} />}
          size="xs"
        />
      </HStack>
    </EditorPopover>
  );
}
