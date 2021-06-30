import { mutationField, nonNull } from 'nexus';
import { Password } from '../../utils/password';
import { JWT } from '../../utils/jwt';
import { verifyUser } from '../../utils/verifyUser';
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

export const createUserMutation = mutationField('createUser', {
  type: nonNull('basicUserInfoAndAccessToken'),
  args: {
    data: nonNull('createUser'),
  },
  async resolve(_, args, { prisma, response }) {
    const { email, fullName, password } = args.data;
    const userWithGivenEmail = await prisma.user.findUnique({
      where: { email },
    });
    if (userWithGivenEmail) {
      throw new Error('email already exist');
    } else {
      const { salt, hashedPassword } = await Password.toHash(password);
      const user = await prisma.user.create({
        data: {
          email,
          fullName,
          password: hashedPassword,
          salt,
        },
      });

      const accessToken = JWT.CREATE_ACCESS_TOKEN(user);
      JWT.CREATE_REFRESH_TOKEN(user, response);

      return {
        email: user.email,
        fullName: user.fullName,
        accessToken,
      };
    }
  },
});

export const loginUserMutation = mutationField('loginUserMutation', {
  type: nonNull('basicUserInfoAndAccessToken'),
  args: {
    data: nonNull('loginUser'),
  },
  async resolve(_, args, { prisma, response }) {
    const { email, password } = args.data;
    // checking for if email is correct.
    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      throw Error('invalid email');
    } else {
      const correctPassword = await Password.compare(
        user.password,
        user.salt,
        password,
      );
      if (correctPassword) {
        //everthing is ok so we will update the tokenVersion and return the user,accessToken and refresh token
        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: {
            tokenVersion: {
              increment: 1,
            },
          },
        });

        const accessToken = JWT.CREATE_ACCESS_TOKEN(updatedUser);
        JWT.CREATE_REFRESH_TOKEN(updatedUser, response);

        return {
          email: user.email,
          fullName: user.fullName,
          accessToken,
        };
      } else {
        throw new Error('enter correct password');
      }
    }
  },
});

export const logOutUserMutation = mutationField('logOutUserMutation', {
  type: 'Boolean',
  async resolve(_, __, { prisma, response, auth }) {
    //protecting route from unauthorized user.
    verifyUser(auth);
    response.cookie(process.env.JWT_COKKIE_NAME!, 'EMPTY', {
      httpOnly: true,
    });
    return true;
  },
});

export const updateUserMutation = mutationField('updateUser', {
  type: 'basicUserInfoAndAccessToken',
  args: {
    data: nonNull('updateUser'),
  },
  async resolve(_, args, { prisma, auth, response }) {
    //protecting route from unauthorized user.
    const { id } = verifyUser(auth);

    const { email, fullName } = args.data;
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
        data: { ...updatedUser, tokenVersion: { increment: 1 } },
        where: { id },
      });

      JWT.CREATE_REFRESH_TOKEN(updatedUserFromDb, response);

      return {
        fullName: updatedUserFromDb.fullName,
        email: updatedUserFromDb.email,
        accessToken: JWT.CREATE_ACCESS_TOKEN(updatedUserFromDb),
      };
    }
  },
});

export const deleteUserMutation = mutationField('deleteUser', {
  type: 'User',
  async resolve(_, __, { prisma, auth }) {
    //protecting route from unauthorized user.
    const { id } = verifyUser(auth);
    const userWeWantToDelete = prisma.user.findFirst({ where: { id } });
    if (!userWeWantToDelete) {
      return null;
    } else {
      try {
        // onDelete cascade is not supported yet. so...
        // first we will delete the comments and we will get the posts that are created by the user.
        const [_, detailsOfDeletedPost] = await Promise.all([
          await prisma.comment.deleteMany({ where: { authorId: id } }),
          await prisma.post.findMany({ where: { authorId: id } }),
        ]);
        // deleting comments of posts we will delete in next step.
        for (const post of detailsOfDeletedPost) {
          await prisma.comment.deleteMany({ where: { postId: post.id } });
        }

        // deleting posts
        await prisma.post.deleteMany({ where: { authorId: id } });
        // finally we are deleting user
        const deletedUser = await prisma.user.delete({ where: { id } });
        return deletedUser;
      } catch (e) {
        throw new Error(e);
      }
    }
  },
});
