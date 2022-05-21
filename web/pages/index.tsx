import { Form, Formik } from "formik";
import type { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "../components/Button";
import { InputField } from "../components/Input";
import { useRegisterMutation } from "../generated/graphql";

const HomePage: NextPage = () => {
  const [register, { loading }] = useRegisterMutation();
  const router = useRouter();

  return (
    <div className="flex h-screen items-center justify-center bg-gray-900">
      <Formik
        initialValues={{ name: "", email: "", password: "" }}
        onSubmit={async (values) => {
          const { data } = await register({ variables: { options: values } });
          console.log(data);
          router.push("/app");
        }}
      >
        <Form className="mx-auto grid w-full max-w-md gap-4 p-4 text-gray-500">
          <Button type="button">Sign up with Google</Button>
          <InputField name="name" type="text" placeholder="Name" />
          <InputField name="email" type="email" placeholder="Email address" />
          <InputField name="password" type="password" placeholder="Password" />
          <Link href="/login" passHref>
            <a className="inline-flex w-auto items-center gap-2 hover:underline focus:outline-none">
              Already have an account?
            </a>
          </Link>
          <Button isLoading={loading} type="submit" variant="secondary">
            Register
          </Button>
        </Form>
      </Formik>
    </div>
  );
};

export default HomePage;
