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
import NextLink from "next/link";
import { HiMenu, HiOutlineSearch } from "react-icons/hi";

interface NavbarLayoutProps {}

export const NavbarLayout: React.FC<NavbarLayoutProps> = ({ children }) => {
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
                    <Avatar size="sm" boxSize={9} />
                  </MenuButton>
                  <MenuList>
                    <MenuItem>Settings</MenuItem>
                    <MenuItem>Subscription</MenuItem>
                    <MenuDivider />
                    <MenuItem>Log Out</MenuItem>
                  </MenuList>
                </Menu>
              </HStack>
            </GridItem>
          </Grid>
        </Box>
      </Box>

      <Container maxW="5xl" py={16} px={5}>
        {children}
      </Container>
    </Box>
  );
};
