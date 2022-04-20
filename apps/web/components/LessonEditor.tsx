import { Heading } from "@chakra-ui/react";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React, { useEffect, useRef } from "react";
import { Lesson } from "../types";

export const LessonEditor: React.FC<{ lesson: Lesson | null }> = ({
  lesson,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure(),
      Placeholder.configure({
        placeholder: "Write something here...",
      }),
    ],
    content: "<p></p>",
  });
  const titleRef = useRef<HTMLTextAreaElement>(null);

  const updateTitleRefHeight = () => {
    if (titleRef.current) {
      titleRef.current.style.height = "0px";
      titleRef.current.style.height = titleRef.current.scrollHeight + "px";
    }
  };

  useEffect(() => updateTitleRefHeight(), []);

  return (
    <>
      <Heading
        ref={titleRef as any}
        fontSize="4xl"
        fontWeight="semibold"
        letterSpacing="-0.01em"
        w="full"
        resize="none"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            editor?.commands.focus();
          }
          if (e.key == "ArrowDown" && editor) editor.commands.focus();
        }}
        onInput={() => updateTitleRefHeight()}
        _focus={{ outline: "none" }}
        _placeholder={{ color: "gray.300" }}
        placeholder="Untitled"
        value={lesson?.name === "Untitled" ? "" : lesson?.name}
        as="textarea"
      />
      <EditorContent editor={editor} />
    </>
  );
};
