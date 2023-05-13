import { type Prisma } from '@prisma/client';
import { type inferAsyncReturnType } from '@trpc/server';
import { z } from 'zod';

import {
	createTRPCRouter,
	publicProcedure,
	protectedProcedure,
	type createTRPCContext,
} from '~/server/api/trpc';

export const tweetRouter = createTRPCRouter({
	create: protectedProcedure
		.input(z.object({ content: z.string() }))
		.mutation(async ({ input: { content }, ctx }) => {
			const tweet = ctx.prisma.tweet.create({
				data: {
					content,
					userId: ctx.session.user.id,
				},
			});

			return tweet;
		}),
	infiniteFeed: publicProcedure
		.input(
			z.object({
				onlyFollowing: z.boolean().optional(),
				limit: z.number().optional(),
				cursor: z
					.object({
						id: z.string(),
						createdAt: z.date(),
					})
					.optional(),
			}),
		)
		.query(
			async ({
				input: { onlyFollowing = false, limit = 10, cursor },
				ctx,
			}) => {
				const currentUserId = ctx.session?.user.id;

				return await getInfiniteTweets({
					limit,
					cursor,
					ctx,
					whereClause:
						!currentUserId || !onlyFollowing
							? undefined
							: {
									user: {
										followers: {
											some: {
												id: currentUserId,
											},
										},
									},
							  },
				});
			},
		),
	infiniteProfileFeed: publicProcedure
		.input(
			z.object({
				userId: z.string(),
				limit: z.number().optional(),
				cursor: z
					.object({
						id: z.string(),
						createdAt: z.date(),
					})
					.optional(),
			}),
		)
		.query(async ({ input: { userId, limit = 10, cursor }, ctx }) => {
			return await getInfiniteTweets({
				limit,
				cursor,
				ctx,
				whereClause: {
					userId,
				},
			});
		}),
	toggleLike: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input: { id }, ctx }) => {
			const data = {
				tweetId: id,
				userId: ctx.session.user.id,
			};
			const existingLike = await ctx.prisma.like.findUnique({
				where: {
					userId_tweetId: data,
				},
			});

			if (!existingLike) {
				await ctx.prisma.like.create({ data });
				return { addedLike: true };
			} else {
				await ctx.prisma.like.delete({
					where: {
						userId_tweetId: data,
					},
				});
				return { addedLike: false };
			}
		}),
});

async function getInfiniteTweets({
	whereClause,
	ctx,
	limit,
	cursor,
}: {
	whereClause?: Prisma.TweetWhereInput;
	limit: number;
	cursor: { id: string; createdAt: Date } | undefined;
	ctx: inferAsyncReturnType<typeof createTRPCContext>;
}) {
	const currentUserId = ctx.session?.user.id;

	const tweets = await ctx.prisma.tweet.findMany({
		take: limit + 1,
		cursor: cursor ? { createdAt_id: cursor } : undefined,
		orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
		where: whereClause,
		select: {
			id: true,
			content: true,
			createdAt: true,
			likes: !currentUserId
				? false
				: {
						where: {
							userId: currentUserId,
						},
				  },
			_count: {
				select: {
					likes: true,
				},
			},
			user: {
				select: {
					id: true,
					name: true,
					image: true,
				},
			},
		},
	});

	let nextCursor: typeof cursor | undefined;

	if (tweets.length > limit) {
		const nextItem = tweets.pop();
		if (nextItem) {
			nextCursor = {
				id: nextItem.id,
				createdAt: nextItem.createdAt,
			};
		}
	}

	return {
		tweets: tweets.map((tweet) => ({
			id: tweet.id,
			content: tweet.content,
			createdAt: tweet.createdAt,
			likeCount: tweet._count.likes,
			user: tweet.user,
			likedByMe: tweet.likes?.length > 0,
		})),
		nextCursor,
	};
}