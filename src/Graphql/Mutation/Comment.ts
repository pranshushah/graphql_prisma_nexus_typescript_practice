import { mutationField, nonNull } from 'nexus';
import { verifyUser } from '../../utils/verifyUser';

export const createCommentMutation = mutationField('createComment', {
  type: nonNull('Comment'),
  args: {
    data: nonNull('createComment'),
  },
  async resolve(_, args, { prisma, pubsub, auth }) {
    //protecting route from unauthorized user.
    const { id } = verifyUser(auth);

    const { postId, text } = args.data;
    const [userExist, postExist] = await Promise.all([
      await prisma.user.findFirst({ where: { id } }),
      await prisma.post.findFirst({ where: { id: postId, published: true } }),
    ]);
    if (!userExist) {
      throw new Error('author does not exist');
    }
    if (!postExist) {
      throw new Error('post does not exist');
    }
    const newComment = await prisma.comment.create({
      data: { text, postId, authorId: id },
    });
    pubsub.publish(`comment ${postId}`, {
      comment: newComment,
      variant: 0,
    });
    return newComment;
  },
});

export const updateCommentMutation = mutationField('updateComment', {
  type: 'Comment',
  args: {
    data: nonNull('updateComment'),
  },
  async resolve(_, { data }, { prisma, pubsub, auth }) {
    //protecting route from unauthorized user.
    //https://flaviocopes.com/how-to-rename-object-destructuring/
    const { id: authorId } = verifyUser(auth);

    const { id, postId, text } = data;
    const oldComment = await prisma.comment.findFirst({
      where: { id, authorId, postId },
    });
    if (!oldComment) {
      return null;
    } else {
      const updatedComment = await prisma.comment.update({
        where: { id },
        data: { text },
      });
      pubsub.publish(`comment ${postId}`, {
        comment: updatedComment,
        variant: 1,
      });
      return updatedComment;
    }
  },
});

export const deleteCommentMutation = mutationField('deleteComment', {
  type: 'Comment',
  args: {
    data: nonNull('deleteComment'),
  },
  async resolve(_, { data }, { prisma, pubsub, auth }) {
    //protecting route from unauthorized user.
    //https://flaviocopes.com/how-to-rename-object-destructuring/
    const { id: authorId } = verifyUser(auth);
    const { id, postId } = data;
    const commentWeWantToDelete = await prisma.comment.findFirst({
      where: { id, authorId, postId },
    });
    if (!commentWeWantToDelete) {
      return null;
    } else {
      const deletedComment = await prisma.comment.delete({ where: { id } });
      pubsub.publish(`comment ${postId}`, {
        comment: deletedComment,
        variant: 2,
      });
      return deletedComment;
    }
  },
});
