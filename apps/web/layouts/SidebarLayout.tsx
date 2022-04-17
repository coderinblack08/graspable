import {
  Avatar,
  Box,
  Button,
  Container,
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
  HiOutlineChartBar,
  HiOutlineChevronDown,
  HiOutlineHome,
  HiOutlineSearch,
  HiOutlineSelector,
  HiOutlineUsers,
  HiOutlineViewGrid,
} from "react-icons/hi";
import useSWR, { useSWRConfig } from "swr";
import { auth } from "../lib/firebase-client";
import { User } from "../types";

interface SidebarLayoutProps {}

export const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const router = useRouter();
  // const [user, loading, error] = useAuthState(auth);
  const { cache } = useSWRConfig();
  const { data: user } = useSWR<User>("/api/auth/account");

  return (
    <Flex h="100vh" bg="gray.50">
      <Flex
        flexShrink={0}
        flexDir="column"
        justify="space-between"
        as="nav"
        h="full"
        w="xs"
        bg="white"
        borderRight="solid 2px"
        borderColor="gray.100"
      >
        <Box px={4} py={8}>
          <NextLink href="/" passHref>
            <Link display="inline-flex">
              <Image h={6} src="/logo.svg" alt="graspable" />
            </Link>
          </NextLink>
          <InputGroup my={3}>
            <InputLeftElement pointerEvents="none">
              <Icon as={HiOutlineSearch} boxSize={5} color="gray.300" />
            </InputLeftElement>
            <Input rounded="xl" placeholder="Search" />
            <InputRightElement mr={3}>
              <HStack spacing={1} color="gray.500">
                <Kbd>⌘</Kbd>
                <Kbd>K</Kbd>
              </HStack>
            </InputRightElement>
          </InputGroup>
          <VStack>
            <Button
              color="gray.600"
              rounded="xl"
              leftIcon={<Icon as={HiOutlineHome} boxSize={6} />}
              w="full"
              justifyContent="left"
            >
              Dashboard
            </Button>

            <Button
              color="gray.600"
              rounded="xl"
              variant="ghost"
              leftIcon={<Icon as={HiOutlineChartBar} boxSize={6} />}
              w="full"
              justifyContent="left"
            >
              Leaderboard
            </Button>

            <Button
              color="gray.600"
              rounded="xl"
              variant="ghost"
              leftIcon={<Icon as={HiOutlineViewGrid} boxSize={6} />}
              w="full"
              justifyContent="left"
            >
              Marketplace
            </Button>

            <Button
              color="gray.600"
              rounded="xl"
              variant="ghost"
              w="full"
              rightIcon={
                <Icon ml="auto" as={HiOutlineChevronDown} boxSize={5} />
              }
              justifyContent="space-between"
            >
              <HStack>
                <Icon as={HiOutlineBookOpen} boxSize={6} />
                <Text>Courses</Text>
              </HStack>
            </Button>

            <Button
              color="gray.600"
              rounded="xl"
              variant="ghost"
              w="full"
              rightIcon={
                <Icon ml="auto" as={HiOutlineChevronDown} boxSize={5} />
              }
              justifyContent="space-between"
            >
              <HStack>
                <Icon as={HiOutlineUsers} boxSize={6} />
                <Text>Cohorts</Text>
              </HStack>
            </Button>
          </VStack>
        </Box>
        <Menu placement="top">
          <MenuButton borderTop="solid 2px" borderColor="gray.100" p={5}>
            <Flex justifyContent="space-between" alignItems="center">
              <HStack spacing={4}>
                <Avatar name={user?.name} />
                <Box>
                  <Text fontSize="lg" fontWeight="bold">
                    {user?.name}
                  </Text>
                  <Text color="gray.500">Free Trial</Text>
                </Box>
              </HStack>
              <Icon as={HiOutlineSelector} boxSize={7} color="gray.500" />
            </Flex>
          </MenuButton>
          <MenuList w={`19rem`}>
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
      <Container w="full" px={8} py={20} maxW="4xl">
        {children}
      </Container>
    </Flex>
  );
};
