import { IconApps, IconDatabase, IconPlus, IconUsers } from "@tabler/icons";
import type { NextPage } from "next";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import Menu from "../../components/Menu";
import {
  useCreateOrganizationMutation,
  useCreateWorkspaceMutation,
  useMeQuery,
  useOrganizationsQuery,
} from "../../generated/graphql";

const AppPage: NextPage = () => {
  const { data: me } = useMeQuery();
  const [createOrganization] = useCreateOrganizationMutation();
  const [createWorkspace] = useCreateWorkspaceMutation();
  const { data: orgs } = useOrganizationsQuery();

  return (
    <div className="flex h-screen bg-gray-900">
      <aside className="h-full w-full max-w-xs flex-shrink-0 border-r border-gray-800 p-4">
        <Input placeholder="Search" className="mb-4" />
        <button className="flex w-full items-center rounded-md bg-gray-800 p-2">
          <IconDatabase className="mr-2.5 h-5 w-5" />
          All Workspaces
        </button>
        <button className="flex w-full items-center rounded-md p-2">
          <IconApps className="mr-2.5 h-5 w-5" />
          Templates
        </button>
        <h4 className="mt-4 mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
          organizations
        </h4>
        {orgs?.organizations.map((org) => (
          <button
            key={org.id}
            className="flex w-full items-center rounded-md p-2"
          >
            <IconUsers className="mr-2.5 h-5 w-5" />
            {org.name}
          </button>
        ))}
        <button
          className="flex w-full items-center rounded-md p-2"
          onClick={async () => {
            await createOrganization({
              variables: { args: { name: "Unnamed Organization" } },
            });
          }}
        >
          <IconPlus className="mr-2.5 h-5 w-5" />
          New organization
        </button>
      </aside>
      <main className="mx-auto w-full max-w-5xl p-8">
        <div className="mt-4 mb-8">
          <Menu
            trigger={
              <Button
                leftIcon={<IconPlus className="h-5 w-5" />}
                className="w-full"
                as="div"
              >
                New Workspace
              </Button>
            }
          >
            <div className="px-4 py-1.5 text-sm text-gray-500">
              Organizations
            </div>
            {orgs?.organizations.map((org) => (
              <Menu.Item
                onClick={() =>
                  createWorkspace({
                    variables: {
                      args: { name: "Blank Workspace", organizationId: org.id },
                    },
                  })
                }
                key={org.id}
              >
                {org.name}
              </Menu.Item>
            ))}
          </Menu>
        </div>
        <h2 className="mb-4 text-lg font-bold">Quick Links</h2>
        <ul className="mx-5 list-disc space-y-2">
          <li>
            <button className="hover:underline">Upload existing data</button>
          </li>
          <li>
            <button className="hover:underline">Use a template</button>
          </li>
          <li>
            <button className="hover:underline">Upgrade an organization</button>
          </li>
        </ul>
        <hr className="my-8 border-gray-800" />
        <div className="space-y-8">
          {orgs?.organizations.map((org) => (
            <div key={org.id}>
              <h1 className="text-xl font-bold">{org.name}</h1>
              <div className="mt-4">
                <div className="grid grid-cols-1 gap-4">
                  {org.workspaces.map((workspace) => (
                    <a
                      key={workspace.id}
                      className="rounded-md bg-gray-800 p-2 text-gray-300 transition focus:outline-none focus:ring focus:ring-gray-700"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="rounded-lg bg-gray-700 p-2.5">
                          <IconDatabase className="h-5 w-5" />
                        </div>
                        <h2 className="font-semibold">Untitled Project</h2>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AppPage;
