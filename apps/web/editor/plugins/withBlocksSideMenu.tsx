import { Box, Fade, Flex, Icon, IconButton } from "@chakra-ui/react";
import { IconDotsVertical, IconPlus } from "@tabler/icons";
import { ComponentType, useEffect, useState } from "react";
import { Editor, Path, Range } from "slate";
import { ReactEditor, RenderElementProps, useSlate } from "slate-react";
import { useHover } from "../../lib/use-hover";
import { ElementType } from "../types/slate";

export default function withBlockSideMenu(
  EditorElement: ComponentType<RenderElementProps>,
  { onPress }: { onPress: () => void }
) {
  const ElementWithSideMenu = (props: RenderElementProps) => {
    const { element, children } = props;
    const editor = useSlate();
    const [isOnLine, setIsOnLine] = useState(false);
    const [hoverRef, isHovered] = useHover<HTMLDivElement>();

    useEffect(() => {
      if (editor.selection && Range.isCollapsed(editor.selection)) {
        const path1 = ReactEditor.findPath(editor, element);
        const path2 = Range.end(editor.selection).path;
        const isEmpty = true;
        // children[0].props.text.text === "" && children.length === 1;
        setIsOnLine(isEmpty && Path.isChild(path2, path1));
      } else {
        setIsOnLine(false);
      }
    }, [children, editor, editor.selection, element]);

    if (
      element.type === ElementType.BulletedList ||
      element.type === ElementType.NumberedList
    ) {
      return <EditorElement {...props} />;
    }

    return (
      <Box
        ref={hoverRef}
        pos="relative"
        w="full"
        _before={{
          pos: "absolute",
          content: "''",
          top: 0,
          bottom: 0,
          w: "full",
          right: "100%",
        }}
      >
        <Flex
          left={`${
            (isHovered && isOnLine ? -4 : -2) -
            (element.type === ElementType.ListItem ? 1.5 : 0)
          }rem`}
          top={element.type === ElementType.Heading ? "3px" : 0}
          pos="absolute"
          contentEditable={false}
          userSelect="none"
        >
          <Fade in={isHovered}>
            <IconButton
              ml={isHovered && isOnLine ? 2 : 0}
              display={isHovered ? "flex" : "none"}
              size="xs"
              variant="ghost"
              icon={
                <Icon as={IconDotsVertical} boxSize="18px" color="gray.400" />
              }
              aria-label="More"
            />
          </Fade>
          {isOnLine && (
            <IconButton
              size="xs"
              variant="ghost"
              icon={<Icon as={IconPlus} boxSize="18px" color="gray.400" />}
              onClick={() => {
                onPress();
                Editor.insertText(editor, "/");
                ReactEditor.focus(editor);
              }}
              aria-label="More"
            />
          )}
        </Flex>
        <EditorElement {...props} />
      </Box>
    );
  };
  return ElementWithSideMenu;
}
