import { GraphQLServer, PubSub } from 'graphql-yoga';
import { schema } from './schema';
import { PrismaClient } from '@prisma/client';
import cookieParser from 'cookie-parser';
import { refreshTokenRoute } from './utils/getNewAccesccTokenFromRefreshToken';
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const pubsub = new PubSub();
const prisma = new PrismaClient();
export const server = new GraphQLServer({
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

server.express.use(cookieParser());

// handling refresh token
server.express.use(refreshTokenRoute(prisma));
server.start(() => `Server is running on http://localhost:4000`);
