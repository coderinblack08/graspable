import { Center, Stack } from "@mantine/core";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { trpc } from "../../../lib/trpc";
import Image from "next/image";
import DashboardSkeleton from "../../../public/dashboard-skeleton.svg";
import { useEffect } from "react";
import { useRouter } from "next/router";

const WorkspacePage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ id }) => {
  const router = useRouter();
  const { data: tables } = trpc.useQuery([
    "tables.byWorkspaceId",
    { workspaceId: id },
  ]);

  useEffect(() => {
    if (tables?.length) {
      router.push(`/workspaces/${id}/tables/${tables[0].id}`);
    }
  }, [tables, router, id]);

  return (
    <Center sx={{ height: "100vh" }}>
      <Stack
        align="center"
        sx={(theme) => ({
          color: theme.colors.dark[3],
          userSelect: "none",
        })}
      >
        <Image src={DashboardSkeleton} alt="Dashboard skeleton placeholder" />
        Press new table in the upper left to begin
      </Stack>
    </Center>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {
      id: context.query.id,
    },
  };
};

export default WorkspacePage;
