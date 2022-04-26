import { Box } from "@chakra-ui/react";
import React, { useCallback, useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { Lesson } from "../types";

interface TitleInputProps {
  lesson: Lesson | undefined;
}

export const TitleInput: React.FC<TitleInputProps> = ({ lesson }) => {
  const { register } = useFormContext();
  const ref = useRef<HTMLElement | null>(null);
  const { ref: nameRef, ...rest } = register("name");

  const updateTitleRefHeight = useCallback(() => {
    if (ref.current) {
      ref.current.style.height = "0px";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  }, [ref]);

  useEffect(() => updateTitleRefHeight(), [updateTitleRefHeight]);

  return (
    <Box
      fontSize="4xl"
      lineHeight="none"
      fontWeight="semibold"
      letterSpacing="-0.025em"
      w="full"
      resize="none"
      onKeyDown={(e: any) => {
        if (e.key === "Enter") {
          e.preventDefault();
        }
      }}
      onInput={() => updateTitleRefHeight()}
      _focus={{ outline: "none" }}
      _placeholder={{ color: "gray.300" }}
      placeholder="Untitled"
      as="textarea"
      defaultValue={lesson?.name === "Untitled" ? "" : lesson?.name}
      {...rest}
      name="name"
      ref={(e: any) => {
        nameRef(e);
        ref.current = e;
      }}
    />
  );
};

TitleInput.displayName = "TitleInput";
