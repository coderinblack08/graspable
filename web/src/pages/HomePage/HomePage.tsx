import { ChevronDownIcon, ChevronRightIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Image,
  Link,
  Text,
} from "@chakra-ui/react";
import { routes } from "@redwoodjs/router";
import React from "react";

const HomePage: React.FC = () => {
  return (
    <Container maxW="5xl">
      <Flex align="center" justify="space-between" p={4} as="nav">
        <Link href={routes.home()}>
          <Image h={6} src="/logo.svg" alt="graspable" />
        </Link>
        <HStack spacing={5}>
          <Button
            px={0}
            variant="ghost"
            fontWeight="normal"
            rightIcon={<ChevronDownIcon boxSize="20px" />}
          >
            Products
          </Button>
          <Button
            px={0}
            variant="ghost"
            fontWeight="normal"
            rightIcon={<ChevronDownIcon boxSize="20px" />}
          >
            Resources
          </Button>
          <Link>Pricing</Link>
          <Button variant="outline">Log In</Button>
        </HStack>
      </Flex>
      <Flex justify="space-between" align="center" py={28} px={5}>
        <Box>
          <Heading as="h1" lineHeight="normal" fontSize="6xl">
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
            <Button rightIcon={<ChevronRightIcon boxSize={6} />} size="lg">
              Try 31 Days Free
            </Button>
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
    </Container>
  );
};

export default HomePage;
