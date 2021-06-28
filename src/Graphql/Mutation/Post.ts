import { mutationField, nonNull, stringArg } from 'nexus';
import { Post } from '../../types/backingTypes';

export const createPostMutation = mutationField('createPost', {
  type: nonNull('Post'),
  args: {
    data: nonNull('createPost'),
  },
  async resolve(_, args, { prisma }) {
    const { title, body, authorId, published } = args.data;
    const userExist = await prisma.user.findFirst({ where: { id: authorId } });
    if (!userExist) {
      throw new Error('author does not exist');
    }
    const newPost = await prisma.post.create({
      data: { title, body, published, authorId },
    });
    return newPost;
  },
});

export const updatePostMutation = mutationField('updatePost', {
  type: 'Post',
  args: {
    data: nonNull('updatePost'),
  },
  async resolve(_, { data }, { prisma }) {
    const { title, body, id, authorId, published } = data;
    const oldPost = await prisma.post.findFirst({ where: { id, authorId } });

    if (oldPost !== null) {
      const updatedPost = { ...oldPost };
      if (title?.trim()) {
        updatedPost.title = title.trim();
      }
      if (body?.trim()) {
        updatedPost.body = body.trim();
      }
      if (typeof published === 'boolean') {
        updatedPost.published = published;
      }
      const updatedPostFromDb = await prisma.post.update({
        where: { id },
        data: { ...updatedPost },
      });
      return updatedPostFromDb;
    } else {
      return null;
    }
  },
});

export const deletePostMutation = mutationField('deletePost', {
  type: 'Post',
  args: {
    id: nonNull(
      stringArg({ description: 'id of the post you want to delete' }),
    ),
  },
  async resolve(_, { id }, { prisma }) {
    const post = await prisma.post.findFirst({ where: { id } });
    if (!post) {
      return null;
    } else {
      const [deletedPost, deleltedComments] = await Promise.allSettled([
        prisma.post.delete({ where: { id } }),
        prisma.comment.deleteMany({ where: { postId: id } }),
      ]);
      if (
        deleltedComments.status === 'fulfilled' &&
        deletedPost.status === 'fulfilled'
      ) {
        return deletedPost.value;
      } else {
        throw new Error('internal database Error');
      }
    }
  },
});
