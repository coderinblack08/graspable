import { Text } from "@chakra-ui/react";
import { RenderLeafProps } from "slate-react";

export type EditorLeafProps = {
  attributes: { contentEditable?: boolean };
} & RenderLeafProps;

const EditorLeaf = ({ attributes, children, leaf }: EditorLeafProps) => {
  if (leaf.bold) {
    children = <b>{children}</b>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  if (leaf.strikethrough) {
    children = <s>{children}</s>;
  }

  if (leaf.highlight) {
    children = (
      <Text as="mark" p={1} rounded="lg" bgColor="yellow.100">
        {children}
      </Text>
    );
  }

  return <span {...attributes}>{children}</span>;
};

export default EditorLeaf;
