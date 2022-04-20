import { BaseEditor } from "slate";
import { ReactEditor } from "slate-react";

type CustomElement = { type: string; children: CustomText[] };
type CustomText = { text: string };

export enum ElementType {
  Paragraph = "paragraph",
  Heading = "heading",
  ListItem = "list-item",
  BulletedList = "bulleted-list",
  NumberedList = "numbered-list",
  CheckListItem = "check-list-item",
  Blockquote = "block-quote",
  CodeBlock = "code-block",
  Image = "image",
}

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}
