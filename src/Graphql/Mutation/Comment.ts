import { mutationField, nonNull } from 'nexus';

export const createCommentMutation = mutationField('createComment', {
  type: nonNull('Comment'),
  args: {
    data: nonNull('createComment'),
  },
  async resolve(_, args, { prisma, pubsub }) {
    const { postId, authorId, text } = args.data;
    const [userExist, postExist] = await Promise.all([
      await prisma.user.findFirst({ where: { id: authorId } }),
      await prisma.post.findFirst({ where: { id: postId, published: true } }),
    ]);
    if (!userExist || !postExist) {
      throw new Error('author does not exist');
    }
    const newComment = await prisma.comment.create({
      data: { text, postId, authorId },
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
  async resolve(_, { data }, { prisma, pubsub }) {
    const { id, authorId, postId, text } = data;
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
  async resolve(_, { data }, { prisma, pubsub }) {
    const { id, authorId, postId } = data;
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
