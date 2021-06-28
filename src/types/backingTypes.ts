import { PubSub } from 'graphql-yoga';
import { NexusGenEnums } from '../generated/nexus-typegen';
import { PrismaClient } from '@prisma/client';

export type Post = {
  authorId: string;
  body: string;
  id: string;
  published: boolean;
  title: string;
  comments?: string[];
};

export type User = {
  email: string;
  fullName: string;
  id: string;
  posts?: string[];
  comments?: string[];
};

export type Comment = {
  id: string;
  text: string;
  authorId: string;
  postId: string;
};

export type ContextType = {
  pubsub: PubSub;
  prisma: PrismaClient;
};

export type CommentSubscription = {
  comment: Comment;
  variant: NexusGenEnums['MutationType'];
};
