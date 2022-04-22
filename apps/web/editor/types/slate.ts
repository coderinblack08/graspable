import { BaseEditor, BaseElement, Element } from "slate";
import { ReactEditor } from "slate-react";
import { EditableProps } from "slate-react/dist/components/editable";

type CustomElement = { type: ElementType; children: CustomText[] };
type CustomText = { text: string } & Partial<Record<Mark, boolean>>;

export enum ElementType {
  Paragraph = "paragraph",
  Heading = "heading",
  ListItem = "list-item",
  BulletedList = "bulleted-list",
  NumberedList = "numbered-list",
  Blockquote = "blockquote",
  CodeBlock = "codeblock",
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

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

export type SlatePluginProps = {
  commands: Command[];
  editableProps: EditableProps;
  Outside: React.MemoExoticComponent<() => JSX.Element>;
};

export type Command = {
  key: ElementType;
  description: string;
  request?: (props?: { search?: string }) => Promise<unknown>;
};
