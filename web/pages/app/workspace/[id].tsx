import {
  EyeOffIcon,
  FilterIcon,
  PlusIcon,
  SearchIcon,
  SortAscendingIcon,
  UserCircleIcon,
} from "@heroicons/react/solid";
import {
  IconAlignLeft,
  IconCaretDown,
  IconLetterA,
  IconList,
  IconMenu2,
} from "@tabler/icons";
import type { NextPage } from "next";
import { Button } from "../../../components/Button";

const WorkspacePage: NextPage = () => {
  return (
    <div className="flex h-screen flex-col bg-gray-900">
      <div className="flex w-full items-center border-b-2 border-gray-800">
        <button className="flex h-11 w-11 items-center justify-center ">
          <IconMenu2 className="h-5 w-5 text-gray-400" />
        </button>
        <button className="flex h-11 items-center gap-3 bg-gray-800 px-4 font-semibold">
          Table 1
          <IconCaretDown
            fill="currentColor"
            className="h-4 w-4 text-gray-400"
          />
        </button>
        <button className="flex h-11 items-center gap-3 border-r-2 border-gray-800 px-4 font-semibold">
          Table 2
          <IconCaretDown
            fill="currentColor"
            className="h-4 w-4 text-gray-400"
          />
        </button>
        <button className="flex h-11 w-11 items-center justify-center border-r-2 border-gray-800">
          <PlusIcon className="h-5 w-5 text-gray-400" />
        </button>
      </div>
      <header className="flex items-center justify-between border-b-2 border-gray-800 p-2">
        <div className="flex items-center gap-2">
          <button className="flex items-center justify-center rounded-lg border-2 border-gray-800 p-1.5">
            <PlusIcon className="h-5 w-5 text-gray-400" />
          </button>
          <Button variant="outline" size="sm">
            Table View
          </Button>
          <div className="h-9 w-[1px] bg-gray-800" />
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<FilterIcon className="h-5 w-5" />}
          >
            Filter
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<SortAscendingIcon className="h-5 w-5" />}
          >
            Sort
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<IconList className="h-5 w-5" />}
          >
            Group
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="bg-red-500/25"
            leftIcon={<EyeOffIcon className="h-5 w-5" />}
          >
            Hide Fields
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex h-10 w-10 items-center justify-center">
            <SearchIcon className="h-6 w-6 text-gray-400" />
          </button>
          <button className="flex h-10 items-center justify-center rounded-lg bg-gray-800 px-4 text-lg font-bold">
            <UserCircleIcon className="mr-2 h-6 w-6 text-gray-400" />
            Kevin Lu
          </button>
        </div>
      </header>
      <main>
        <div className="flex h-10 items-center border-b-2 border-gray-800">
          <div className="flex h-full items-center justify-center p-4">
            <input
              type="checkbox"
              className="form-checkbox rounded-sm border-2 border-outline bg-gray-800 text-purple-500"
            />
          </div>
          <div className="h-full w-[2px] bg-gray-800" />
          <button className="flex h-full w-48 items-center gap-2 px-4 font-bold">
            <IconLetterA className="h-4 w-4" />
            Name
            <IconCaretDown fill="currentColor" className="ml-auto h-4 w-4" />
          </button>
          <div className="h-full w-[2px] bg-gray-800" />
          <button className="flex h-full w-48 items-center gap-2 px-4 font-bold">
            <IconAlignLeft className="h-4 w-4" />
            Notes
            <IconCaretDown fill="currentColor" className="ml-auto h-4 w-4" />
          </button>
          <div className="h-full w-[2px] bg-gray-800" />
          <button className="h-full px-4">
            <PlusIcon className="ml-auto h-4 w-4" />
          </button>
          <div className="h-full w-[2px] bg-gray-800" />
        </div>
        <div className="flex h-10 w-auto items-center text-gray-300">
          <div className="flex h-full items-center justify-center border-b-2 border-gray-800 p-4">
            <input
              type="checkbox"
              className="form-checkbox rounded-sm border-2 border-outline bg-gray-800 text-purple-500"
            />
          </div>
          <div className="h-full w-[2px] bg-gray-800" />
          <button className="relative z-50 flex h-full w-48 items-center gap-2 border-b-2 border-gray-800 px-4 focus:bg-purple-500/10 focus:ring-2 focus:ring-purple-500">
            Kevin Lu
          </button>
          <div className="h-full w-[2px] bg-gray-800" />
          <button className="relative z-50 flex h-full w-48 items-center gap-2 border-b-2 border-gray-800 px-4 focus:bg-purple-500/10 focus:ring-2 focus:ring-purple-500">
            Super Smart Coder
          </button>
          <div className="h-full w-[2px] bg-gray-800" />
        </div>
        <p className="ml-16 py-3 text-gray-400">
          <PlusIcon className="mr-1.5 -mt-0.5 inline h-4 w-4" />
          Add row{" "}
          <span className="ml-1.5 tracking-widest text-gray-600">⌘-↩</span>
        </p>
      </main>
    </div>
  );
};

export default WorkspacePage;
