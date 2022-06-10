import {
  AppShell,
  Box,
  Button,
  Group,
  Header,
  PasswordInput,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import axios from "axios";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth, useFirestore } from "reactfire";

const SignupPage = () => {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      password: "",
    },
    validate: {
      email: (value: string) =>
        /^\S+@\S+$/.test(value) ? null : "Invalid email",
    },
  });

  const onSubmit = form.onSubmit(async ({ email, name, password }) => {
    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(user, { displayName: name });
      await setDoc(doc(firestore, "users", user.uid), { email, name });
      await sendEmailVerification(user);
      await axios.post("/api/auth/login", null, {
        headers: {
          authorization: await user.getIdToken(),
        },
        withCredentials: true,
      });
      router.push("/app");
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <AppShell
      header={
        <Header height="auto" p="md">
          <Group position="apart" align="center">
            <Title order={5}>Graspable</Title>
            <Box>
              <Link href="/signup" passHref>
                <Button component="a" color="gray" compact variant="subtle">
                  Sign Up
                </Button>
              </Link>
              <Link href="/login" passHref>
                <Button component="a" color="gray" compact variant="subtle">
                  Log In
                </Button>
              </Link>
            </Box>
          </Group>
        </Header>
      }
    >
      <Box sx={{ maxWidth: "32rem" }} py="4rem" mx="auto">
        <form onSubmit={onSubmit}>
          <Stack spacing="md">
            <TextInput
              required
              label="Name"
              placeholder="John Doe"
              {...form.getInputProps("name")}
            />
            <TextInput
              required
              label="Email"
              placeholder="your@email.com"
              {...form.getInputProps("email")}
            />
            <PasswordInput
              required
              label="Password"
              placeholder="Password"
              {...form.getInputProps("password")}
            />
            <Button type="submit">Submit</Button>
          </Stack>
        </form>
      </Box>
    </AppShell>
  );
};

export default SignupPage;
