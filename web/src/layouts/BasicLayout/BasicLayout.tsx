import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  Button,
  Container,
  Divider,
  Flex,
  HStack,
  Image,
  Link,
} from "@chakra-ui/react";
import { routes } from "@redwoodjs/router";

type BasicLayoutProps = {
  children?: React.ReactNode;
};

const BasicLayout = ({ children }: BasicLayoutProps) => {
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
          <Divider orientation="vertical" h={6} />
          <Link>Login</Link>
          <Button href={routes.signup()} as="a" variant="outline">
            Register
          </Button>
        </HStack>
      </Flex>

      {children}
    </Container>
  );
};

export default BasicLayout;
