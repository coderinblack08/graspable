import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { NextPage } from "next";
import { HiOutlinePlus } from "react-icons/hi";
import useSWR from "swr";
import { CourseCard } from "../components/CourseCard";
import { NewCourseModal } from "../components/NewCourseModal";
import { SidebarLayout } from "../layouts/SidebarLayout";
import { auth, db } from "../lib/firebase-client";
import { Course } from "../types";

const DashboardPage: NextPage = () => {
  const { data: courses, mutate } = useSWR<Course[]>("/api/courses");

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
      <SimpleGrid columns={2} mt={8} gap={4}>
        {courses?.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </SimpleGrid>
    </SidebarLayout>
  );
};

export default DashboardPage;
