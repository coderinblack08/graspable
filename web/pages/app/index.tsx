import { IconPlus, IconUsers } from "@tabler/icons";
import type { NextPage } from "next";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { useMeQuery } from "../../generated/graphql";

const AppPage: NextPage = () => {
  const { data: me } = useMeQuery();

  return (
    <div className="flex h-screen bg-gray-900">
      <aside className="h-full w-full max-w-xs flex-shrink-0 border-r border-gray-800 p-4">
        <Input placeholder="Search" className="mb-4" />
        <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
          workspaces
        </h4>
        <button className="flex w-full items-center rounded-md bg-gray-800 p-2">
          <IconUsers className="mr-2.5 h-5 w-5" />
          My Workspace
        </button>
        <button className="flex w-full items-center rounded-md p-2 text-gray-300">
          <IconPlus className="mr-2.5 h-5 w-5" />
          New workspace
        </button>
      </aside>
      <main className="w-full p-8">
        <h1 className="mb-4 text-2xl font-bold">My Workspace</h1>
        <div className="flex items-center gap-2">
          <Button
            leftIcon={<IconUsers className="h-5 w-5" />}
            variant="secondary"
          >
            1
          </Button>
          <Button variant="secondary">Share</Button>
          <Button variant="secondary">Settings</Button>
        </div>
        <div className="my-8">
          <div className="grid grid-cols-2 gap-4">
            <article className="rounded-md border border-gray-800 p-4">
              <h2 className="text-lg">Untitled Base</h2>
              <p className="mt-1 text-gray-400">Active</p>
            </article>
          </div>
          <Button
            leftIcon={<IconPlus className="h-6 w-6" />}
            className="mt-4 w-full"
            variant="secondary"
            size="lg"
          >
            New Base
          </Button>
        </div>

        <h2 className="mb-2 text-lg font-bold">Quick Links</h2>
        <ul className="mx-5 list-disc space-y-2">
          <li>
            <button className="hover:underline">Upload existing data</button>
          </li>
          <li>
            <button className="hover:underline">Use a template</button>
          </li>
          <li>
            <button className="hover:underline">Upgrade organization</button>
          </li>
        </ul>
      </main>
    </div>
  );
};

export default AppPage;
