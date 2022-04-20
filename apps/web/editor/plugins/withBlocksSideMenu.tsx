import { Box, Fade, Flex, Icon, IconButton, Tooltip } from "@chakra-ui/react";
import { IconDotsVertical, IconPlus } from "@tabler/icons";
import { ComponentType, useEffect, useState } from "react";
import { Path, Range } from "slate";
import { ReactEditor, RenderElementProps, useSlateStatic } from "slate-react";
import { useHover } from "../../lib/use-hover";

export default function withBlockSideMenu(
  EditorElement: ComponentType<RenderElementProps>
) {
  const ElementWithSideMenu = (props: RenderElementProps) => {
    const { element } = props;
    const editor = useSlateStatic();
    const [isOnLine, setIsOnLine] = useState(false);
    const [hoverRef, isHovered] = useHover<HTMLDivElement>();

    useEffect(() => {
      if (editor.selection && Range.isCollapsed(editor.selection)) {
        const path1 = ReactEditor.findPath(editor, element);
        const path2 = Range.end(editor.selection).path;
        setIsOnLine(Path.isChild(path2, path1));
      } else {
        setIsOnLine(false);
      }
    }, [editor.selection, element]);

    return (
      <Box
        ref={hoverRef}
        pos="relative"
        _before={{
          pos: "absolute",
          content: "''",
          top: 0,
          bottom: 0,
          w: "full",
          right: "100%",
        }}
      >
        <Flex left={isHovered && isOnLine ? -16 : -8} pos="absolute">
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
            <Tooltip label={<Box>Insert '/'</Box>}>
              <IconButton
                size="xs"
                variant="ghost"
                icon={<Icon as={IconPlus} boxSize="18px" color="gray.400" />}
                aria-label="More"
              />
            </Tooltip>
          )}
        </Flex>
        <EditorElement {...props} />
      </Box>
    );
  };

  return ElementWithSideMenu;
}
