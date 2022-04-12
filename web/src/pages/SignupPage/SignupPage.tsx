import {
  Box,
  Button,
  Heading,
  Input,
  Link,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useAuth } from "@redwoodjs/auth";
import { Form, TextField, PasswordField, Submit } from "@redwoodjs/forms";
import { navigate, routes } from "@redwoodjs/router";
import { MetaTags } from "@redwoodjs/web";
import { useState } from "react";

const SignupPage = () => {
  const { client } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const onSubmit = async (data: any) => {
    setError(null);
    setLoading(true);
    try {
      const response = await client.auth.signUp({
        email: data.email,
        password: data.password,
      });
      console.log("response: ", response);
      if (response?.error?.message) {
        setError(response.error.message);
      } else {
        setShowSuccess(true);
        // navigate(routes.home());
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
      {showSuccess ? (
        <>
          <Heading fontSize="3xl" as="h1">
            Confirm your email
          </Heading>
          <Text fontSize="lg" color="gray.600" mt={3}>
            Check your inbox for an email to confirm your new account. Welcome
            to Graspable!
          </Text>
        </>
      ) : (
        <>
          <Heading fontSize="3xl" as="h1">
            Create an account
          </Heading>
          <VStack as={Form} mt={4} onSubmit={onSubmit}>
            {error && <Text color="red.500">{error}</Text>}
            <Input
              as={TextField}
              size="lg"
              name="name"
              placeholder="Full Name"
            />
            <Input as={TextField} size="lg" name="email" placeholder="Email" />
            <Input
              as={PasswordField}
              size="lg"
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
              Register
            </Button>
            <Text w="full">
              By registering, you agree to the{" "}
              <Link color="blue.500">Terms of Service</Link>
            </Text>
          </VStack>
        </>
      )}
    </Box>
  );
};

export default SignupPage;
