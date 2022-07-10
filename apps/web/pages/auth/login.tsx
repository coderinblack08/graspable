import {
  AppShell,
  Box,
  Button,
  Group,
  Header,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { GetServerSideProps, NextPage } from "next";
import { BuiltInProviderType } from "next-auth/providers";
import {
  ClientSafeProvider,
  getCsrfToken,
  getProviders,
  LiteralUnion,
  signIn,
  useSession,
} from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FaGithub, FaGoogle } from "react-icons/fa";

const LoginPage: NextPage<{
  providers: Record<
    LiteralUnion<BuiltInProviderType, string>,
    ClientSafeProvider
  > | null;
  csrfToken: string | null;
}> = ({ csrfToken, providers }) => {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <AppShell
      header={
        <Header height="auto" p="md" sx={{ backgroundColor: "transparent" }}>
          <Group position="apart" align="center">
            <Title order={5}>Graspable</Title>
            <Box>
              <Link href="/docs" passHref>
                <Button component="a" color="dark" compact variant="subtle">
                  Documentation
                </Button>
              </Link>
              <Link href="/pricing" passHref>
                <Button component="a" color="dark" compact variant="subtle">
                  Pricing
                </Button>
              </Link>
              <Link href="/auth/login" passHref>
                <Button ml="sm" component="a" compact>
                  Login
                </Button>
              </Link>
            </Box>
          </Group>
        </Header>
      }
    >
      <Stack align="center" sx={{ maxWidth: "32rem" }} py="4rem" mx="auto">
        <Title order={2}>Log in to Graspable</Title>
        {providers && (
          <>
            <Button
              color="dark"
              variant="default"
              leftIcon={<FaGoogle size={16} />}
              onClick={() =>
                signIn("google", {
                  callbackUrl:
                    router.query.redirect?.toString() || "/dashboard",
                })
              }
              sx={(theme) => ({ fontSize: theme.fontSizes.md })}
              size="lg"
              fullWidth
            >
              Continue with Google
            </Button>
            <Button
              color="dark"
              variant="default"
              leftIcon={<FaGithub size={16} />}
              size="lg"
              onClick={() =>
                signIn("github", {
                  callbackUrl:
                    router.query.redirect?.toString() || "/dashboard",
                })
              }
              sx={(theme) => ({ fontSize: theme.fontSizes.md })}
              fullWidth
            >
              Continue with GitHub
            </Button>
          </>
        )}
        <Text>
          By clicking continue, you agree to our{" "}
          <Text component="a" color="blue" href="#">
            Terms of Service
          </Text>{" "}
          and{" "}
          <Text component="a" color="blue" href="#">
            Privacy Policy
          </Text>
          .
        </Text>
      </Stack>
    </AppShell>
  );
};

export default LoginPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const providers = await getProviders();
  const csrfToken = await getCsrfToken(context);
  return {
    props: {
      providers,
      csrfToken,
    },
  };
};
