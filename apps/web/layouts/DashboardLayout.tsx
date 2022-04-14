import { HiMenu, HiSearch } from "react-icons/hi";
import NextLink from "next/link";
import {
  Avatar,
  Box,
  Flex,
  Grid,
  GridItem,
  HStack,
  Icon,
  Link,
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

interface DashboardLayoutProps {}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
}) => {
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
              <NextLink href="/dashboard" passHref>
                <Link>
                  <Image h={6} src="/logo.svg" alt="graspable" />
                </Link>
              </NextLink>
            </GridItem>

            <GridItem py={4} h="full" algin="center" justify="center" as={Flex}>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={HiSearch} boxSize={4} color="gray.300" />
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
      {children}
    </Box>
  );
};
