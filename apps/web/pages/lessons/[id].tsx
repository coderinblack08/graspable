import {
  Container,
  Flex,
  HStack,
  Icon,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { IconPlayerPlay, IconSettings, IconUserPlus } from "@tabler/icons";
import { NextPage } from "next";
import { useRouter } from "next/router";
import useSWR from "swr";
import { AccountDropdown } from "../../components/AccountDropdown";
import { Editor } from "../../editor/Editor";
import { CourseLayout } from "../../layouts/CourseLayout";
import { Lesson } from "../../types";

const CoursePage: NextPage = () => {
  const {
    query: { id },
  } = useRouter();
  const { data: lesson } = useSWR<Lesson>(`/api/lessons/${id}`);

  return (
    <CourseLayout courseId={lesson?.courseId} currentLessonId={lesson?.id}>
      <Flex flexDir="column" w="full" overflowY="auto" h="full">
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
        <Container h="full" px={20} maxW="4xl" py={16}>
          <Editor />
        </Container>
      </Flex>
    </CourseLayout>
  );
};

export default CoursePage;
