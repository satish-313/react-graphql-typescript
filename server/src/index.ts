import express from 'express'
import cors from 'cors'

// db
import {MikroORM} from '@mikro-orm/core'
import { __prod__ } from './constants'
import microConfig from './mikro-orm.config'
 
// apollo
import "reflect-metadata"
import {ApolloServer} from 'apollo-server-express'
import {buildSchema} from 'type-graphql'
import { HelloResolver } from './resolvers/hello'
import { PostResolver } from './resolvers/post'
import { UserResolver } from './resolvers/user'

// session
import Redis from 'ioredis'
import session from 'express-session'
import connectRedis from 'connect-redis'

//types
import { MyContext } from './types'

const RedisStore = connectRedis(session)
const redis = new Redis()

const main = async() => {
  const orm = await MikroORM.init(microConfig)
  await orm.getMigrator().up();

  const app = express();

  app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
  }))

  app.use(
    session({
      name: 'qid',
      store: new RedisStore({client: redis, disableTouch:true}),
      secret: "laldfkajlkdfalkkdafqld",
      cookie: {
        maxAge: 1000 * 60 * 60 * 24, // one day
        httpOnly: true,
        sameSite: 'lax', // csrf protection
        secure: __prod__// cookie only works in https
      },
      resave: false,
      saveUninitialized: false,
    })
  )

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver,PostResolver,UserResolver],
      validate: false,
    }),
    context: ({req,res}): MyContext => ({em: orm.em,req,res,redis})
  });

  apolloServer.applyMiddleware({
    app,
    cors: false//{origin: "http://localhost:300"}
  })

  app.listen(4500, () => {
    console.log('server is running on port : 4500')
  })
};

main().catch((err) => {
  console.error(err)
})
