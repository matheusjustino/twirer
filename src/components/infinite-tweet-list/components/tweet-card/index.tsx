import Link from 'next/link';

// INTERFACES
import { type Tweet } from '../..';

// UTILS
import { api } from '~/utils/api';

// COMPONENTS
import { ProfileImage } from '~/components/profile-image';
import { HeartButton } from '../heart-button';

type TweetCardProps = Tweet;

const TweetCard: React.FC<TweetCardProps> = ({
	id,
	user,
	content,
	likeCount,
	likedByMe,
	createdAt,
}) => {
	const trpcUtils = api.useContext();

	const toggleLike = api.tweet.toggleLike.useMutation({
		onSuccess: ({ addedLike }) => {
			const updateDate: Parameters<
				typeof trpcUtils.tweet.infiniteFeed.setInfiniteData
			>[1] = (oldData) => {
				if (!oldData) return undefined;

				const countModifier = addedLike ? 1 : -1;

				return {
					...oldData,
					pages: oldData.pages.map((page) => {
						return {
							...page,
							tweets: page.tweets.map((tweet) => {
								if (tweet.id === id) {
									return {
										...tweet,
										likeCount:
											tweet.likeCount + countModifier,
										likedByMe: addedLike,
									};
								}

								return tweet;
							}),
						};
					}),
				};
			};

			// update all infinite feed
			trpcUtils.tweet.infiniteFeed.setInfiniteData({}, updateDate);
			trpcUtils.tweet.infiniteFeed.setInfiniteData(
				{ onlyFollowing: true },
				updateDate,
			);
			trpcUtils.tweet.infiniteProfileFeed.setInfiniteData(
				{ userId: user.id },
				updateDate,
			);
		},
	});

	const handleToggleLike = () => {
		toggleLike.mutate({ id });
	};

	const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
		dateStyle: 'short',
	});

	return (
		<li className="flex gap-4 border-b px-4 py-4">
			<Link href={`/profiles/${user.id}`}>
				<ProfileImage src={user.image} />
			</Link>

			<div className="flex flex-grow flex-col">
				<div className="flex gap-1">
					<Link
						href={`/profiles/${user.id}`}
						className="font-bold hover:underline focus-visible:underline outline-none"
					>
						{user.name}
					</Link>
					<span className="text-gray-500">-</span>
					<span className="text-gray-500">
						{dateTimeFormatter.format(createdAt)}
					</span>
				</div>
				<p className="whitespace-pre-wrap">{content}</p>
				<HeartButton
					onClick={handleToggleLike}
					isLoading={toggleLike.isLoading}
					likeCount={likeCount}
					likedByMe={likedByMe}
				/>
			</div>
		</li>
	);
};

export { TweetCard };
