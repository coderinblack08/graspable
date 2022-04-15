import { Heading, Text } from "@chakra-ui/react";
import { NextPage } from "next";
import { SidebarLayout } from "../layouts/SidebarLayout";

const DashboardPage: NextPage = () => {
  return (
    <SidebarLayout>
      <Heading size="lg" as="h1">
        Dashboard
      </Heading>
      <Text color="gray.600" fontSize="lg" mt={2}>
        Manage your courses and notifications
      </Text>
    </SidebarLayout>
  );
};

export default DashboardPage;
