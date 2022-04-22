import {
  Box,
  Container,
  Flex,
  HStack,
  Image,
  Link,
  Spacer,
  StackDivider,
  Text,
  VStack,
} from "@chakra-ui/react";
import { NextPage } from "next";
import NextLink from "next/link";
import useSWR from "swr";
import { AccountDropdown } from "../components/AccountDropdown";
import { CourseCard } from "../components/CourseCard";
import { NewCourseModal } from "../components/NewCourseModal";
import { Select } from "../lib/chakra-theme";
import { Course } from "../types";

const DashboardPage: NextPage = () => {
  const { data: courses } = useSWR<Course[]>("/api/courses");

  return (
    <Container px={4} py={24} maxW="3xl">
      <Flex justify="space-between" align="center" mb={4}>
        <NextLink href="/" passHref>
          <Link display="inline-block" userSelect="none">
            <Image h={{ base: 5, sm: 6 }} src="/logo.svg" alt="graspable" />
          </Link>
        </NextLink>
        <AccountDropdown />
      </Flex>
      {courses?.length === 0 ? (
        <Box
          mb={4}
          border="1px solid"
          borderColor="gray.200"
          rounded="lg"
          fontFamily="mono"
          textAlign="center"
          p={20}
          lineHeight="taller"
          color="gray.400"
          fontSize="lg"
        >
          ʕ•́ᴥ•̀ʔっ No courses found <br />
          Create one with the button below{" "}
        </Box>
      ) : null}
      <VStack spacing={4}>
        {courses?.map((course) => (
          <CourseCard course={course} key={course.id} />
        ))}
        <NewCourseModal />
      </VStack>
      <Flex mt={4} justify="space-between" color="gray.400">
        <HStack spacing={2}>
          <Link>Home</Link>
          <Text>·</Text>
          <Link>Marketplace</Link>
          <Text>·</Text>
          <Link>Pricing</Link>
          <Text>·</Text>
          <Link>Help Center</Link>
        </HStack>
        <Link>Feedback?</Link>
      </Flex>
    </Container>
  );
};

export default DashboardPage;
