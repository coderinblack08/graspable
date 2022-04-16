import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Text,
  VStack,
} from "@chakra-ui/react";
import { NextPage } from "next";
import { HiOutlinePlus } from "react-icons/hi";
import { NewCourseModal } from "../components/NewCourseModal";
import { SidebarLayout } from "../layouts/SidebarLayout";

const DashboardPage: NextPage = () => {
  const courses = [];

  return (
    <SidebarLayout>
      <Flex
        pb={6}
        alignItems="end"
        justify="space-between"
        borderBottom="2px solid"
        borderColor="gray.100"
      >
        <Box>
          <Heading size="lg" as="h1">
            Dashboard
          </Heading>
          <Text color="gray.600" fontSize="lg" mt={2}>
            Manage your courses and notifications
          </Text>
        </Box>
        <NewCourseModal />
      </Flex>
      <Box mt={8}>
        {courses?.map((course) => (
          <Box
            key={course.id}
            p={6}
            bg="white"
            overflow="hidden"
            rounded="xl"
            border="2px solid"
            borderColor="gray.100"
          >
            <Flex justifyContent="space-between" align="center">
              <Heading as="h2" size="md">
                Geometry
              </Heading>
            </Flex>
            <Text color="gray.600" mt={1}>
              2 Lessons
            </Text>
            <VStack mt={4} spacing={2}>
              <Button justifyContent="left" variant="outline" w="full">
                Parallel and Traversal Lines
              </Button>
              <Button justifyContent="left" variant="outline" w="full">
                Similarity and Transformations
              </Button>
              <Button
                w="full"
                leftIcon={<Icon as={HiOutlinePlus} boxSize={5} />}
              >
                New Lesson
              </Button>
            </VStack>
          </Box>
        ))}
      </Box>
    </SidebarLayout>
  );
};

export default DashboardPage;
