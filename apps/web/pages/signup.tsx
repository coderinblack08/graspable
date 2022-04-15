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
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { BasicLayout } from "../layouts/BasicLayout";
import { auth, db } from "../lib/firebase";

const SignupPage = () => {
  const { register, handleSubmit } = useForm();
  const router = useRouter();

  return (
    <BasicLayout>
      <Box p={5} maxW="2xl" mx="auto" py={32}>
        <Heading fontSize="3xl" as="h1">
          Create an account
        </Heading>
        <VStack
          mt={4}
          as="form"
          onSubmit={handleSubmit(async ({ email, password, role, name }) => {
            try {
              const { user } = await createUserWithEmailAndPassword(
                auth,
                email,
                password
              );
              await updateProfile(user, { displayName: name });
              await setDoc(doc(db, "users", user.uid), {
                email,
                password,
                role,
                name,
              });
              await sendEmailVerification(user);
              router.push("/dashboard");
            } catch (error) {
              console.error(error);
            }
          })}
        >
          <Select size="lg" defaultValue="teacher" {...register("role")}>
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
