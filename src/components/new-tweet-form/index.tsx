import {
	type FormEvent,
	useCallback,
	useLayoutEffect,
	useRef,
	useState,
} from 'react';
import { type SessionContextValue, useSession } from 'next-auth/react';

// UTILS
import { api } from '~/utils/api';

// COMPONENTS
import { Button } from '../button';
import { ProfileImage } from '../profile-image';

function updateTextAreaSize(textArea?: HTMLTextAreaElement | null) {
	if (!textArea) return;

	textArea.style.height = '0';
	textArea.style.height = `${textArea.scrollHeight}px`;
}

interface FormProps {
	session: SessionContextValue;
}

function Form({ session }: FormProps) {
	const [inputValue, setInputValue] = useState('');
	const textAreaRef = useRef<HTMLTextAreaElement>();
	const inputRef = useCallback((textArea: HTMLTextAreaElement) => {
		updateTextAreaSize(textArea);
		textAreaRef.current = textArea;
	}, []);

	useLayoutEffect(() => {
		updateTextAreaSize(textAreaRef?.current);
	}, [inputValue]);

	const trpcUtils = api.useContext();
	const createTweet = api.tweet.create.useMutation({
		onSuccess: (newTweet) => {
			setInputValue('');

			if (session.status !== 'authenticated') return;

			trpcUtils.tweet.infiniteFeed.setInfiniteData({}, (oldData) => {
				if (!oldData || !oldData.pages[0]) return;

				const newCacheTweet = {
					...newTweet,
					likeCount: 0,
					likedByMe: false,
					user: {
						id: session.data.user.id,
						name: session.data.user.name ?? 'Unknown User',
						image: session.data.user.image ?? '',
					},
				};

				return {
					...oldData,
					pages: [
						{
							...oldData.pages[0],
							tweets: [newCacheTweet, ...oldData.pages[0].tweets],
						},
						...oldData.pages.slice(1),
					],
				};
			});
		},
	});

	if (session.status !== 'authenticated') return null;

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();

		createTweet.mutate({ content: inputValue });
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="flex flex-col gap-2 border-b px-4 py-2"
		>
			<div className="flex gap-4">
				<ProfileImage src={session.data.user.image} />
				<textarea
					ref={inputRef}
					style={{ height: 0 }}
					className="flex-grow resize-none overflow-hidden p-4 text-lg outline-none"
					placeholder="What's happening?"
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
				/>
			</div>

			<Button className="self-end">Tweet</Button>
		</form>
	);
}

const NewTweetForm: React.FC = () => {
	const session = useSession();

	if (session.status !== 'authenticated') return null;

	return <Form session={session} />;
};

export { NewTweetForm };
