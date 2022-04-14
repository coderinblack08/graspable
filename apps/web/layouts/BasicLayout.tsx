import React from "react";
import { MdKeyboardArrowDown } from "react-icons/md";
import {
  Button,
  Container,
  Divider,
  Flex,
  HStack,
  Icon,
  Image,
  Link as ChakraLink,
  Link,
  useToken,
} from "@chakra-ui/react";
import NextLink from "next/link";

type BasicLayoutProps = {
  children?: React.ReactNode;
};

export const BasicLayout: React.FC = ({ children }: BasicLayoutProps) => {
  const gray300 = useToken("colors", "gray.300");

  return (
    <Container maxW="5xl">
      <Flex align="center" justify="space-between" p={4} as="nav">
        <NextLink href="/" passHref>
          <Link>
            <Image h={6} src="/logo.svg" alt="graspable" />
          </Link>
        </NextLink>
        <HStack spacing={5}>
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
      </Flex>
      {children}
    </Container>
  );
};
