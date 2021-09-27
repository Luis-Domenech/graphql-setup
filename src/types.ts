import { PrismaClient } from "@prisma/client";
// import { PrismaClientOptions } from "@prisma/client/runtime";
import { Request, Response } from "express";
import session, { SessionData } from "express-session";
import { Redis } from "ioredis";
import { createUserLoader } from "./utils/createUserLoader";

export type MyContext = {
  prisma: PrismaClient,
  req: Request & { session: session.Session & Partial<SessionData> & { userId: number };},
  res: Response,
  redis: Redis,
  userLoader: ReturnType<typeof createUserLoader>,
}