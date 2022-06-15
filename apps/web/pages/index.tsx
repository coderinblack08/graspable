import { Box, Button } from "@mantine/core";
import Link from "next/link";
import React from "react";

const HomePage: React.FC = () => {
  return (
    <Box p="1rem">
      <Link href="/auth/login" passHref>
        <Button component="a">Redirect me to login</Button>
      </Link>
    </Box>
  );
};

export default HomePage;
