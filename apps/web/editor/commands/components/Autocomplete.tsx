import { useSlateStatic } from "slate-react";
import { useTextSelection } from "use-text-selection";
import { Command } from "../../types/slate";
import { autocompleteCommand } from "../lib/autocompleteCommand";
import { OptionsList } from "./OptionsList";

export const Autocomplete = ({
  commands,
  modifier,
}: {
  modifier: string;
  commands: Command[];
}) => {
  const { clientRect, isCollapsed } = useTextSelection();
  const editor = useSlateStatic();
  const p = autocompleteCommand(editor);

  if (clientRect == null || !p.showAutoComplete || !isCollapsed) return null;

  const search = p.search.toLowerCase();

  const filteredOptions = commands.filter(
    (v) => p.modifier === modifier && v.key.toLowerCase().includes(search)
  );

  return (
    <OptionsList
      modifier={modifier}
      commands={filteredOptions}
      clientRect={clientRect}
      search={p.search}
    />
  );
};
