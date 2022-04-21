import { Box, Kbd, Text } from "@chakra-ui/react";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { createEditor, Descendant, Editor as SlateEditor, Range } from "slate";
import { withHistory } from "slate-history";
import { Editable, Slate, withReact } from "slate-react";
import { TitleInput } from "../components/TitleInput";
import EditorElement from "./elements/EditorElement";
import withBlockSideMenu from "./plugins/withBlocksSideMenu";

export const Editor: React.FC = () => {
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const [editor] = useState<SlateEditor>(() =>
    withHistory(withReact(createEditor()))
  );
  const [value, setValue] = useState<Descendant[]>([
    {
      type: "paragraph",
      children: [{ text: "" }],
    },
  ]);

  const renderElement = useMemo(() => {
    return withBlockSideMenu(EditorElement);
  }, []);

  const [selection, setSelection] = useState(editor.selection);
  const onSlateChange = useCallback(
    (newValue: Descendant[]) => {
      setSelection(editor.selection);
      setValue(newValue);
    },
    [editor.selection]
  );

  return (
    <Box>
      <TitleInput editor={editor} ref={titleRef} />
      <Slate editor={editor} value={value} onChange={onSlateChange}>
        <Editable
          renderElement={renderElement}
          placeholder={
            (
              <Text as="span">
                Type here or press <Kbd>/</Kbd> for commands
              </Text>
            ) as any
          }
          // onKeyDown={(e) => {
          //   if (e.key === "ArrowUp") {
          //     const { selection } = editor as any;
          //     if (
          //       Range.isCollapsed(selection) &&
          //       Range.start(selection).path[0] === 0
          //     ) {
          //       titleRef.current?.focus();
          //     }
          //   }
          // }}
        />
      </Slate>
    </Box>
  );
};
