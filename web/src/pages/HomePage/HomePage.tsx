import { ChevronRightIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Image,
  Input,
  Text,
} from "@chakra-ui/react";
import { Link, routes } from "@redwoodjs/router";
import { MetaTags } from "@redwoodjs/web";
import React from "react";

const HomePage: React.FC = () => {
  return (
    <>
      <MetaTags title="Graspable" />
      <Flex justify="space-between" align="center" py={28} px={5}>
        <Box>
          <Heading as="h1" lineHeight="shorter" fontSize="6xl">
            Engaging Lessons <br />
            For Every Classroom
          </Heading>
          <Text
            color="gray.600"
            fontSize="1.3rem"
            lineHeight="tall"
            maxW="xl"
            mt={6}
          >
            Guide your students&apos; learning through an interactive platform
            focused on developing problem solving and collaboration skills with
            friendly competitions.
          </Text>
          <HStack mt={8} spacing={3}>
            <Link to={routes.signup()}>
              <Button rightIcon={<ChevronRightIcon boxSize={6} />} size="lg">
                Try 31 Days Free
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Watch Demo
            </Button>
          </HStack>
        </Box>
        <Image src="/studious-cat.png" h="25rem" />
      </Flex>

      <Box p={5}>
        <HStack spacing={10}>
          <Image src="/typing-teacher.png" h={64} />
          <Box maxW="2xl">
            <Heading as="h2">Digital Lesson Plans</Heading>
            <Text lineHeight="tall" color="gray.600" fontSize="xl" mt={3}>
              Type or draw your lesson plans online. Import existing class notes
              or documents with photos or PDFs. Insert checkpoints and
              interactive widgets to survey the class&apos;s overall confidence
              about a given topic.
            </Text>
          </Box>
        </HStack>
      </Box>

      <Box p={5}>
        <HStack spacing={10}>
          <Box maxW="2xl">
            <Heading as="h2">Teachers Marketplace</Heading>
            <Text lineHeight="tall" color="gray.600" fontSize="xl" mt={3}>
              Sell copies of you lessons to other teachers on our marketplace to
              earn extra cash on the side. We plan to work with textbook
              publishers to convert your lessons into digital resources.
            </Text>
          </Box>
          <Image src="/computer-monitor.png" h={64} />
        </HStack>
      </Box>

      <Box p={5}>
        <HStack spacing={10}>
          <Image src="/imaginative-kid.png" h={64} />
          <Box maxW="2xl">
            <Heading as="h2">Promote Collaboration</Heading>
            <Text lineHeight="tall" color="gray.600" fontSize="xl" mt={3}>
              Use questions, games, individual and team competitions with
              leaderboards, and forums for discussion to stir up collaboration
              within your classroom.
            </Text>
          </Box>
        </HStack>
      </Box>

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

      <Box py={24} maxW="3xl" mx="auto">
        <Heading as="h3" fontSize="3xl">
          Get Updated
        </Heading>
        <Text color="gray.600" fontSize="xl" mt={2}>
          Sign up to our newsletter to get the latest news and updates about
          Graspable.
        </Text>
        <HStack mt={4}>
          <Input size="lg" placeholder="Enter Email Address" />
          <Button size="lg" flexShrink={0}>
            Notify Me
          </Button>
        </HStack>
      </Box>

      <Box as="footer" color="gray.400" fontSize="xl" pb={8} textAlign="center">
        Copyright © 2022 Graspable. All rights reserved.
      </Box>
    </>
  );
};

export default HomePage;
