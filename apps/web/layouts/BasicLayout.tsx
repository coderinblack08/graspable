import React from "react";
import { MdKeyboardArrowDown } from "react-icons/md";
import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  HStack,
  Icon,
  IconButton,
  Image,
  Link as ChakraLink,
  Link,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  useToken,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { HiMenu } from "react-icons/hi";

type BasicLayoutProps = {
  children?: React.ReactNode;
};

export const BasicLayout: React.FC = ({ children }: BasicLayoutProps) => {
  const gray300 = useToken("colors", "gray.300");

  return (
    <Container maxW="5xl" px={0}>
      <Flex align="center" justify="space-between" p={4} as="nav">
        <NextLink href="/" passHref>
          <Link>
            <Image h={{ base: 5, sm: 6 }} src="/logo.svg" alt="graspable" />
          </Link>
        </NextLink>
        <HStack spacing={5} display={{ base: "none", lg: "flex" }}>
          <Button
            px={0}
            color="gray.600"
            variant="ghost"
            fontWeight="normal"
            rightIcon={<Icon as={MdKeyboardArrowDown} boxSize="20px" />}
          >
            Products
          </Button>
          <Button
            px={0}
            color="gray.600"
            variant="ghost"
            fontWeight="normal"
            rightIcon={<Icon as={MdKeyboardArrowDown} boxSize="20px" />}
          >
            Resources
          </Button>
          <ChakraLink color="gray.600">Pricing</ChakraLink>
          <Divider sx={{ borderColor: gray300 }} orientation="vertical" h={6} />
          <NextLink href="/login" passHref>
            <Link color="gray.600">Log In</Link>
          </NextLink>
          <NextLink href="/signup" passHref>
            <Link>
              <Button color="gray.600" variant="outline">
                Sign Up
              </Button>
            </Link>
          </NextLink>
        </HStack>

        <Menu>
          <MenuButton
            as={IconButton}
            variant="outline"
            display={{ base: "block", lg: "none" }}
            icon={<Icon as={HiMenu} boxSize={5} />}
            aria-label="menu"
          />
          <MenuList>
            <MenuItem>Products</MenuItem>
            <MenuItem>Resources</MenuItem>
            <MenuItem>Pricing</MenuItem>
            <MenuDivider />
            <NextLink href="/login" passHref>
              <MenuItem as="a">Log In</MenuItem>
            </NextLink>
            <NextLink href="/signup" passHref>
              <MenuItem as="a">Sign Up</MenuItem>
            </NextLink>
          </MenuList>
        </Menu>
      </Flex>
      <Box px={4}>{children}</Box>
    </Container>
  );
};
