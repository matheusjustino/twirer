import { useSession } from 'next-auth/react';
import { VscHeartFilled, VscHeart } from 'react-icons/vsc';

// COMPONENTS
import { IconHoverEffect } from '~/components/icon-hover-effect';

interface HeartButtonProps {
	onClick: () => void;
	isLoading: boolean;
	likedByMe: boolean;
	likeCount: number;
}

const HeartButton: React.FC<HeartButtonProps> = ({
	onClick,
	isLoading,
	likedByMe,
	likeCount,
}) => {
	const session = useSession();
	const HeartIcon = likedByMe ? VscHeartFilled : VscHeart;

	if (session.status !== 'authenticated') {
		return (
			<div className="mb-1 mt-1 flex items-center gap-3 self-start text-gray-500">
				<HeartIcon />
				<span>{likeCount}</span>
			</div>
		);
	}

	return (
		<button
			disabled={isLoading}
			onClick={onClick}
			className={`
				group items-center gap-1 self-start flex
				transition-colors duration-200
				${
					likedByMe
						? 'text-red-500'
						: 'text-gray-500 hover:text-red-500 focus-visible:text-red-500'
				}`}
		>
			<IconHoverEffect red>
				<HeartIcon
					className={`
						transition-colors duration-200 h-full
						${
							likedByMe
								? 'fill-red-500'
								: 'fill-gray-500 group-hover:fill-red-500 group-focus-visible:fill-red-500'
						}`}
				/>
			</IconHoverEffect>
			<span>{likeCount}</span>
		</button>
	);
};

export { HeartButton };
