import type { NextPage } from "next";
import { Button } from "../components/Button";
import { Input } from "../components/Input";

const HomePage: NextPage = () => {
  return (
    <div className="flex items-center justify-center bg-gray-900 h-screen">
      <form className="grid gap-4 p-4 max-w-md mx-auto w-full text-gray-500">
        <Button>Sign in with Google</Button>
        <Input type="email" placeholder="Email address" />
        <Input type="password" placeholder="Password" />
        <a
          className="inline-flex items-center gap-2 focus:outline-none"
          href="#"
        >
          <div>Forgot password?</div>
        </a>
        <Button variant="secondary">Register</Button>
      </form>
    </div>
  );
};

export default HomePage;
