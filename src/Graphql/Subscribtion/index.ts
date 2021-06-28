import { idArg, nonNull, subscriptionField } from 'nexus';
import { User, CommentSubscription } from '../../types/backingTypes';

/**
 * @description refer to the field below for the example.
 * @link https://github.com/graphql-nexus/nexus/blob/main/src/definitions/subscriptionField.ts
 */
export const commentSubscription = subscriptionField('getCommentsByPost', {
  type: nonNull('CommentSubscriptionType'),
  args: {
    postId: nonNull(
      idArg({ description: 'id of the post you want to subscribe.' }),
    ),
  },
  async subscribe(_, { postId }, { prisma, pubsub }) {
    const post = await prisma.post.findFirst({
      where: { id: postId, published: true },
    });
    if (!post) {
      throw new Error('post does not exist.');
    }
    return pubsub.asyncIterator(`comment ${postId}`);
  },
  async resolve(dataPromise: Promise<CommentSubscription>) {
    const mainData = await dataPromise;
    return mainData;
  },
});

export const userSubscription = subscriptionField('getNewUsers', {
  type: nonNull('User'),
  subscribe(_, __, { pubsub }) {
    return pubsub.asyncIterator('User');
  },
  async resolve(dataPromise: Promise<User>) {
    const mainData = await dataPromise;
    return mainData;
  },
});
