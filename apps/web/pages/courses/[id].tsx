import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Link,
  Text,
  Tooltip,
  VStack,
} from "@chakra-ui/react";
import {
  IconBook,
  IconDots,
  IconPlayerPlay,
  IconPlus,
  IconSearch,
  IconSettings,
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
import { NextPage } from "next";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { Editor } from "../../editor/Editor";
import useSWR from "swr";
import { AccountDropdown } from "../../components/AccountDropdown";
import { auth, db } from "../../lib/firebase-client";
import { Course, Lesson } from "../../types";

const CoursePage: NextPage = () => {
  const {
    query: { id },
  } = useRouter();
  const { data: course } = useSWR<Course>(`/api/courses/${id}`);
  const { data: lessons } = useSWR<Lesson[]>(`/api/courses/${id}/lessons`);

  return (
    <Flex w="100vw" h="100vh">
      <Flex
        flexDir="column"
        justify="space-between"
        as="aside"
        w="19rem"
        flexShrink={0}
        borderRight="1px solid"
        borderColor="gray.200"
      >
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
          <VStack mx={2} spacing={1}>
            {lessons?.map((lesson, index) => (
              <Button
                bg={index === 0 ? "blue.50" : "white"}
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
        </Box>
      </Flex>
      <Box w="full">
        <HStack justify="end" px={8} py={4}>
          <Tooltip label="Begin live session">
            <IconButton
              aria-label="Begin Live Session"
              icon={<Icon as={IconPlayerPlay} boxSize={5} color="gray.400" />}
              variant="outline"
            />
          </Tooltip>
          <Tooltip label="Lesson settings">
            <IconButton
              aria-label="Settings"
              icon={<Icon as={IconSettings} boxSize={5} color="gray.400" />}
              variant="outline"
            />
          </Tooltip>
          <Tooltip label="Invite collaborators">
            <IconButton
              aria-label="Share"
              icon={<Icon as={IconUserPlus} boxSize={5} color="gray.400" />}
              variant="outline"
            />
          </Tooltip>
          <AccountDropdown />
        </HStack>
        <Container px={12} maxW="4xl" py={16}>
          <Editor />
        </Container>
      </Box>
    </Flex>
  );
};

export default CoursePage;
