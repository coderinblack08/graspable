import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import {
  ActionIcon,
  Box,
  Divider,
  Group,
  useMantineTheme,
} from "@mantine/core";
import {
  IconArrowBack,
  IconArrowForward,
  IconBold,
  IconCode,
  IconH1,
  IconH2,
  IconH3,
  IconItalic,
  IconLetterP,
  IconList,
  IconListNumbers,
  IconQuote,
  IconStrikethrough,
} from "@tabler/icons";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Write something …",
      }),
    ],
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    autofocus: true,
    content: value,
  });
  const theme = useMantineTheme();

  return editor ? (
    <Box
      sx={{
        border: "1px solid",
        borderColor: theme.colors.dark[5],
        borderRadius: theme.radius.md,
      }}
    >
      <Group
        p="sm"
        spacing={8}
        sx={{
          borderBottom: "1px solid",
          borderColor: theme.colors.dark[5],
        }}
      >
        <ActionIcon
          onClick={() => editor.chain().focus().toggleBold().run()}
          color={editor.isActive("bold") ? "blue" : "gray"}
          variant="filled"
        >
          <IconBold size={16} />
        </ActionIcon>
        <ActionIcon
          onClick={() => editor.chain().focus().toggleItalic().run()}
          color={editor.isActive("italic") ? "blue" : "gray"}
          variant="filled"
        >
          <IconItalic size={16} />
        </ActionIcon>
        <ActionIcon
          onClick={() => editor.chain().focus().toggleStrike().run()}
          color={editor.isActive("strike") ? "blue" : "gray"}
          variant="filled"
        >
          <IconStrikethrough size={16} />
        </ActionIcon>
        <ActionIcon
          onClick={() => editor.chain().focus().toggleCode().run()}
          color={editor.isActive("code") ? "blue" : "gray"}
          variant="filled"
        >
          <IconCode size={16} />
        </ActionIcon>
        <Divider sx={{ height: "24px" }} orientation="vertical" />
        <ActionIcon
          onClick={() => editor.chain().focus().setParagraph().run()}
          color={editor.isActive("paragraph") ? "blue" : "gray"}
          variant="filled"
        >
          <IconLetterP size={16} />
        </ActionIcon>
        <ActionIcon
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          color={editor.isActive("heading", { level: 1 }) ? "blue" : "gray"}
          variant="filled"
        >
          <IconH1 size={16} />
        </ActionIcon>
        <ActionIcon
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          color={editor.isActive("heading", { level: 2 }) ? "blue" : "gray"}
          variant="filled"
        >
          <IconH2 size={16} />
        </ActionIcon>
        <ActionIcon
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          color={editor.isActive("heading", { level: 3 }) ? "blue" : "gray"}
          variant="filled"
        >
          <IconH3 size={16} />
        </ActionIcon>
        <ActionIcon
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          color={editor.isActive("bulletList") ? "blue" : "gray"}
          variant="filled"
        >
          <IconList size={16} />
        </ActionIcon>
        <ActionIcon
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          color={editor.isActive("orderedList") ? "blue" : "gray"}
          variant="filled"
        >
          <IconListNumbers size={16} />
        </ActionIcon>
        <ActionIcon
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          color={editor.isActive("codeBlock") ? "blue" : "gray"}
          variant="filled"
        >
          <IconCode size={16} />
        </ActionIcon>
        <ActionIcon
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          color={editor.isActive("blockquote") ? "blue" : "gray"}
          variant="filled"
        >
          <IconQuote size={16} />
        </ActionIcon>
        <Divider sx={{ height: "24px" }} orientation="vertical" />
        <ActionIcon
          variant="filled"
          onClick={() => editor.chain().focus().undo().run()}
        >
          <IconArrowBack size={16} />
        </ActionIcon>
        <ActionIcon
          variant="filled"
          onClick={() => editor.chain().focus().redo().run()}
        >
          <IconArrowForward size={16} />
        </ActionIcon>
      </Group>
      <EditorContent editor={editor} />
    </Box>
  ) : null;
};
