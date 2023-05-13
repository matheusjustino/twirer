import InfiniteScroll from 'react-infinite-scroll-component';

// COMPONENTS
import { TweetCard } from './components/tweet-card';
import { LoadingSpinner } from '../loading-spinner';

export interface Tweet {
	id: string;
	content: string;
	likeCount: number;
	likedByMe: boolean;
	user: {
		id: string;
		image: string | null;
		name: string | null;
	};
	createdAt: Date;
}

interface InfiniteTweetListProps {
	tweets?: Tweet[];
	isLoading: boolean;
	isError: boolean;
	hasMore?: boolean;
	fetchNewTweets: () => Promise<unknown>;
}

const InfiniteTweetList: React.FC<InfiniteTweetListProps> = ({
	tweets,
	isLoading,
	isError,
	hasMore,
	fetchNewTweets,
}) => {
	if (isLoading) {
		return <LoadingSpinner />;
	}
	if (isError) {
		<h1>Error...</h1>;
	}
	if (!tweets || tweets.length === 0) {
		return (
			<h2 className="my-4 text-center text-2xl text-gray-500">
				No Tweets
			</h2>
		);
	}

	return (
		<ul>
			<InfiniteScroll
				dataLength={tweets.length}
				next={fetchNewTweets}
				hasMore={!!hasMore}
				loader={<LoadingSpinner />}
			>
				{tweets.map((tweet) => (
					<TweetCard key={tweet.id} {...tweet} />
				))}
			</InfiniteScroll>
		</ul>
	);
};

export { InfiniteTweetList };
