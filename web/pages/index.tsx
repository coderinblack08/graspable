import { Form, Formik } from "formik";
import type { NextPage } from "next";
import { Button } from "../components/Button";
import { InputField } from "../components/Input";
import { useRegisterMutation } from "../generated/graphql";

const HomePage: NextPage = () => {
  const [register, { loading }] = useRegisterMutation();

  return (
    <div className="flex h-screen items-center justify-center bg-gray-900">
      <Formik
        initialValues={{ name: "", email: "", password: "" }}
        onSubmit={async (values) => {
          const { data } = await register({ variables: { options: values } });
          console.log(data);
        }}
      >
        <Form className="mx-auto grid w-full max-w-md gap-4 p-4 text-gray-500">
          <Button type="button">Sign in with Google</Button>
          <InputField name="name" type="text" placeholder="Name" />
          <InputField name="email" type="email" placeholder="Email address" />
          <InputField name="password" type="password" placeholder="Password" />
          <a
            className="inline-flex w-auto items-center gap-2 hover:underline focus:outline-none"
            href="#"
          >
            Already have an account?
          </a>
          <Button isLoading={loading} type="submit" variant="secondary">
            Register
          </Button>
        </Form>
      </Formik>
    </div>
  );
};

export default HomePage;
