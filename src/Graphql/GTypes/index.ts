import { objectType, nonNull, inputObjectType, enumType } from 'nexus';
import { User as UserType, Post as PostType } from '../../types/backingTypes';
import { optionalVerifyUser } from '../../utils/optionalVerfiyUser';

export const User = objectType({
  name: 'User',
  definition(t) {
    t.nonNull.id('id', { description: 'Id of the user' });
    t.nonNull.string('fullName', { description: 'Full name of the user' });
    t.string('email', {
      description: 'email of the user',
      async resolve(user, _, { auth }) {
        //we don't want to expose email of all the users.
        const payload = optionalVerifyUser(auth);
        if (payload) {
          if (user.id === payload.id) {
            return user.email;
          } else {
            return null;
          }
        } else {
          return null;
        }
      },
    });
    t.nonNull.list.field('posts', {
      type: nonNull('Post'),
      async resolve(user, _, { prisma, auth }) {
        const payload = optionalVerifyUser(auth);
        if (payload) {
          if (user.id === payload.id) {
            return await prisma.post.findMany({ where: { authorId: user.id } });
          } else {
            return await prisma.post.findMany({
              where: { authorId: user.id, published: true },
            });
          }
        } else {
          return await prisma.post.findMany({
            where: { authorId: user.id, published: true },
          });
        }
      },
    });
    t.nonNull.list.field('comments', {
      type: nonNull('Comment'),
      async resolve(user, _, { prisma }) {
        return await prisma.comment.findMany({ where: { authorId: user.id } });
      },
    });
  },
});

export const basicUserInfoAndAccessToken = objectType({
  name: 'basicUserInfoAndAccessToken',
  definition(t) {
    t.nonNull.string('fullName', { description: 'Full name of the user' });
    t.nonNull.string('email', { description: 'email of the user' });
    t.nonNull.string('accessToken', {
      description:
        'jwt access token please store in authorization header at every request',
    });
  },
});

export const Post = objectType({
  name: 'Post',
  definition(t) {
    t.nonNull.id('id', { description: 'id of the post' });
    t.nonNull.string('title', { description: 'title of the post' });
    t.nonNull.string('body', { description: 'body of the post' });
    t.nonNull.boolean('published', {
      description: 'returns true if it posts otherwise it returns false',
    });
    t.nonNull.field('author', {
      type: 'User',
      description: 'author of the post',
      resolve: async (post, _, { prisma }) => {
        return (await prisma.user.findFirst({
          where: { id: post.authorId },
        })) as UserType;
      },
    });
    t.nonNull.list.field('comments', {
      type: nonNull('Comment'),
      resolve(post, _, { prisma }) {
        return prisma.comment.findMany({ where: { postId: post.id } });
      },
    });
  },
});

export const Comment = objectType({
  name: 'Comment',
  definition(t) {
    t.nonNull.id('id', { description: 'id of the comment' });
    t.nonNull.string('text', { description: 'text of the comment' });
    t.nonNull.field('author', {
      type: 'User',
      description: 'author of the comment',
      resolve: async (comment, _, { prisma }) => {
        return (await prisma.user.findFirst({
          where: { id: comment.authorId },
        })) as UserType;
      },
    });
    t.nonNull.field('post', {
      type: 'Post',
      description: 'post in which comments belong to',
      resolve: async (comment, _, { prisma }) => {
        return (await prisma.post.findFirst({
          where: { id: comment.postId },
        })) as PostType;
      },
    });
  },
});

export const createUser = inputObjectType({
  name: 'createUser',
  definition(t) {
    t.nonNull.string('fullName', { deprecation: 'fullName of the user' });
    t.nonNull.string('password', { description: 'password of the user' });
    t.nonNull.string('email', { deprecation: 'email of the user' });
  },
});

export const loginUser = inputObjectType({
  name: 'loginUser',
  definition(t) {
    t.nonNull.string('password', { description: 'password of the user' });
    t.nonNull.string('email', { deprecation: 'email of the user' });
  },
});

export const createComment = inputObjectType({
  name: 'createComment',
  definition(t) {
    t.nonNull.string('text', { description: 'text of the comment' });
    t.nonNull.string('postId', { description: 'postId of the comment' });
  },
});

export const createPost = inputObjectType({
  name: 'createPost',
  definition(t) {
    t.nonNull.string('title', { description: 'title of the post' });
    t.nonNull.string('body', { description: 'body of the post' });
    t.nonNull.boolean('published', {
      description: 'is it published or not',
      default: false,
    });
  },
});

export const updateUser = inputObjectType({
  name: 'updateUser',
  definition(t) {
    t.string('fullName', { description: 'Full name of the user' });
    t.string('email', { description: 'email of the user' });
  },
});

export const updatePost = inputObjectType({
  name: 'updatePost',
  definition(t) {
    t.nonNull.id('id', { description: 'id of the post' });
    t.string('title', { description: 'title of the post' });
    t.string('body', { description: 'body of the post' });
    t.boolean('published', {
      description: 'returns true if it posts otherwise it returns false',
    });
  },
});

export const updateComment = inputObjectType({
  name: 'updateComment',
  definition(t) {
    t.nonNull.id('id', { description: 'id of the comment' });
    t.nonNull.string('text', { description: 'text of the comment' });
    t.nonNull.id('postId', { description: 'postId of the comment' });
  },
});

export const deleteComment = inputObjectType({
  name: 'deleteComment',
  definition(t) {
    t.nonNull.id('id', { description: 'id of the comment' });
    t.nonNull.id('postId', { description: 'postId of the comment' });
  },
});

export const MutationType = enumType({
  name: 'MutationType',
  description:
    'tells us about which type of mutation is happening in subscribtion',
  members: [
    { name: 'CREATE', value: 0 },
    { name: 'UPDATE', value: 1 },
    { name: 'DELETE', value: 2 },
  ],
});

export const CommentSubscriptionType = objectType({
  name: 'CommentSubscriptionType',
  definition(t) {
    t.nonNull.field('comment', { type: 'Comment' });
    t.nonNull.field('variant', { type: 'MutationType' });
  },
});
