import { Box, Kbd, Text } from "@chakra-ui/react";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { createEditor, Descendant, Editor as SlateEditor } from "slate";
import { withHistory } from "slate-history";
import { Editable, ReactEditor, Slate, withReact } from "slate-react";
import { TitleInput } from "../components/TitleInput";
import { useIsMounted } from "../lib/use-is-mounted";
import { Autocomplete } from "./commands/components/Autocomplete";
import EditorElement from "./elements/EditorElement";
import HoveringToolbar from "./elements/HoveringToolbox";
import withBlockSideMenu from "./plugins/withBlocksSideMenu";
import withVerticalSpacing from "./plugins/withVerticalSpacing";

export const Editor: React.FC = () => {
  const isMounted = useIsMounted();
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const [toolbarCanBeVisible, setToolbarCanBeVisible] = useState(true);
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
    return withBlockSideMenu(withVerticalSpacing(EditorElement));
  }, []);

  const onSlateChange = useCallback((newValue: Descendant[]) => {
    setValue(newValue);
  }, []);

  return (
    <Box>
      <TitleInput editor={editor} ref={titleRef} />
      <Slate editor={editor} value={value} onChange={onSlateChange}>
        {toolbarCanBeVisible && ReactEditor.isFocused(editor) && (
          <Autocomplete
            modifier="/"
            commands={[
              {
                key: "heading",
                description: "basic heading",
              },
              {
                key: "paragraph",
                description: "basic text",
              },
            ]}
          />
        )}
        {toolbarCanBeVisible && <HoveringToolbar />}
        <Editable
          renderElement={renderElement}
          placeholder={
            (
              <Text as="span">
                Type here or press <Kbd>/</Kbd> for commands
              </Text>
            ) as any
          }
          onPointerDown={() => setToolbarCanBeVisible(false)}
          onPointerUp={() =>
            setTimeout(() => {
              if (isMounted()) setToolbarCanBeVisible(true);
            }, 100)
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
