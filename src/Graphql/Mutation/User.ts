import { mutationField, nonNull, stringArg } from 'nexus';

export const createUserMutation = mutationField('createUser', {
  type: nonNull('User'),
  args: {
    data: nonNull('createUser'),
  },
  async resolve(_, args, { prisma }) {
    const { email, fullName } = args.data;
    const userWithGivenEmail = await prisma.user.findFirst({
      where: { email },
    });
    if (userWithGivenEmail) {
      throw new Error('email already exist');
    } else {
      const user = await prisma.user.create({
        data: {
          email,
          fullName,
        },
      });
      return user;
    }
  },
});

export const updateUserMutation = mutationField('updateUser', {
  type: 'User',
  args: {
    data: nonNull('updateUser'),
  },
  async resolve(_, args, { prisma }) {
    const { email, fullName, id } = args.data;
    const oldUser = await prisma.user.findFirst({ where: { id } });
    if (!oldUser) {
      return null;
    } else {
      const updatedUser = { ...oldUser };
      if (email) {
        updatedUser.email = email;
      }
      if (fullName) {
        updatedUser.fullName = fullName;
      }
      const updatedUserFromDb = await prisma.user.update({
        data: { ...updatedUser },
        where: { id },
      });
      return updatedUserFromDb;
    }
  },
});

export const deleteUserMutation = mutationField('deleteUser', {
  type: 'User',
  args: {
    id: nonNull(
      stringArg({ description: 'id of the user you want to delete' }),
    ),
  },
  async resolve(_, { id }, { prisma }) {
    const userWeWantToDelete = prisma.user.findFirst({ where: { id } });
    if (!userWeWantToDelete) {
      return null;
    } else {
      try {
        const [deletedUser, , , detailsOfDeletedPost] = await Promise.all([
          await prisma.user.delete({ where: { id } }),
          await prisma.post.deleteMany({ where: { authorId: id } }),
          await prisma.comment.deleteMany({ where: { authorId: id } }),
          await prisma.post.findMany({ where: { authorId: id } }),
        ]);
        for (const post of detailsOfDeletedPost) {
          await prisma.comment.deleteMany({ where: { postId: post.id } });
        }
        return deletedUser;
      } catch (e) {
        throw new Error('somthing went wrong');
      }
    }
  },
});
