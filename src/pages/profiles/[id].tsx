import type {
	GetStaticPaths,
	GetStaticProps,
	InferGetStaticPropsType,
	NextPage,
} from 'next';
import Link from 'next/link';
import Head from 'next/head';
import ErrorPage from 'next/error';
import { VscArrowLeft } from 'react-icons/vsc';

// UTILS
import { api } from '~/utils/api';

// SERVER
import { ssgHelper } from '~/server/api/ssg-helper';

// COMPONENTS
import { IconHoverEffect } from '~/components/icon-hover-effect';
import { ProfileImage } from '~/components/profile-image';
import { InfiniteTweetList } from '~/components/infinite-tweet-list';
import { FollowButton } from '~/components/follow-button';

const pluralRules = new Intl.PluralRules();

const ProfilePage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
	id,
}) => {
	const { data: profile } = api.profile.getById.useQuery({ id });
	const trpcUtils = api.useContext();
	const tweets = api.tweet.infiniteProfileFeed.useInfiniteQuery(
		{
			userId: id,
		},
		{ getNextPageParam: (lastPage) => lastPage.nextCursor },
	);
	const toggleFollow = api.profile.toggleFollow.useMutation({
		onSuccess: ({ addedFollow }) => {
			trpcUtils.profile.getById.setData({ id }, (oldData) => {
				if (!oldData) return;

				const countModifier = addedFollow ? 1 : -1;

				return {
					...oldData,
					isFollowing: addedFollow,
					followersCount: oldData.followersCount + countModifier,
				};
			});
		},
	});

	if (!profile || !profile.name) return <ErrorPage statusCode={404} />;

	const getPlural = (number: number, singular: string, plural: string) => {
		return pluralRules.select(number) === 'one' ? singular : plural;
	};

	return (
		<div>
			<Head>
				<title>{`Twirer - ${profile.name}`}</title>
			</Head>

			<header className="sticky top-0 z-10 flex items-center border-b bg-white px-4 py-2">
				<Link href=".." className="mr-2">
					<IconHoverEffect>
						<VscArrowLeft className="h-6 w-6" />
					</IconHoverEffect>
				</Link>

				<ProfileImage src={profile.image} className="flex-shrink-0" />

				<div className="ml-2 flex-grow">
					<h1 className="text-lg font-bold">{profile.name}</h1>

					<div className="text-gray-500">
						{profile.tweetsCount}{' '}
						{getPlural(profile.tweetsCount, 'Tweet', 'Tweets')} -{' '}
						{profile.followersCount}{' '}
						{getPlural(
							profile.followersCount,
							'Follower',
							'Followers',
						)}{' '}
						- {profile.followsCount} Following
					</div>
				</div>

				<FollowButton
					isFollowing={profile.isFollowing}
					isLoading={toggleFollow.isLoading}
					userId={id}
					onClick={() => toggleFollow.mutate({ userId: id })}
				/>
			</header>

			<main>
				<InfiniteTweetList
					tweets={tweets.data?.pages.flatMap((page) => page.tweets)}
					isError={tweets.isError}
					isLoading={tweets.isLoading}
					hasMore={tweets.hasNextPage}
					fetchNewTweets={tweets.fetchNextPage}
				/>
			</main>
		</div>
	);
};

export const getStaticPaths: GetStaticPaths = () => {
	return {
		paths: [],
		fallback: 'blocking',
	};
};

export const getStaticProps: GetStaticProps<{ id: string }> = async (ctx) => {
	const id = ctx.params?.id as string | undefined;
	if (!id) {
		return {
			redirect: {
				destination: '/',
				permanent: false,
			},
		};
	}

	const ssg = ssgHelper();
	await ssg.profile.getById.prefetch({
		id,
	});

	return {
		props: {
			trpcState: ssg.dehydrate(),
			id,
		},
	};
};

export default ProfilePage;
