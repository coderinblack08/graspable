import { Box, BoxProps } from "@chakra-ui/react";
import { ComponentType } from "react";
import { RenderElementProps, useSlateStatic } from "slate-react";
import { ElementType } from "../types/slate";

export default function withVerticalSpacing(
  EditorElement: ComponentType<RenderElementProps>
) {
  function WithVerticalSpacingComponent(props: RenderElementProps) {
    const editor = useSlateStatic();
    const elementType = props.element.type;

    // No vertical spacing for inline elements
    if (editor.isInline(props.element)) {
      return <EditorElement {...props} />;
    }

    const getVerticalSpacing = (): BoxProps => {
      if (
        elementType === ElementType.ListItem ||
        elementType === ElementType.BulletedList ||
        elementType === ElementType.NumberedList
      ) {
        return { my: 2 };
      } else if (elementType === ElementType.Heading) {
        return { mb: 3, mt: 8, _first: { mt: 3 } };
      } else {
        return { my: 3 };
      }
    };

    return (
      <Box {...getVerticalSpacing()}>
        <EditorElement {...props} />
      </Box>
    );
  }

  return WithVerticalSpacingComponent;
}
