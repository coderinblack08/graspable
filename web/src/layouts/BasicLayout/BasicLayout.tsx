import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  Link as ChakraLink,
  Avatar,
  Button,
  Container,
  Divider,
  Flex,
  HStack,
  Image,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  useToken,
} from "@chakra-ui/react";
import { useAuth } from "@redwoodjs/auth";
import { Link, navigate, routes } from "@redwoodjs/router";

type BasicLayoutProps = {
  children?: React.ReactNode;
};

const BasicLayout = ({ children }: BasicLayoutProps) => {
  const { isAuthenticated, logOut } = useAuth();
  const gray300 = useToken("colors", "gray.300");

  return (
    <Container maxW="5xl">
      <Flex align="center" justify="space-between" p={4} as="nav">
        <Link to={routes.home()}>
          <Image h={6} src="/logo.svg" alt="graspable" />
        </Link>
        <HStack spacing={5}>
          <Button
            px={0}
            color="gray.600"
            variant="ghost"
            fontWeight="normal"
            rightIcon={<ChevronDownIcon boxSize="20px" />}
          >
            Products
          </Button>
          <Button
            px={0}
            color="gray.600"
            variant="ghost"
            fontWeight="normal"
            rightIcon={<ChevronDownIcon boxSize="20px" />}
          >
            Resources
          </Button>
          <ChakraLink color="gray.600">Pricing</ChakraLink>
          {isAuthenticated ? (
            <>
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
            </>
          ) : (
            <>
              <Divider
                sx={{ borderColor: gray300 }}
                orientation="vertical"
                h={6}
              />
              <ChakraLink color="gray.600" to={routes.login()} as={Link}>
                Login
              </ChakraLink>
              <Link to={routes.signup()}>
                <Button color="gray.600" variant="outline">
                  Register
                </Button>
              </Link>
            </>
          )}
        </HStack>
      </Flex>
      {children}
    </Container>
  );
};

export default BasicLayout;
