import Image from 'next/image';
import { VscAccount } from 'react-icons/vsc';

interface ProfileImageProps {
	src?: string | null;
	className?: string;
}

const ProfileImage: React.FC<ProfileImageProps> = ({ src, className = '' }) => {
	return (
		<div
			className={`relative h-12 w-12 overflow-hidden rounded-full ${className}`}
		>
			{src ? (
				<Image src={src} alt="Profile image" quality={100} fill />
			) : (
				<VscAccount className="h-full w-full" />
			)}
		</div>
	);
};

export { ProfileImage };
