import "reflect-metadata";
import { graphql } from "graphql";
import { Maybe } from "graphql/jsutils/Maybe";
import { createSchema } from "../create-schema";

interface Options {
  source: string;
  variableValues?: Maybe<{ [key: string]: any }>;
  userId?: number;
}

export const graphqlCall = async ({
  source,
  userId,
  variableValues,
}: Options) => {
  return graphql({
    schema: await createSchema(),
    variableValues,
    source,
    contextValue: {
      req: {
        session: { userId },
      },
      res: { clearCookie: () => {} },
    },
  });
};
