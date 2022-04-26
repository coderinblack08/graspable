import {
  Container,
  Flex,
  HStack,
  Icon,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { IconPlayerPlay, IconSettings, IconUserPlus } from "@tabler/icons";
import { doc, updateDoc } from "firebase/firestore";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { FormProvider, useForm } from "react-hook-form";
import { useQuery } from "react-query";
import { AccountDropdown } from "../../../../components/AccountDropdown";
import AutoSave from "../../../../components/ReactAutoSave";
import { TitleInput } from "../../../../components/TitleInput";
import { Editor } from "../../../../editor/Editor";
import { ElementType } from "../../../../editor/types/slate";
import { CourseLayout } from "../../../../layouts/CourseLayout";
import { db } from "../../../../lib/firebase-client";
import { Lesson } from "../../../../types";

const CoursePage: NextPage = () => {
  const {
    query: { id: courseId, lessonId },
  } = useRouter();
  const { data: lesson } = useQuery<Lesson>(`/api/lessons/${lessonId}`);
  const methods = useForm();

  const onSubmit = (data: any) => {
    if (lesson) {
      Object.keys(data).forEach((key) => {
        if (!data[key])
          data[key] = {
            name: "Untitled",
            body: {
              type: ElementType.Paragraph,
              children: [
                {
                  text: "",
                },
              ],
            },
          }[key];
      });
      updateDoc(doc(db, "lessons", lesson?.id), data);
    }
  };

  return (
    <CourseLayout courseId={courseId?.toString()} currentLessonId={lesson?.id}>
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
        <FormProvider {...methods}>
          <Container h="full" px={20} maxW="4xl" py={16} as="form">
            <TitleInput lesson={lesson} />
            <Editor />
            <AutoSave onSubmit={onSubmit} />
          </Container>
        </FormProvider>
      </Flex>
    </CourseLayout>
  );
};

export default CoursePage;
