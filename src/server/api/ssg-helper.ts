import { createProxySSGHelpers } from '@trpc/react-query/ssg';
import superjson from 'superjson';

// SERVER
import { appRouter } from './root';
import { createInnerTRPCContext } from './trpc';

export const ssgHelper = () => {
	return createProxySSGHelpers({
		router: appRouter,
		transformer: superjson,
		ctx: createInnerTRPCContext({ session: null }),
	});
};
