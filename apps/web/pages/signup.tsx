import {
  Box,
  Button,
  Heading,
  Input,
  Link,
  Select,
  Text,
  VStack,
} from "@chakra-ui/react";
import { BasicLayout } from "../layouts/BasicLayout";
import { useForm } from "react-hook-form";

const SignupPage = () => {
  const { register, handleSubmit } = useForm();

  return (
    <BasicLayout>
      <Box p={5} maxW="2xl" mx="auto" py={32}>
        {/* <Heading fontSize="3xl" as="h1">
              Confirm your email
            </Heading>
            <Text fontSize="lg" color="gray.600" mt={3}>
              Check your inbox for an email to confirm your new account. Welcome
              to Graspable!
            </Text> */}
        <Heading fontSize="3xl" as="h1">
          Create an account
        </Heading>
        <VStack
          mt={4}
          as="form"
          onSubmit={handleSubmit(async (data) => {
            console.log(data);
          })}
        >
          <Select size="lg" {...register("role")}>
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
          </Select>
          <Input size="lg" placeholder="Full Name" {...register("name")} />
          <Input size="lg" placeholder="Email" {...register("email")} />
          <Input
            size="lg"
            type="password"
            placeholder="Password"
            {...register("password")}
          />
          <Button size="lg" type="submit" w="full">
            Register
          </Button>
          <Text w="full">
            By registering, you agree to the{" "}
            <Link color="blue.500">Terms of Service</Link>
          </Text>
        </VStack>
      </Box>
    </BasicLayout>
  );
};

export default SignupPage;
