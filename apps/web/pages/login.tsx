import {
  Box,
  Button,
  Heading,
  Input,
  Link,
  Text,
  VStack,
} from "@chakra-ui/react";
import axios from "axios";
import { signInWithEmailAndPassword } from "firebase/auth";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { BasicLayout } from "../layouts/BasicLayout";
import { auth } from "../lib/firebase-client";

const SignupPage = () => {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();
  const router = useRouter();

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
        <VStack
          mt={4}
          as="form"
          onSubmit={handleSubmit(async ({ email, password }) => {
            try {
              const { user } = await signInWithEmailAndPassword(
                auth,
                email,
                password
              );
              await axios.post("/api/auth/login", null, {
                headers: {
                  authorization: await user.getIdToken(),
                },
                withCredentials: true,
              });
              router.push("/dashboard");
            } catch (error) {
              console.error(error);
            }
          })}
        >
          <Input size="lg" placeholder="Email" {...register("email")} />
          <Input
            size="lg"
            type="password"
            placeholder="Password"
            {...register("password")}
          />
          <Button isLoading={isSubmitting} size="lg" type="submit" w="full">
            Sign In
          </Button>
        </VStack>
      </Box>
    </BasicLayout>
  );
};

export default SignupPage;
