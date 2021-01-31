import {Request,Response} from 'express'
import { Redis } from "ioredis";
import 'express-session';

export type MyContext = {
  req: Request;
  res: Response;
  redis: Redis;
}

declare module 'express-session' {
  export interface SessionData {
    userId: number;
  }
}