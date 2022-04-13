import { AddIcon, SearchIcon } from "@chakra-ui/icons";
import {
  Avatar,
  Box,
  Button,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Kbd,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import { useAuth } from "@redwoodjs/auth";
import { Link, navigate, routes } from "@redwoodjs/router";
import { MetaTags } from "@redwoodjs/web";
import React from "react";
import { HiMenu } from "react-icons/hi";

const DashboardPage: React.FC = () => {
  const { logOut } = useAuth();

  return (
    <Box bg="gray.50" h="100vh">
      <MetaTags title="Dashboard" />
      <Box
        as="nav"
        w="full"
        bg="white"
        borderBottom="2px solid"
        borderColor="gray.100"
      >
        <Box mx="auto" maxW="5xl">
          <Grid templateColumns="1fr 2fr 1fr">
            <GridItem align="center" as={Flex} pl={8} py={4}>
              <Link to={routes.dashboard()}>
                <Image h={6} src="/logo.svg" alt="graspable" />
              </Link>
            </GridItem>

            <GridItem py={4} h="full" algin="center" justify="center" as={Flex}>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <SearchIcon boxSize={4} color="gray.300" />
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
                    <MenuItem
                      onClick={() => {
                        logOut();
                        navigate(routes.home());
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
      <Box>
        <Container maxW="5xl" px={8} py={20}>
          <Flex justify="space-between" align="center">
            <Heading size="lg" as="h1">
              Courses
            </Heading>
            <Button bg="gray.200" leftIcon={<AddIcon boxSize={3} />}>
              Add Course
            </Button>
          </Flex>
          <Box
            px={8}
            py={20}
            mt={6}
            bg="white"
            rounded="2xl"
            border="2px solid"
            borderColor="gray.100"
            fontFamily="mono"
            textAlign="center"
            color="gray.400"
            fontSize="lg"
            lineHeight="taller"
          >
            ʕ•́ᴥ•̀ʔっ No Courses Present
            <br /> Click on + Add Course To Begin
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default DashboardPage;
