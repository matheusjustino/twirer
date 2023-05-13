import Head from 'next/head';
import { type AppType } from 'next/app';
import { type Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';

import { api } from '~/utils/api';

import '~/styles/globals.css';

// COMPONENTS
import { SideNav } from '~/components/sidenav';

const MyApp: AppType<{ session: Session | null }> = ({
	Component,
	pageProps: { session, ...pageProps },
}) => {
	return (
		<SessionProvider session={session}>
			<Head>
				<title>Twirer</title>
				<meta
					name="description"
					content="This is a simplified Twitter clone"
				/>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<div className="container mx-auto flex items-start sm:pr-4">
				<SideNav />
				<div className="min-h-screen flex-grow border-x">
					<Component {...pageProps} />
				</div>
			</div>
		</SessionProvider>
	);
};

export default api.withTRPC(MyApp);
