import {
  Box,
  Code,
  Heading,
  ListItem,
  OrderedList,
  Text,
  UnorderedList,
} from "@chakra-ui/react";
import { RenderElementProps } from "slate-react";
import { ElementType } from "../types/slate";

export default function EditorElement(props: RenderElementProps) {
  const { children, attributes, element } = props;

  switch (element.type) {
    case ElementType.Heading:
      return (
        <Heading as="h1" fontSize="3xl" {...attributes}>
          {children}
        </Heading>
      );
    case ElementType.ListItem:
      return <ListItem {...attributes}>{children}</ListItem>;
    case ElementType.BulletedList:
      return <UnorderedList {...attributes}>{children}</UnorderedList>;
    case ElementType.NumberedList:
      return <OrderedList {...attributes}>{children}</OrderedList>;
    case ElementType.Blockquote:
      return (
        <Box
          as="blockquote"
          pl={4}
          borderLeft="4px solid"
          borderColor="gray.200"
          {...attributes}
        >
          {children}
        </Box>
      );
    case ElementType.CodeBlock:
      return (
        <Box as="pre" {...attributes}>
          {children}
        </Box>
      );
    default:
      return <Text {...props.attributes}>{children}</Text>;
  }
}
