import {
  Box,
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
        <Heading
          as="h1"
          fontSize="2xl"
          fontWeight="semibold"
          letterSpacing="-0.01em"
        >
          <span {...attributes}>{children}</span>
        </Heading>
      );
    case ElementType.ListItem:
      return (
        <Box as="li">
          <span {...attributes}>{children}</span>
        </Box>
      );
    case ElementType.BulletedList:
      return (
        <UnorderedList ml={6}>
          <span {...attributes}>{children}</span>
        </UnorderedList>
      );
    case ElementType.NumberedList:
      return (
        <OrderedList ml={6}>
          <span {...attributes}>{children}</span>
        </OrderedList>
      );
    case ElementType.Blockquote:
      return (
        <Box
          as="blockquote"
          pl={4}
          borderLeft="4px solid"
          borderColor="gray.200"
        >
          <span {...attributes}>{children}</span>
        </Box>
      );
    case ElementType.CodeBlock:
      return (
        <Box as="pre">
          <span {...attributes}>{children}</span>
        </Box>
      );
    default:
      return (
        <Text>
          <span {...attributes}>{children}</span>
        </Text>
      );
  }
}
