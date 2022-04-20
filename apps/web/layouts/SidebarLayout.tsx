import {
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Flex,
  HStack,
  Icon,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Kbd,
  Link,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
  VStack,
} from "@chakra-ui/react";
import axios from "axios";
import { signOut } from "firebase/auth";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React from "react";
import {
  HiOutlineBookOpen,
  HiOutlineHome,
  HiOutlineQuestionMarkCircle,
  HiOutlineSearch,
  HiOutlineViewGrid,
} from "react-icons/hi";
import useSWR, { useSWRConfig } from "swr";
import { auth } from "../lib/firebase-client";
import { Course, User } from "../types";

interface SidebarLayoutProps {}

export const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const router = useRouter();
  // const [user, loading, error] = useAuthState(auth);
  const { cache } = useSWRConfig();
  const { data: user } = useSWR<User>("/api/auth/account");
  const { data: courses } = useSWR<Course[]>("/api/courses");

  return (
    <Flex h="100vh">
      <Flex
        flexShrink={0}
        flexDir="column"
        justify="space-between"
        as="nav"
        h="full"
        w="xs"
        borderRight="solid 2px"
        borderColor="gray.100"
      >
        <Box px={3} py={7}>
          <NextLink href="/dashboard" passHref>
            <Link display="inline-block" userSelect="none">
              <Image h={6} src="/logo.svg" alt="graspable" />
            </Link>
          </NextLink>
          <InputGroup w="full" userSelect="none" my={3}>
            <InputLeftElement pointerEvents="none">
              <Icon as={HiOutlineSearch} boxSize={5} color="gray.300" />
            </InputLeftElement>
            <Input rounded="xl" placeholder="Search" bg="white" />
            <InputRightElement mr={3}>
              <HStack spacing={1} color="gray.500">
                <Kbd>⌘</Kbd>
                <Kbd>K</Kbd>
              </HStack>
            </InputRightElement>
          </InputGroup>
          <VStack align="left">
            <NextLink href="/dashboard" passHref>
              <Button
                color="gray.600"
                rounded="lg"
                leftIcon={<Icon as={HiOutlineHome} boxSize={6} />}
                w="full"
                justifyContent="left"
                as="a"
              >
                Dashboard
              </Button>
            </NextLink>

            <Button
              color="gray.500"
              rounded="lg"
              variant="ghost"
              leftIcon={<Icon as={HiOutlineViewGrid} boxSize={6} />}
              w="full"
              justifyContent="left"
            >
              Marketplace
            </Button>

            <Button
              color="gray.500"
              rounded="lg"
              variant="ghost"
              leftIcon={<Icon as={HiOutlineQuestionMarkCircle} boxSize={6} />}
              w="full"
              justifyContent="left"
            >
              Help Center
            </Button>

            {(courses?.length || 0) > 0 && (
              <Divider borderColor="gray.100" border="1px solid" />
            )}

            {courses?.map((course) => (
              <Button
                key={course.id}
                color="gray.500"
                w="full"
                variant="ghost"
                leftIcon={<Icon as={HiOutlineBookOpen} boxSize={6} />}
                justifyContent="left"
              >
                {course.name}
              </Button>
            ))}
          </VStack>
        </Box>
        <Menu placement="top">
          <MenuButton
            p={4}
            userSelect="none"
            borderTop="2px solid"
            borderColor="gray.100"
          >
            <HStack spacing={4}>
              <Avatar rounded="lg" name={user?.name} size="md" boxSize={10} />
              <Text fontSize="lg" fontWeight="bold">
                Kevin Lu
              </Text>
            </HStack>
          </MenuButton>
          <MenuList w="19rem">
            <MenuItem>Settings</MenuItem>
            <MenuItem>Subscription</MenuItem>
            <MenuDivider />
            <MenuItem
              onClick={async () => {
                await signOut(auth);
                await axios.post("/api/auth/logout", null, {
                  withCredentials: true,
                });
                cache.clear();
                router.push("/");
              }}
            >
              Log Out
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
      <Container bg="gray.50" px={8} py={16} maxW="5xl">
        {children}
      </Container>
    </Flex>
  );
};
