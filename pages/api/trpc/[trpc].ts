import * as trpcNext from '@trpc/server/adapters/next'
import { getToken } from 'next-auth/jwt'
import { appRouter } from '../../../server/routers/_app'

import { trpcContext as createContext } from '../../../contexts/contexts'

// export API handler
export default trpcNext.createNextApiHandler({
    router: appRouter,
    createContext,
})