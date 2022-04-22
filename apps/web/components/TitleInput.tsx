import { Heading } from "@chakra-ui/react";
import React, { useCallback, useEffect, useRef } from "react";
import { Lesson } from "../types";

interface TitleInputProps {
  lesson: Lesson | undefined;
}

export const TitleInput: React.FC<TitleInputProps> = ({ lesson }) => {
  const ref = useRef<HTMLElement>(null);

  const updateTitleRefHeight = useCallback(() => {
    if (ref.current) {
      ref.current.style.height = "0px";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  }, [ref]);

  useEffect(() => updateTitleRefHeight(), [updateTitleRefHeight]);

  return (
    <Heading
      ref={ref as any}
      fontSize="4xl"
      fontWeight="semibold"
      letterSpacing="-0.05em"
      w="full"
      resize="none"
      // onKeyDown={(e) => {
      //   if (e.key === "Enter") {
      //     e.preventDefault();
      //     ReactEditor.focus(editor);
      //   }
      //   if (e.key == "ArrowDown" && editor) {
      //     ReactEditor.focus(editor);
      //   }
      // }}
      onInput={() => updateTitleRefHeight()}
      _focus={{ outline: "none" }}
      _placeholder={{ color: "gray.300" }}
      placeholder="Untitled"
      as="textarea"
      defaultValue={lesson?.name === "Untitled" ? "" : lesson?.name}
      onChange={(e: any) => {
        console.log(e.target.value);
      }}
    />
  );
};

TitleInput.displayName = "TitleInput";
