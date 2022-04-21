import { BaseEditor, Element } from "slate";
import { ReactEditor } from "slate-react";

type CustomElement = { type: string; children: CustomText[] };
type CustomText = { text: string; placeholder?: boolean };

export enum ElementType {
  Paragraph = "paragraph",
  Heading = "heading",
  ListItem = "list-item",
  BulletedList = "bulleted-list",
  NumberedList = "numbered-list",
  Blockquote = "block-quote",
  CodeBlock = "code-block",
  Image = "image",
}

export enum Mark {
  Bold = "bold",
  Italic = "italic",
  Code = "code",
  Underline = "underline",
  Strikethrough = "strikethrough",
  Highlight = "highlight",
}

export const isReferenceableBlockElement = (element: Element): boolean => {
  return (
    element.type === ElementType.Paragraph ||
    element.type === ElementType.Heading ||
    element.type === ElementType.ListItem ||
    element.type === ElementType.Blockquote ||
    element.type === ElementType.CodeBlock ||
    element.type === ElementType.Image
  );
};

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}
