import express from 'express'

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

const main = async() => {
  const orm = await MikroORM.init(microConfig)
  await orm.getMigrator().up();
  
  const app = express();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver,PostResolver],
      validate: false,
    }),
    context: () => ({em: orm.em})
  });

  apolloServer.applyMiddleware({app})

  app.listen(4500, () => {
    console.log('server is running on port : 4500')
  })
};

main().catch((err) => {
  console.error(err)
})
