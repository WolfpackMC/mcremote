import {
  createTRPCProxyClient,
  createWSClient,
  httpBatchLink,
  wsLink,
} from '@trpc/client'
import { AppRouter } from '../server/routers/_app'

export const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: '/api/trpc',
    }),
  ],
})
