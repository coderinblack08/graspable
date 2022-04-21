import { ReactNode, useMemo, useEffect, useState } from "react";
import type { Range } from "slate";
import { ReactEditor, useSlate } from "slate-react";
import type { Placement, VirtualElement } from "@popperjs/core";
import { usePopper } from "react-popper";
import { Portal } from "@chakra-ui/react";
import useHotkeys from "../../lib/use-hotkeys";
import useOnClickOutside from "../../lib/use-on-click-outside";

type Props = {
  children: ReactNode;
  className?: string;
  placement?: Placement;
  selection?: Range;
  onClose?: () => void;
};

export default function EditorPopover(props: Props) {
  const { children, placement, selection, onClose } = props;
  const editor = useSlate();

  const [referenceElement, setReferenceElement] = useState<
    Element | VirtualElement | null
  >(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null
  );
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement,
    modifiers: [
      { name: "offset", options: { offset: [0, 12] } },
      { name: "computeStyles", options: { gpuAcceleration: false } },
    ],
  });
  useOnClickOutside(popperElement, onClose);

  const hotkeys = useMemo(
    () => [
      {
        hotkey: "esc",
        callback: () => onClose?.(),
      },
    ],
    [onClose]
  );
  useHotkeys(hotkeys);

  useEffect(() => {
    const getDOMRange = () => {
      if (selection) {
        try {
          return ReactEditor.toDOMRange(editor, selection);
        } catch (e) {}
      }
      const domSelection = window.getSelection();
      if (domSelection && domSelection.rangeCount > 0) {
        return domSelection.getRangeAt(0);
      }
      return null;
    };

    const virtualElement = {
      getBoundingClientRect: () =>
        getDOMRange()?.getBoundingClientRect() ?? new DOMRect(),
      contextElement: getDOMRange()?.startContainer.parentElement ?? undefined,
    };

    setReferenceElement(virtualElement);
  }, [editor, editor.selection, selection]);

  return (
    <Portal>
      <div ref={setPopperElement} style={styles.popper} {...attributes.popper}>
        {children}
      </div>
    </Portal>
  );
}
