import { Editor, Range } from "slate";

export function autocompleteCommand(editor: Editor) {
  let showAutoComplete = false;
  let search = "";
  let modifier = "";

  if (editor.selection !== null && Range.isCollapsed(editor.selection)) {
    const [_, path] = Editor.node(editor, editor.selection, { depth: 1 });
    const range = Editor.range(
      editor,
      Editor.start(editor, path),
      editor.selection.focus
    );
    const text = Editor.string(editor, range);
    const matches = text.match(/(\/)([^\s]*$)/);
    if (matches !== null) {
      showAutoComplete = true;
      search = matches[2];
      modifier = matches[1];
    }
  }

  return {
    modifier,
    search,
    showAutoComplete,
  };
}
