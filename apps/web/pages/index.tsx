import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Icon,
  Input,
  Text,
  useBreakpointValue,
  VStack,
} from "@chakra-ui/react";
import NextLink from "next/link";
import React from "react";
import { MdChevronRight } from "react-icons/md";
import { ChakraNextImage } from "../components/ChakraNextImage";
import { BasicLayout } from "../layouts/BasicLayout";
import ComputerMonitor from "../public/computer-monitor.png";
import ImaginativeKid from "../public/imaginative-kid.png";
import StudiousCat from "../public/studious-cat.png";
import TypingTeacher from "../public/typing-teacher.png";

const HomePage: React.FC = () => {
  const responsiveBodySize = { base: "md", md: "xl", lg: "1.3rem" };
  const responsiveButtonSize = useBreakpointValue(
    { base: "md", sm: "lg" },
    "lg"
  );

  return (
    <BasicLayout>
      <Flex
        justify="space-between"
        align="center"
        py={{ base: 12, sm: 20, md: 28 }}
      >
        <Container maxW="2xl" px={0}>
          <Heading
            lineHeight="shorter"
            as="h1"
            fontSize={{ base: "3xl", sm: "4xl", md: "5xl", lg: "6xl" }}
          >
            Engaging Lessons <br />
            For Every Classroom
          </Heading>
          <Text
            color="gray.600"
            fontSize={{ base: "sm", sm: "lg", md: "1.3rem" }}
            lineHeight={{ base: "taller", sm: "tall" }}
            maxW="xl"
            mt={{ base: 4, md: 6 }}
          >
            Graspable aims to help teachers ditch boring slideshows for
            interactive lesson plans that actually stick.
          </Text>
          <Flex
            mt={{ base: 6, md: 8 }}
            flexDir={{ base: "column", lg: "row" }}
            gap={2}
          >
            <NextLink href="/signup" passHref>
              <Button
                rightIcon={<Icon as={MdChevronRight} boxSize={6} />}
                size={responsiveButtonSize}
                fontSize={{ base: "sm", sm: "lg" }}
                as="a"
              >
                Try 31 Days Free
              </Button>
            </NextLink>
            <Button
              size={responsiveButtonSize}
              fontSize={{ base: "sm", sm: "lg" }}
              variant="outline"
            >
              Watch Demo
            </Button>
          </Flex>
        </Container>
        <Box display={{ base: "none", lg: "block" }}>
          <ChakraNextImage alt="Studious Cat" src={StudiousCat} />
        </Box>
      </Flex>

      <VStack spacing={16}>
        <HStack
          flexDir={{ base: "column", lg: "row" }}
          gap={{ base: 6, lg: 10 }}
          alignItems={{ base: "start", lg: "center" }}
        >
          <ChakraNextImage src={TypingTeacher} />
          <Box maxW="2xl">
            <Heading as="h2" fontSize={{ base: "2xl", md: "4xl" }}>
              Digital Lesson Plans
            </Heading>
            <Text
              lineHeight="tall"
              color="gray.600"
              fontSize={responsiveBodySize}
              mt={3}
            >
              Type or draw your lesson plans online. Import existing class notes
              or documents with photos or PDFs. Insert checkpoints and
              interactive widgets to survey the class&apos;s overall confidence
              about a given topic.
            </Text>
          </Box>
        </HStack>

        <HStack
          flexDir={{ base: "column-reverse", lg: "row" }}
          gap={{ base: 6, lg: 10 }}
          alignItems={{ base: "start", lg: "center" }}
          spacing={0}
        >
          <Box maxW="2xl">
            <Heading as="h2" fontSize={{ base: "2xl", md: "4xl" }}>
              Teachers Marketplace
            </Heading>
            <Text
              lineHeight="tall"
              color="gray.600"
              fontSize={responsiveBodySize}
              mt={3}
            >
              Sell copies of you lessons to other teachers on our marketplace to
              earn extra cash on the side. We plan to work with textbook
              publishers to convert your lessons into digital resources.
            </Text>
          </Box>
          <ChakraNextImage src={ComputerMonitor} />
        </HStack>

        <HStack
          flexDir={{ base: "column", lg: "row" }}
          gap={{ base: 6, lg: 10 }}
          alignItems={{ base: "start", lg: "center" }}
        >
          <ChakraNextImage src={ImaginativeKid} />
          <Box maxW="2xl">
            <Heading as="h2" fontSize={{ base: "2xl", md: "4xl" }}>
              Promote Collaboration
            </Heading>
            <Text
              lineHeight="tall"
              color="gray.600"
              fontSize={responsiveBodySize}
              mt={3}
            >
              Use questions, games, individual and team competitions with
              leaderboards, and forums for discussion to stir up collaboration
              within your classroom.
            </Text>
          </Box>
        </HStack>
      </VStack>

      <Flex pos="relative" w="full" mt={24}>
        <Box
          _before={{
            height: "6px",
            width: "100%",
            background: "url('/divider-pattern.png')",
            display: "block",
            position: "absolute",
            top: "0",
            left: "50%",
            right: "50%",
            content: "''",
            transform: "translate(-50%, -50%)",
            "background-position": "bottom",
            opacity: 0.25,
          }}
        />
      </Flex>

      <Box py={24} maxW={{ base: "2xl", lg: "3xl" }} mx="auto">
        <Heading as="h3" fontSize={{ base: "2xl", md: "4xl" }}>
          Get Updated
        </Heading>
        <Text color="gray.600" fontSize={responsiveBodySize} mt={2}>
          Sign up to our newsletter to get the latest news and updates about
          Graspable.
        </Text>
        <Flex gap={2} flexDir={{ base: "column", md: "row" }} mt={4}>
          <Input
            size={responsiveButtonSize}
            type="email"
            placeholder="Enter Email Address"
            name="email"
            isRequired
          />
          <Button
            size={responsiveButtonSize}
            flexShrink={0}
            px={8}
            type="submit"
          >
            Notify Me
          </Button>
        </Flex>
      </Box>
      <Box
        as="footer"
        color="gray.400"
        fontSize={responsiveBodySize}
        pb={{ base: 4, md: 8 }}
        textAlign="center"
      >
        Copyright © 2022 Graspable. All rights reserved.
      </Box>
    </BasicLayout>
  );
};

export default HomePage;
