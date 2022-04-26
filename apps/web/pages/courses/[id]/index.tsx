import {
  Box,
  Container,
  Flex,
  HStack,
  Icon,
  Image,
  Text,
  VStack,
} from "@chakra-ui/react";
import { IconPlus } from "@tabler/icons";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { AccountDropdown } from "../../../components/AccountDropdown";
import { CourseLayout } from "../../../layouts/CourseLayout";

const CoursePage: NextPage = () => {
  const {
    query: { id },
  } = useRouter();

  return (
    <CourseLayout courseId={id?.toString()}>
      <Flex pos="relative" align="center" justify="center" w="full">
        <Container maxW="3xl">
          <VStack spacing={6}>
            <Image
              userSelect="none"
              _hover={{ transform: "scale(1.05)" }}
              rounded="2xl"
              transition="all 0.2s"
              src="/dashboard-wireframe.svg"
              alt="Wireframe of dashboard"
              draggable={false}
              w={96}
            />
            <HStack color="gray.400">
              <Icon as={IconPlus} boxSize={6} />
              <Text textAlign="center" fontSize="lg">
                Get started by clicking &quot;New Lesson&quot;
              </Text>
            </HStack>
          </VStack>
        </Container>
      </Flex>
    </CourseLayout>
  );
};

export default CoursePage;
