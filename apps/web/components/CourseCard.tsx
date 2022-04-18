import {
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Flex,
  Heading,
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
import NextLink from "next/link";
import React from "react";
import {
  HiOutlineBookOpen,
  HiOutlineDocument,
  HiOutlinePlus,
} from "react-icons/hi";
import { useSWRConfig } from "swr";
import { auth, db } from "../lib/firebase-client";
import { Course } from "../types";

interface CourseCardProps {
  course: Course;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const { mutate } = useSWRConfig();

  return (
    <Flex
      flexDir="column"
      justify="space-between"
      bg="white"
      w="full"
      h="full"
      overflow="hidden"
      rounded="2xl"
      border="2px solid"
      borderColor="gray.100"
      as={AccordionItem}
    >
      <AccordionButton
        p={5}
        _focus={{ boxShadow: "none" }}
        _hover={{ bg: "white" }}
        _expanded={{ borderBottom: "2px solid", borderColor: "gray.100" }}
      >
        <IconButton
          mr={5}
          as="div"
          variant="outline"
          aria-label="Book Icon"
          icon={<Icon as={HiOutlineBookOpen} boxSize={6} color="gray.400" />}
          size="lg"
        />
        <Box w="full" textAlign="left">
          <Heading as="h2" size="md">
            {course.name}
          </Heading>
          <Text color="gray.600" mt={1}>
            <Text as="span" textTransform="capitalize">
              {course.subject}
            </Text>{" "}
            · {course.lessons?.length} Lessons
          </Text>
        </Box>
        <AccordionIcon boxSize={8} color="gray.400" />
      </AccordionButton>
      <AccordionPanel p={5}>
        <VStack spacing={2}>
          {course.lessons?.map((lesson) => (
            <NextLink
              passHref
              href="/lesson/[id]"
              as={`/lesson/${lesson.id}`}
              key={lesson.id}
            >
              <Button
                w="full"
                size="lg"
                px={2}
                key={lesson.id}
                justifyContent="left"
                variant="ghost"
                color="gray.600"
                _hover={{ bg: "white" }}
                _focus={{ bg: "white" }}
                _active={{ bg: "white", boxShadow: "outline" }}
                fontWeight="medium"
                leftIcon={
                  <IconButton
                    aria-label="Document Icon"
                    as="div"
                    variant="outline"
                    icon={
                      <Icon
                        as={HiOutlineDocument}
                        color="gray.400"
                        boxSize={6}
                      />
                    }
                  />
                }
                as="a"
              >
                {lesson.name}
              </Button>
            </NextLink>
          ))}
        </VStack>
        <Button
          mt={4}
          w="full"
          size="lg"
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
            mutate(`/api/courses`, (old: Course[]) =>
              old.map((c) =>
                c.id === course.id
                  ? { ...c, lessons: [...c.lessons, { id, ...data }] }
                  : c
              )
            );
          }}
        >
          New Lesson
        </Button>
      </AccordionPanel>
    </Flex>
  );
};
