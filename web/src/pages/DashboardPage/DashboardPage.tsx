import { SearchIcon } from "@chakra-ui/icons";
import { HiMenu, HiOutlineBell } from "react-icons/hi";
import {
  Avatar,
  Box,
  Button,
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
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Tag,
} from "@chakra-ui/react";
import { useAuth } from "@redwoodjs/auth";
import { Link, navigate, routes } from "@redwoodjs/router";
import React from "react";

const DashboardPage: React.FC = () => {
  const { logOut } = useAuth();

  return (
    <Box bg="gray.50" h="100vh">
      <Box
        as="nav"
        w="full"
        bg="white"
        borderBottom="2px solid"
        borderColor="gray.100"
      >
        <Box mx="auto" maxW="6xl">
          <Grid
            gap={8}
            templateColumns="1fr 2fr 1fr"
            borderBottom="1px solid"
            borderColor="gray.100"
          >
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

            <GridItem pl={8} py={4}>
              <HStack justify="end" spacing={4}>
                <HStack spacing={0}>
                  <IconButton
                    aria-label="Menu"
                    color="gray.400"
                    icon={<Icon as={HiMenu} boxSize={6} />}
                    variant="ghost"
                  />
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
    </Box>
  );
};

export default DashboardPage;
