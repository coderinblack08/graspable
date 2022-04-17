import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
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
import React from "react";
import { HiOutlinePlus } from "react-icons/hi";
import { MdDragIndicator } from "react-icons/md";
import useSWR, { useSWRConfig } from "swr";
import { auth, db } from "../lib/firebase-client";
import { Course, Lesson } from "../types";

interface CourseCardProps {
  course: Course;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const { data: lessons } = useSWR<Lesson[]>(`/api/lessons/${course.id}`);
  const { mutate } = useSWRConfig();

  return (
    <Flex
      flexDir="column"
      justify="space-between"
      p={5}
      bg="white"
      w="full"
      h="full"
      overflow="hidden"
      rounded="2xl"
      border="2px solid"
      borderColor="gray.100"
    >
      <Box>
        <Flex justifyContent="space-between" align="center">
          <Heading as="h2" size="md">
            {course.name}
          </Heading>
        </Flex>
        <Text color="gray.600" mt={1}>
          <Text as="span" textTransform="capitalize">
            {course.subject}
          </Text>{" "}
          · {lessons?.length} Lessons
        </Text>
        <VStack mt={4} spacing={2}>
          {lessons?.map((lesson) => (
            <HStack w="full" spacing={0}>
              <Button
                w="full"
                key={lesson.id}
                justifyContent="left"
                variant="outline"
              >
                {lesson.name}
              </Button>
              <IconButton
                aria-label="drag"
                icon={
                  <Icon as={MdDragIndicator} boxSize={6} color="gray.400" />
                }
                variant="ghost"
              />
            </HStack>
          ))}
        </VStack>
      </Box>
      <Button
        mt={2}
        w="full"
        leftIcon={<Icon as={HiOutlinePlus} boxSize={5} />}
        onClick={async () => {
          const data = {
            userId: auth.currentUser?.uid,
            courseId: course.id,
            name: "Untitled",
            createdAt: serverTimestamp(),
          };
          const { id } = await addDoc(collection(db, "lessons"), data);
          await updateDoc(doc(db, "courses", course.id), {
            lessons: arrayUnion(id),
          });
          mutate(`/api/lessons/${course.id}`, [...lessons!, { id, ...data }]);
        }}
      >
        New Lesson
      </Button>
    </Flex>
  );
};
