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
        <Header height="auto" p="md">
          <Group position="apart" align="center">
            <Title order={5}>Graspable</Title>
            <Box>
              <Link href="/docs" passHref>
                <Button component="a" color="gray" compact variant="subtle">
                  Documentation
                </Button>
              </Link>
              <Link href="/pricing" passHref>
                <Button component="a" color="gray" compact variant="subtle">
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
        <Title mb="xs" order={2}>
          Log in to Graspable
        </Title>
        {JSON.stringify(session, null, 2)}
        {JSON.stringify(providers, null, 2)}
        {providers && (
          <>
            <Button
              color="gray"
              variant="default"
              leftIcon={<FaGoogle size={16} />}
              sx={(theme) => ({ fontSize: theme.fontSizes.md })}
              size="lg"
              fullWidth
              disabled
            >
              Continue with Google
            </Button>
            <Button
              color="gray"
              variant="default"
              leftIcon={<FaGithub size={16} />}
              size="lg"
              onClick={() => signIn("github")}
              sx={(theme) => ({ fontSize: theme.fontSizes.md })}
              fullWidth
            >
              Continue with GitHub
            </Button>
          </>
        )}
        <Text>
          By clicking continue, you agree to our{" "}
          <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
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
