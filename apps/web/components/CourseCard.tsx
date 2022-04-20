import {
  Flex,
  Heading,
  HStack,
  Icon,
  LinkBox,
  LinkOverlay,
  Text,
} from "@chakra-ui/react";
import { IconBook } from "@tabler/icons";
import NextLink from "next/link";
import React from "react";
import { Course } from "../types";

interface CourseCardProps {
  course: Course;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  return (
    <Flex
      bg="white"
      w="full"
      h="full"
      flexDir="column"
      overflow="hidden"
      rounded="lg"
      border="2px solid"
      borderColor="gray.100"
      p={5}
    >
      <LinkBox as="article" w="full" textAlign="left">
        <HStack>
          <Icon as={IconBook} boxSize={7} color="gray.400" />
          <Heading size="md" as="h2">
            <NextLink
              href="/courses/[id]"
              as={`/courses/${course.id}`}
              passHref
            >
              <LinkOverlay>{course.name}</LinkOverlay>
            </NextLink>
          </Heading>
        </HStack>
        <Text color="gray.600" mt={2}>
          <Text as="span" textTransform="capitalize">
            {course.subject}
          </Text>{" "}
          · {course.lessons?.length} Lessons
        </Text>
      </LinkBox>
    </Flex>
  );
};
