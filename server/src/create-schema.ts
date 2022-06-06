import { buildSchema } from "type-graphql";
import { OrganizationRelationsResolver } from "../prisma/generated/type-graphql";
import { HelloResolver } from "./resolvers/HelloResolver";
import { OrganizationResolver } from "./resolvers/OrganizationResolver";
import { UserResolver } from "./resolvers/UserResolver";
import { WorkspaceResolver } from "./resolvers/WorkspaceResolver";

export const createSchema = async () => {
  return buildSchema({
    resolvers: [
      HelloResolver,
      UserResolver,
      WorkspaceResolver,
      OrganizationResolver,
      OrganizationRelationsResolver,
    ],
    authChecker: ({ context: { req } }) => {
      return !!req.session.userId;
    },
    validate: false,
  });
};
