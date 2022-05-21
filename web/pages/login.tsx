import { Form, Formik } from "formik";
import type { NextPage } from "next";
import { Button } from "../components/Button";
import { InputField } from "../components/Input";
import { useLoginMutation } from "../generated/graphql";

const HomePage: NextPage = () => {
  const [login, { loading }] = useLoginMutation();

  return (
    <div className="flex h-screen items-center justify-center bg-gray-900">
      <Formik
        initialValues={{ email: "", password: "" }}
        onSubmit={async ({ email, password }) => {
          const { data } = await login({ variables: { email, password } });
          console.log(data);
        }}
      >
        <Form className="mx-auto grid w-full max-w-md gap-4 p-4 text-gray-500">
          <Button type="button">Sign in with Google</Button>
          <InputField name="email" type="email" placeholder="Email address" />
          <InputField name="password" type="password" placeholder="Password" />
          <a
            className="inline-flex w-auto items-center gap-2 hover:underline focus:outline-none"
            href="#"
          >
            Forgot Password?
          </a>
          <Button isLoading={loading} type="submit" variant="secondary">
            Login
          </Button>
        </Form>
      </Formik>
    </div>
  );
};

export default HomePage;
