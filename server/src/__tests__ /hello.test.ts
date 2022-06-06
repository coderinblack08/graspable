import { PrismaClient } from "@prisma/client";
import { graphqlCall } from "./graphql-call";

const client = new PrismaClient();

afterAll(async () => {
  await client.$disconnect();
});

const helloQuery = `
  query {
    hello
  }
`;

it("query hello", async () => {
  const response = await graphqlCall({ source: helloQuery });
  console.log(response);
  expect(response).toBe("Hello World!");
});
