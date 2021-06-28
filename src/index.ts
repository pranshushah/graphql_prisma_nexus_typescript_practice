import { GraphQLServer, PubSub } from 'graphql-yoga';
import { users, posts, comments } from './data';
import { schema } from './schema';
import { PrismaClient } from '@prisma/client';

const pubsub = new PubSub();
const prisma = new PrismaClient();
const server = new GraphQLServer({
  schema: schema,
  context: { users, posts, comments, pubsub, prisma },
});

server.start(() => `Server is running on http://localhost:4000`);
