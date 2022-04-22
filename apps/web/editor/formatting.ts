import { Node } from "slate";
import { Editor, Element, Path, Transforms } from "slate";
import { ElementType } from "./types/slate";

export const isTextType = (
  type: ElementType
): type is ElementType.Paragraph | ElementType.Heading => {
  return type === ElementType.Paragraph || type === ElementType.Heading;
};

export const isListType = (
  type: ElementType
): type is ElementType.BulletedList | ElementType.NumberedList => {
  return type === ElementType.BulletedList || type === ElementType.NumberedList;
};

// export const toggleMark = (editor: Editor, format: Mark) => {
//   const isActive = isMarkActive(editor, format);

//   if (isActive) {
//     Editor.removeMark(editor, format);
//   } else {
//     Editor.addMark(editor, format, true);
//   }
// };

// export const isMarkActive = (editor: Editor, format: Mark) => {
//   const [match] = Editor.nodes(editor, {
//     match: (n) => Text.isText(n) && n[format] === true,
//     mode: "all",
//   });
//   return !!match;
// };

export const isElementActive = (
  editor: Editor,
  format: ElementType,
  path?: Path
) => {
  const [match] = Editor.nodes(editor, {
    ...(path ? { at: path } : {}),
    match: (n) =>
      !Editor.isEditor(n) && Element.isElement(n) && n.type === format,
  });

  return !!match;
};

export const toggleElement = (
  editor: Editor,
  format: ElementType,
  path?: Path
) => {
  const pathRef = path ? Editor.pathRef(editor, path) : null;
  const isActive = isElementActive(editor, format, path);

  // Returns the current path
  const getCurrentLocation = () => pathRef?.current ?? undefined;

  // If we're switching to a text type element that's not currently active,
  // then we want to fully unwrap the list.
  const continueUnwrappingList = () => {
    // format is text type and is not currently active
    const formatIsTextAndNotActive = !isActive && isTextType(format);

    // there is a list element above the current path/selection
    const hasListTypeAbove = Editor.above(editor, {
      at: getCurrentLocation(),
      match: (n) =>
        !Editor.isEditor(n) && Element.isElement(n) && isListType(n.type),
    });

    return formatIsTextAndNotActive && hasListTypeAbove;
  };

  do {
    Transforms.unwrapNodes(editor, {
      at: getCurrentLocation(),
      match: (n) =>
        !Editor.isEditor(n) && Element.isElement(n) && isListType(n.type),
      split: true,
    });
  } while (continueUnwrappingList());

  let newProperties: Partial<Element>;
  if (isActive) {
    newProperties = { type: ElementType.Paragraph };
  } else if (isListType(format)) {
    newProperties = { type: ElementType.ListItem };
  } else {
    newProperties = { type: format };
  }
  Transforms.setNodes(editor, newProperties, { at: getCurrentLocation() });

  if (!isActive && isListType(format)) {
    const block = {
      type: format,
      children: [],
    };
    Transforms.wrapNodes(editor, block, { at: getCurrentLocation() });
  }
};

export const handleIndent = (editor: Editor) => {
  if (isElementActive(editor, ElementType.BulletedList)) {
    Transforms.wrapNodes(editor, {
      type: ElementType.BulletedList,
      children: [],
    });
  } else if (isElementActive(editor, ElementType.NumberedList)) {
    Transforms.wrapNodes(editor, {
      type: ElementType.NumberedList,
      children: [],
    });
  } else if (isElementActive(editor, ElementType.CodeBlock)) {
    Transforms.insertText(editor, "\t");
  }
};

export const handleUnindent = (editor: Editor) => {
  const { selection } = editor;
  if (!selection) {
    return;
  }

  const ancestors = Node.ancestors(editor, selection.anchor.path);
  let numOfLists = 0;
  for (const [ancestorNode] of ancestors) {
    if (Element.isElement(ancestorNode) && isListType(ancestorNode.type)) {
      numOfLists++;
    }
  }

  // Only unindent if there would be another list above the current node
  if (numOfLists > 1) {
    Transforms.unwrapNodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) && Element.isElement(n) && isListType(n.type),
      split: true,
    });
  }
};

export const handleEnter = (editor: Editor) => {
  if (isElementActive(editor, ElementType.CodeBlock)) {
    Transforms.insertText(editor, "\n");
  } else {
    editor.insertBreak();
  }
};
