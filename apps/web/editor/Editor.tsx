import { Box, Kbd } from "@chakra-ui/react";
import React, { useMemo, useRef, useState } from "react";
import { createEditor, Descendant, Editor as SlateEditor, Range } from "slate";
import { withHistory } from "slate-history";
import { Editable, Slate, withReact } from "slate-react";
import { TitleInput } from "../components/TitleInput";
import EditorElement from "./elements/EditorElement";
import withBlockSideMenu from "./plugins/withBlocksSideMenu";

const initialValue: Descendant[] = [
  {
    type: "paragraph",
    children: [{ text: "" }],
  },
];

export const Editor: React.FC = () => {
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const [editor] = useState<SlateEditor>(() =>
    withReact(withHistory(createEditor()))
  );

  const renderElement = useMemo(() => {
    const ElementWithSideMenu = withBlockSideMenu(EditorElement);
    return ElementWithSideMenu;
  }, []);

  return (
    <>
      <TitleInput editor={editor} ref={titleRef} />
      <Slate editor={editor} value={initialValue}>
        <Editable
          renderElement={renderElement}
          placeholder={
            (
              <Box>
                Type here or press <Kbd>/</Kbd> for commands
              </Box>
            ) as any
          }
          onKeyDown={(e) => {
            if (e.key === "ArrowUp") {
              const { selection } = editor as any;
              if (
                Range.isCollapsed(selection) &&
                Range.start(selection).path[0] === 0
              ) {
                titleRef.current?.focus();
              }
            }
          }}
        />
      </Slate>
    </>
  );
};
