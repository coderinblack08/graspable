import {
  Box,
  Button,
  Heading,
  Input,
  Link,
  Text,
  VStack,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { BasicLayout } from "../layouts/BasicLayout";

const SignupPage = () => {
  const onSubmit = async (data: any) => {};

  return (
    <BasicLayout>
      <Box p={5} maxW="2xl" mx="auto" py={32}>
        <Heading fontSize="3xl" as="h1">
          Log in to your account
        </Heading>
        <Text w="full" mt={2}>
          Don&apos;t have an account?{" "}
          <NextLink href="/signup" passHref>
            <Link color="blue.500">Sign Up</Link>
          </NextLink>
        </Text>
        <VStack mt={4} onSubmit={onSubmit}>
          <Input size="lg" name="email" placeholder="Email" />
          <Input
            size="lg"
            type="password"
            name="password"
            placeholder="Password"
          />
          <Button size="lg" type="submit" w="full">
            Sign In
          </Button>
        </VStack>
      </Box>
    </BasicLayout>
  );
};

export default SignupPage;
