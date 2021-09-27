// Regular Imports
import { PrismaClient } from "@prisma/client";
import { ApolloServer } from 'apollo-server-express';
import connectRedis from 'connect-redis';
import cors from 'cors';
import "dotenv-safe/config";
import express from 'express';
import session from 'express-session';
import { GraphQLSchema } from "graphql";
import Redis from 'ioredis';
import "reflect-metadata";
import { buildSchema } from 'type-graphql';

// Relative Imports
import { COOKIE_NAME, __prod__ } from "./constants";
import { executor } from "./executor";
import { UserResolver } from "./resolvers/user";
import { createUserLoader } from "./utils/createUserLoader";

const prisma = new PrismaClient({
  log: __prod__ ? undefined : ['query']
})

const main = async () => {

  console.log("Production Mode: " + __prod__)

  const app = express();

  const RedisStore = connectRedis(session)
  const redis = new Redis(process.env.REDIS_URL)

  app.set("trust proxy", 1)

  app.use(cors({
    origin: [process.env.CORS_ORIGIN, 'https://studio.apollographql.com'],
    credentials: true
  }))

  // For Apollo Studio
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "https://studio.apollographql.com");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "POST");
    res.header('Content-Security-Policy', "default-src 'self' *")
    next();
  });

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        httpOnly: true,
        sameSite: 'lax', // protects against CSRF attack
        secure: true, // cookie only works in https
        domain: __prod__ ? ".collider.finance" : undefined
      },
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET,
      resave: false,
    })
  )

  const schema: GraphQLSchema = await  await buildSchema({
    // resolvers: [PostResolver, UserResolver, UpdootResolver, AnimeResolver],
    resolvers: [UserResolver],
    validate: false
  })

  const apolloServer = new ApolloServer({
    schema: schema,
    context: ({ req, res }) => ({ prisma, req, res, redis, userLoader: createUserLoader(prisma)}),
    executor: executor(schema),
  })

  // For Apollo Server Express Update
  await apolloServer.start()

  apolloServer.applyMiddleware({
    app,
    cors: false
  }) 
}

main()
.catch(e => {
  throw e
})
.finally(async () => {
  await prisma.$disconnect()
})