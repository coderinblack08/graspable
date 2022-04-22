import { HStack, Icon, IconButton } from "@chakra-ui/react";
import {
  IconBold,
  IconCode,
  IconHighlight,
  IconItalic,
  IconStrikethrough,
  IconUnderline,
} from "@tabler/icons";
import { useEffect, useState } from "react";
import { Editor, Range } from "slate";
import { useFocused, useSlate } from "slate-react";
import EditorPopover from "./EditorPopover";

export default function HoveringToolbar() {
  const editor = useSlate();
  const [show, setShow] = useState(false);

  const focused = useFocused();

  useEffect(() => {
    const { selection } = editor;
    if (selection) {
      const hasExpandedSelection =
        !!selection &&
        focused &&
        !Range.isCollapsed(selection) &&
        Editor.string(editor, selection, { voids: true }) !== "";
      setShow(hasExpandedSelection);
    }
  }, [editor, focused, editor.selection]);

  return (
    <EditorPopover placement="top-start">
      {show && (
        <HStack
          spacing={0}
          bg="white"
          overflow="hidden"
          rounded="md"
          border="1px solid"
          borderColor="gray.200"
        >
          <IconButton
            aria-label="Bold"
            rounded="none"
            size="sm"
            variant="ghost"
            // onClick={() => }
            icon={<Icon color="gray.500" as={IconBold} boxSize={4} />}
          />
          <IconButton
            aria-label="Italic"
            variant="ghost"
            icon={<Icon color="gray.500" as={IconItalic} boxSize={4} />}
            rounded="none"
            size="sm"
          />
          <IconButton
            aria-label="Underline"
            variant="ghost"
            icon={<Icon color="gray.500" as={IconUnderline} boxSize={4} />}
            rounded="none"
            size="sm"
          />
          <IconButton
            aria-label="Strikethrough"
            variant="ghost"
            icon={<Icon color="gray.500" as={IconStrikethrough} boxSize={4} />}
            rounded="none"
            size="sm"
          />
          <IconButton
            aria-label="Code"
            variant="ghost"
            icon={<Icon color="gray.500" as={IconCode} boxSize={4} />}
            rounded="none"
            size="sm"
          />
          <IconButton
            aria-label="Highlight"
            variant="ghost"
            icon={<Icon color="gray.500" as={IconHighlight} boxSize={4} />}
            rounded="none"
            size="sm"
          />
        </HStack>
      )}
    </EditorPopover>
  );
}
