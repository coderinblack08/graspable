import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { ApolloServer } from "apollo-server-express";
import connectRedis from "connect-redis";
import cors from "cors";
import { config } from "dotenv";
import express from "express";
import session from "express-session";
import Redis from "ioredis";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { AppDataSource } from "./data-source";
import { HelloResolver } from "./resolvers/HelloResolver";
import { UserResolver } from "./resolvers/UserResolver";
import { WorkspaceResolver } from "./resolvers/WorkspaceResolver";
config();

export const COOKIE_NAME = "qid";
export const PROD = process.env.NODE_ENV === "production";

(async function () {
  AppDataSource.initialize().catch(console.error);

  const app = express();

  const RedisStore = connectRedis(session);
  const redis = new Redis();

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: "lax", // csrf
        secure: PROD, // cookie only works in https
        domain: PROD ? ".graspable.app" : undefined,
      },
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET,
      resave: false,
    })
  );

  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, UserResolver, WorkspaceResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({ req, res }),
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground],
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.listen(process.env.PORT || 4000, () => {
    console.log("server started on localhost:4000");
  });
})().catch((e) => console.error(e));
