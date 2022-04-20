import { Heading } from "@chakra-ui/react";
import React, { forwardRef, useCallback, useEffect } from "react";
import { Editor as SlateEditor } from "slate";
import { ReactEditor } from "slate-react";

interface TitleInputProps {
  editor: SlateEditor;
}

export const TitleInput = forwardRef<HTMLElement, TitleInputProps>(
  ({ editor }, ref: any) => {
    const updateTitleRefHeight = useCallback(() => {
      if (ref.current) {
        ref.current.style.height = "0px";
        ref.current.style.height = ref.current.scrollHeight + "px";
      }
    }, [ref]);

    useEffect(() => updateTitleRefHeight(), [updateTitleRefHeight]);

    return (
      <Heading
        py={2}
        ref={ref}
        fontSize="4xl"
        fontWeight="semibold"
        letterSpacing="-0.01em"
        w="full"
        resize="none"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            ReactEditor.focus(editor);
          }
          if (e.key == "ArrowDown" && editor) {
            ReactEditor.focus(editor);
          }
        }}
        onInput={() => updateTitleRefHeight()}
        _focus={{ outline: "none" }}
        _placeholder={{ color: "gray.300" }}
        placeholder="Untitled"
        value="Untitled"
        as="textarea"
      />
    );
  }
);

TitleInput.displayName = "TitleInput";
