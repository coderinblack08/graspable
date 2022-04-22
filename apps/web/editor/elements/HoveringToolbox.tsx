import { HStack, Icon, IconButton } from "@chakra-ui/react";
import {
  IconBold,
  IconCode,
  IconHighlight,
  IconItalic,
  IconStrikethrough,
  IconUnderline,
  TablerIcon,
} from "@tabler/icons";
import { useEffect, useState } from "react";
import { Editor, Range } from "slate";
import { useFocused, useSlate } from "slate-react";
import { isMarkActive, toggleMark } from "../formatting";
import { Mark } from "../types/slate";
import EditorPopover from "./EditorPopover";

function FormatButton({ format, icon }: { format: Mark; icon: TablerIcon }) {
  const editor = useSlate();
  return (
    <IconButton
      as="span"
      role="button"
      aria-label={format}
      onPointerDown={(event) => event.preventDefault()}
      onPointerUp={(event) => {
        if (event.button === 0) {
          event.preventDefault();
          toggleMark(editor, format);
        }
      }}
      rounded="none"
      size="sm"
      variant="ghost"
      icon={
        <Icon
          color={isMarkActive(editor, format) ? "blue.500" : "gray.500"}
          as={icon}
          boxSize={4}
        />
      }
    />
  );
}

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
          <FormatButton icon={IconBold} format={Mark.Bold} />
          <FormatButton icon={IconItalic} format={Mark.Italic} />
          <FormatButton icon={IconUnderline} format={Mark.Underline} />
          <FormatButton icon={IconStrikethrough} format={Mark.Strikethrough} />
          <FormatButton icon={IconCode} format={Mark.Code} />
          <FormatButton icon={IconHighlight} format={Mark.Highlight} />
        </HStack>
      )}
    </EditorPopover>
  );
}
