import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Link,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  IconBook,
  IconDots,
  IconPlus,
  IconQuestionMark,
  IconSearch,
  IconUserPlus,
} from "@tabler/icons";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import NextLink from "next/link";
import React from "react";
import useSWR from "swr";
import { auth, db } from "../lib/firebase-client";
import { Course, Lesson } from "../types";

interface CourseLayoutProps {
  courseId: string | undefined;
  currentLessonId?: string;
}

export const CourseLayout: React.FC<CourseLayoutProps> = ({
  courseId,
  currentLessonId,
  children,
}) => {
  const { data: course } = useSWR<Course>(`/api/courses/${courseId}`);
  const { data: lessons } = useSWR<Lesson[]>(
    `/api/courses/${courseId}/lessons`
  );

  return (
    <Flex w="100vw" h="100vh">
      <Flex
        flexDir="column"
        as="aside"
        w="19rem"
        flexShrink={0}
        borderRight="1px solid"
        borderColor="gray.200"
      >
        <Flex flexDir="column" h="full">
          <Box>
            <Box px={4} pt={4}>
              <NextLink href="/dashboard" passHref>
                <Link display="inline-block" color="blue.500">
                  <Text>Go Back</Text>
                </Link>
              </NextLink>
            </Box>
            <Box m={2} pb={2} borderBottom="1px solid" borderColor="gray.200">
              <Flex align="center" justify="space-between" m={2}>
                <Heading size="md" as="h1" isTruncated mr={4}>
                  {course?.name}
                </Heading>
                <IconButton
                  size="sm"
                  aria-label="Course Actions"
                  icon={<Icon as={IconDots} color="gray.400" boxSize={5} />}
                  variant="outline"
                />
              </Flex>
              <InputGroup w="full" userSelect="none" mt={4} size="sm">
                <InputLeftElement pointerEvents="none">
                  <Icon as={IconSearch} boxSize={4} color="gray.300" />
                </InputLeftElement>
                <Input
                  fontSize="md"
                  variant="filled"
                  rounded="lg"
                  placeholder="Search"
                />
              </InputGroup>
            </Box>
          </Box>
          <VStack mx={2} spacing={1} h="full" overflowY="auto">
            {lessons?.map((lesson) => (
              <NextLink
                key={lesson.id}
                href="/lessons/[id]"
                as={`/lessons/${lesson.id}`}
                passHref
              >
                <Button
                  as="a"
                  bg={currentLessonId === lesson.id ? "blue.50" : "white"}
                  _hover={{ bg: "gray.50" }}
                  leftIcon={<Icon as={IconBook} color="gray.400" boxSize={6} />}
                  iconSpacing={2.5}
                  fontWeight="medium"
                  variant="ghost"
                  color="gray.500"
                  w="full"
                  justifyContent="start"
                >
                  {lesson.name}
                </Button>
              </NextLink>
            ))}
            <Button
              variant="ghost"
              color="gray.500"
              w="full"
              _hover={{ bg: "gray.50" }}
              fontWeight="medium"
              justifyContent="start"
              iconSpacing={2.5}
              leftIcon={<Icon as={IconPlus} color="gray.400" boxSize={6} />}
              onClick={async () => {
                const data = {
                  userId: auth.currentUser?.uid,
                  courseId: course?.id,
                  name: "Untitled",
                  createdAt: serverTimestamp(),
                };
                const { id } = await addDoc(collection(db, "lessons"), data);
                await updateDoc(doc(db, "courses", course?.id!), {
                  lessons: arrayUnion(id),
                });
              }}
            >
              New Lesson
            </Button>
          </VStack>
        </Flex>
        <VStack
          spacing={1}
          mx={2}
          py={4}
          borderTop="1px solid"
          borderColor="gray.200"
        >
          <Button
            leftIcon={<Icon color="gray.400" as={IconUserPlus} boxSize={5} />}
            variant="ghost"
            justifyContent="left"
            color="gray.500"
            fontWeight="medium"
            w="full"
          >
            Invite People
          </Button>
          <Button
            justifyContent="left"
            color="gray.500"
            fontWeight="medium"
            leftIcon={
              <Icon
                color="gray.400"
                w="full"
                as={IconQuestionMark}
                boxSize={5}
              />
            }
            variant="ghost"
            w="full"
          >
            Help Center
          </Button>
        </VStack>
      </Flex>
      {children}
    </Flex>
  );
};
