import { GraphQLServer, PubSub } from 'graphql-yoga';
import { schema } from './schema';
import { PrismaClient } from '@prisma/client';

const pubsub = new PubSub();
const prisma = new PrismaClient();
const server = new GraphQLServer({
  schema: schema,
  context: ({ request, response }) => {
    return {
      pubsub,
      prisma,
      auth: request.headers.authorization || '',
      response,
    };
  },
});

server.start(() => `Server is running on http://localhost:4000`);
