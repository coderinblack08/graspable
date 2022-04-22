import { Editor, Element as SlateElement, Transforms } from "slate";
import { ReactEditor } from "slate-react";
import { isListType, isTextType } from "../../formatting";
import { ElementType } from "../../types/slate";

const isBlockActive = (
  editor: Editor,
  format: ElementType,
  blockType = "type"
) => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        (n as any)[blockType] === format,
    })
  );

  return !!match;
};

const toggleBlock = (editor: Editor, format: ElementType) => {
  const isActive = isBlockActive(editor, format);
  const isList = isListType(format);

  // Transforms.unwrapNodes(editor, {
  //   match: (n) =>
  //     !Editor.isEditor(n) &&
  //     SlateElement.isElement(n) &&
  //     isListType(n.type) &&
  //     !isTextType(format),
  //   split: true,
  // });
  const continueUnwrappingList = () => {
    const formatIsTextAndNotActive = !isActive && isTextType(format);

    const hasListTypeAbove = Editor.above(editor, {
      match: (n) =>
        !Editor.isEditor(n) && SlateElement.isElement(n) && isListType(n.type),
    });

    return formatIsTextAndNotActive && hasListTypeAbove;
  };

  do {
    Transforms.unwrapNodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) && SlateElement.isElement(n) && isListType(n.type),
      split: true,
    });
  } while (continueUnwrappingList());

  const newProperties = {
    type: isActive
      ? ElementType.Paragraph
      : isList
      ? ElementType.ListItem
      : format,
  };
  Transforms.setNodes<SlateElement>(editor, newProperties);

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

export function insertNewBlock(
  editor: Editor,
  query: string,
  type: ElementType,
  removeQuery?: boolean
) {
  if (removeQuery) {
    Transforms.delete(editor, {
      reverse: true,
      distance: query.length + 1,
    });
  }
  console.log(type);

  toggleBlock(editor, type);
  ReactEditor.focus(editor);
}
