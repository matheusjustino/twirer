import { useSession } from 'next-auth/react';

// COMPONENTS
import { Button } from '../button';

interface FollowButtonProps {
	userId: string;
	isFollowing: boolean;
	isLoading: boolean;
	onClick: () => void;
}

const FollowButton: React.FC<FollowButtonProps> = ({
	userId,
	isFollowing,
	isLoading,
	onClick,
}) => {
	const session = useSession();

	if (session.status !== 'authenticated' || session.data.user.id === userId)
		return null;

	return (
		<Button disabled={isLoading} onClick={onClick} small gray={isFollowing}>
			{isFollowing ? 'Unfollow' : 'Follow'}
		</Button>
	);
};

export { FollowButton };
