import {
  Box,
  Button,
  Heading,
  Input,
  Link as ChakraLink,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useAuth } from "@redwoodjs/auth";
import { Form, PasswordField, Submit, TextField } from "@redwoodjs/forms";
import { Link, navigate, routes } from "@redwoodjs/router";
import { MetaTags } from "@redwoodjs/web";
import { useState } from "react";

const SignupPage = () => {
  const { logIn } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: any) => {
    setError(null);
    setLoading(true);
    try {
      const response = await logIn({
        email: data.email,
        password: data.password,
      });
      console.log("response: ", response);
      if (response?.error?.message) {
        setError(response.error.message);
      } else {
        navigate(routes.dashboard());
      }
    } catch (error) {
      console.error("error:  ", error);
      setError(error.message);
    }
    setLoading(false);
  };

  return (
    <Box p={5} maxW="2xl" mx="auto" py={32}>
      <MetaTags title="Login" />
      <Heading fontSize="3xl" as="h1">
        Log in to your account
      </Heading>
      <Text w="full" mt={2}>
        Don&apos;t have an account?{" "}
        <ChakraLink to={routes.signup()} color="blue.500" as={Link}>
          Sign Up
        </ChakraLink>
      </Text>
      <VStack as={Form} mt={4} onSubmit={onSubmit}>
        {error && <Text color="red.500">{error}</Text>}
        <Input size="lg" as={TextField} name="email" placeholder="Email" />
        <Input
          size="lg"
          as={PasswordField}
          name="password"
          placeholder="Password"
        />
        <Button
          size="lg"
          as={Submit}
          type="submit"
          w="full"
          isLoading={loading}
        >
          Sign In
        </Button>
      </VStack>
    </Box>
  );
};

export default SignupPage;
