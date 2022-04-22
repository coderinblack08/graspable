import { isHotkey } from "is-hotkey";
import { Box, Kbd, Text } from "@chakra-ui/react";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  createEditor,
  Descendant,
  Editor as SlateEditor,
  Transforms,
} from "slate";
import { withHistory } from "slate-history";
import { Editable, ReactEditor, Slate, withReact } from "slate-react";
import { TitleInput } from "../components/TitleInput";
import { useIsMounted } from "../lib/use-is-mounted";
import { Autocomplete } from "./commands/components/Autocomplete";
import EditorElement from "./elements/EditorElement";
import HoveringToolbar from "./elements/HoveringToolbox";
import withBlockSideMenu from "./plugins/withBlocksSideMenu";
import withVerticalSpacing from "./plugins/withVerticalSpacing";
import { ElementType } from "./types/slate";
import { handleEnter, handleIndent, handleUnindent } from "./formatting";
import withBlockBreakout from "./plugins/withBlockBreakout";
import withCustomDeleteBackward from "./plugins/withCustomDeleteBackward";

export const Editor: React.FC = () => {
  const isMounted = useIsMounted();
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const [toolbarCanBeVisible, setToolbarCanBeVisible] = useState(true);
  const [editor] = useState<SlateEditor>(() =>
    withCustomDeleteBackward(
      withBlockBreakout(withHistory(withReact(createEditor())))
    )
  );
  const [value, setValue] = useState<Descendant[]>([
    {
      type: ElementType.Paragraph,
      children: [{ text: "" }],
    },
  ]);

  const renderElement = useMemo(() => {
    return withBlockSideMenu(withVerticalSpacing(EditorElement), {
      onPress: () => setToolbarCanBeVisible(true),
    });
  }, []);

  const onSlateChange = useCallback((newValue: Descendant[]) => {
    setValue(newValue);
  }, []);

  const hotkeys = useMemo(
    () => [
      {
        hotkey: "tab",
        callback: () => handleIndent(editor),
      },
      {
        hotkey: "shift+tab",
        callback: () => handleUnindent(editor),
      },
      {
        hotkey: "shift+enter",
        callback: () => Transforms.insertText(editor, "\n"),
      },
      {
        hotkey: "mod+enter",
        callback: () => editor.insertBreak(),
      },
    ],
    [editor]
  );

  const onKeyDown = useCallback<React.KeyboardEventHandler<HTMLDivElement>>(
    (event) => {
      // Handle keyboard shortcuts for adding marks
      for (const { hotkey, callback } of hotkeys) {
        if (isHotkey(hotkey, event.nativeEvent)) {
          event.preventDefault();
          callback();
        }
      }
    },
    [hotkeys]
  );

  return (
    <Box h="full">
      <TitleInput editor={editor} ref={titleRef} />
      {/* <pre>{JSON.stringify(value, null, 2)}</pre> */}
      <Slate editor={editor} value={value} onChange={onSlateChange}>
        {toolbarCanBeVisible && ReactEditor.isFocused(editor) && (
          <Autocomplete
            modifier="/"
            commands={[
              {
                key: ElementType.Heading,
                description: "Basic heading",
              },
              {
                key: ElementType.Paragraph,
                description: "Basic text",
              },
              {
                key: ElementType.Blockquote,
                description: "Basic quote",
              },
              {
                key: ElementType.BulletedList,
                description: "Bulleted list",
              },
              {
                key: ElementType.NumberedList,
                description: "Numbered list",
              },
            ]}
          />
        )}
        {toolbarCanBeVisible && <HoveringToolbar />}
        <Editable
          style={{ height: "100%" }}
          renderElement={renderElement}
          placeholder={
            (
              <Text as="span" color="gray.600">
                Type here or press <Kbd>/</Kbd> for commands
              </Text>
            ) as any
          }
          onKeyDown={onKeyDown}
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
