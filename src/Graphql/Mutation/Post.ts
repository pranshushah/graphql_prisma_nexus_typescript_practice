import { mutationField, nonNull, stringArg } from 'nexus';
import { verifyUser } from '../../utils/verifyUser';

export const createPostMutation = mutationField('createPost', {
  type: nonNull('Post'),
  args: {
    data: nonNull('createPost'),
  },
  async resolve(_, args, { prisma, auth }) {
    //protecting route from unauthorized user.
    //https://flaviocopes.com/how-to-rename-object-destructuring/
    const { id: authorId } = verifyUser(auth);

    const { title, body, published } = args.data;
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
  async resolve(_, { data }, { prisma, auth }) {
    //protecting route from unauthorized user.
    //https://flaviocopes.com/how-to-rename-object-destructuring/
    const { id: authorId } = verifyUser(auth);

    const { title, body, id, published } = data;
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
  async resolve(_, { id }, { prisma, auth }) {
    //protecting route from unauthorized user.
    //https://flaviocopes.com/how-to-rename-object-destructuring/
    const { id: authorId } = verifyUser(auth);

    const post = await prisma.post.findFirst({ where: { id, authorId } });
    if (!post) {
      return null;
    } else {
      try {
        // onDelete-cascade is not supported so..
        //first we are deleting all Comments related to this post.
        await prisma.comment.deleteMany({ where: { postId: id } });
        //then we are deleting post it self.
        const deletedpost = await prisma.post.delete({ where: { id } });
        return deletedpost;
      } catch (e) {
        throw new Error(e);
      }
    }
  },
});
