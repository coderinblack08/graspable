import { Accordion, Box, Flex, Heading, Text, VStack } from "@chakra-ui/react";
import { NextPage } from "next";
import useSWR from "swr";
import { CourseCard } from "../components/CourseCard";
import { NewCourseModal } from "../components/NewCourseModal";
import { NavbarLayout } from "../layouts/NavbarLayout";
import { Course } from "../types";

const DashboardPage: NextPage = () => {
  const { data: courses } = useSWR<Course[]>("/api/courses");

  return (
    <NavbarLayout>
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
      <Accordion allowToggle mt={6} as={VStack} spacing={4}>
        {courses?.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </Accordion>
    </NavbarLayout>
  );
};

export default DashboardPage;
