import { Box } from "@chakra-ui/react";
import useEventListener from "@use-it/event-listener";
import { useState } from "react";
import { useSlateStatic } from "slate-react";
import { useTextSelection } from "use-text-selection";
import EditorPopover from "../../elements/EditorPopover";
import { Command } from "../../types/slate";
import { insertNewBlock } from "../lib/insertNewBlock";

type ClientRect = NonNullable<
  ReturnType<typeof useTextSelection>["clientRect"]
>;

export function OptionsList({
  commands,
  clientRect,
  search,
  modifier,
}: {
  commands: Command[];
  clientRect: ClientRect;
  search?: string;
  modifier: string;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const editor = useSlateStatic();
  const lastIndex = commands.length - 1;
  const option = commands[selectedIndex];

  useEventListener(
    "keydown",
    (e: KeyboardEvent) => {
      if (["ArrowDown", "ArrowUp", "Enter"].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (e.key === "ArrowDown" && selectedIndex < lastIndex) {
        setSelectedIndex(selectedIndex + 1);
      } else if (e.key === "ArrowDown" && selectedIndex >= lastIndex) {
        setSelectedIndex(0);
      } else if (e.key === "ArrowUp" && selectedIndex > 0) {
        setSelectedIndex(selectedIndex - 1);
      } else if (e.key === "ArrowUp" && selectedIndex <= 0) {
        setSelectedIndex(lastIndex);
      } else if (e.key === "Enter") {
        insertNewBlock(editor, search || "", true);
      }
    },
    document.body
  );

  return (
    <EditorPopover placement="bottom-start">
      <Box
        border="1px solid"
        borderColor="gray.200"
        rounded="lg"
        bg="white"
        overflow="hidden"
      >
        {commands.map((op, index) => (
          <Box
            p={2}
            w={48}
            key={op.key}
            tabIndex={0}
            role="button"
            onMouseDown={() => {
              insertNewBlock(editor, search || "", true);
            }}
            bg={selectedIndex === index ? "gray.100" : "white"}
            sx={{
              cursor: "pointer",
              "&:hover": {
                background: "gray.50",
              },
              "&:focus": {
                bg: "gray.50",
                outline: "none",
              },
            }}
          >
            <Box>
              <div>{op.key}</div>
              <small>{op.description}</small>
            </Box>
          </Box>
        ))}
      </Box>
    </EditorPopover>
  );
}
