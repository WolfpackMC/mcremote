import { NextApiRequest, NextApiResponse } from 'next'
import NextCors from 'nextjs-cors'
import { createOpenApiNextHandler } from 'trpc-openapi'

import { appRouter } from '../../server/routers/_app'

import { trpcContext } from '../../contexts/contexts'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Handle incoming OpenAPI requests
  return createOpenApiNextHandler({
    router: appRouter,
    createContext: trpcContext,
  })(req, res)
}

export default handler
