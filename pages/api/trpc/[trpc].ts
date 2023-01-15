import * as trpcNext from '@trpc/server/adapters/next'
import { appRouter } from '../../../server/routers/_app'

import { trpcContext as createContext } from '../../../contexts/contexts'
import { NextApiRequest, NextApiResponse } from 'next'

import NextCors from 'nextjs-cors'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await NextCors(req, res, {
    // Options
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    origin: '*',
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  })

  return trpcNext.createNextApiHandler({
    router: appRouter,
    createContext,
  })(req, res)
}

export default handler
