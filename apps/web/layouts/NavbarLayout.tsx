import {
  Avatar,
  Box,
  Container,
  Flex,
  Grid,
  GridItem,
  HStack,
  Icon,
  IconButton,
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
} from "@chakra-ui/react";
import axios from "axios";
import { signOut } from "firebase/auth";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { HiMenu, HiOutlineSearch } from "react-icons/hi";
import useSWR, { useSWRConfig } from "swr";
import { auth } from "../lib/firebase-client";
import { User } from "../types";

interface NavbarLayoutProps {}

export const NavbarLayout: React.FC<NavbarLayoutProps> = ({ children }) => {
  const router = useRouter();
  // const [user, loading, error] = useAuthState(auth);
  const { cache } = useSWRConfig();
  const { data: user } = useSWR<User>("/api/auth/account");

  return (
    <Box bg="gray.50" h="100vh">
      <Box
        as="nav"
        w="full"
        bg="white"
        borderBottom="2px solid"
        borderColor="gray.100"
      >
        <Box mx="auto" maxW="7xl">
          <Grid templateColumns="1fr 2fr 1fr">
            <GridItem align="center" as={Flex} pl={8} py={4}>
              <NextLink href="/dashboard" passHref>
                <Link>
                  <Image h={6} src="/logo.svg" alt="graspable" />
                </Link>
              </NextLink>
            </GridItem>

            <GridItem py={4} h="full" algin="center" justify="center" as={Flex}>
              <InputGroup>
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
            </GridItem>

            <GridItem pr={8} py={4}>
              <HStack justify="end" spacing={4}>
                <HStack spacing={0}>
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      aria-label="Menu"
                      color="gray.400"
                      icon={<Icon as={HiMenu} boxSize={6} />}
                      variant="ghost"
                    />
                    <MenuList>
                      <MenuItem>Home</MenuItem>
                      <MenuItem>Grades</MenuItem>
                      <MenuItem>Subscription</MenuItem>
                      <MenuItem>Marketplace</MenuItem>
                    </MenuList>
                  </Menu>
                </HStack>
                <Menu>
                  <MenuButton>
                    <Avatar name={user?.name} size="md" boxSize={10} />
                  </MenuButton>
                  <MenuList>
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
              </HStack>
            </GridItem>
          </Grid>
        </Box>
      </Box>

      <Container maxW="4xl" py={20} px={5}>
        {children}
      </Container>
    </Box>
  );
};
