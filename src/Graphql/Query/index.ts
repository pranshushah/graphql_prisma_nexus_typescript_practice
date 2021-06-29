import { User } from '@prisma/client';
import { queryField, nonNull, stringArg, list } from 'nexus';
import { verifyUser } from '../../utils/verifyUser';

export const Query1 = queryField('greeting', {
  type: nonNull('String'),
  args: {
    name: nonNull(
      stringArg({ description: 'name you want in string', default: 'pranshu' }),
    ),
  },
  resolve(_, { name }) {
    return 'Hello ' + name;
  },
});

export const Query2 = queryField('users', {
  type: nonNull(list(nonNull('User'))),
  args: {
    searchByName: stringArg({ description: 'search the users by the name' }),
  },
  async resolve(_, { searchByName }, { prisma, auth }) {
    console.log(auth.split(' '));
    if (searchByName) {
      return await prisma.user.findMany({
        where: { fullName: { contains: searchByName } },
      });
    } else {
      return await prisma.user.findMany();
    }
  },
});
export const Query3 = queryField('post', {
  type: nonNull(list(nonNull('Post'))),
  args: {
    searchByNameOrBody: stringArg({
      description: 'search the posts by title or body',
    }),
  },
  async resolve(_, { searchByNameOrBody }, { prisma }) {
    if (searchByNameOrBody) {
      return await prisma.post.findMany({
        where: {
          title: { contains: searchByNameOrBody },
          body: { contains: searchByNameOrBody },
        },
      });
    } else {
      return await prisma.post.findMany();
    }
  },
});

export const Query4 = queryField('comment', {
  type: nonNull(list(nonNull('Comment'))),
  async resolve(_, __, { prisma }) {
    return prisma.comment.findMany();
  },
});

export const currentUser = queryField('currentUser', {
  type: 'User',
  async resolve(_, __, { prisma, auth }) {
    //protecting route from unauthorized user.
    const { id } = verifyUser(auth);
    const user = (await prisma.user.findFirst({ where: { id } })) as User;
    return { id: user.id, email: user.email, fullName: user.fullName };
  },
});
