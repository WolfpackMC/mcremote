import { createContext, Dispatch, SetStateAction } from 'react'

import * as trpcNext from '@trpc/server/adapters/next'
import type { inferAsyncReturnType } from '@trpc/server'
import { NodeHTTPCreateContextFnOptions } from '@trpc/server/dist/adapters/node-http/types'
import { IncomingMessage } from 'http'
import ws from 'ws'
import { unstable_getServerSession } from 'next-auth'
import { authOptions } from '../server/auth'

export const trpcContext = async ({
  req,
  res,
}: trpcNext.CreateNextContextOptions) => {
  const session = await unstable_getServerSession(req, res, authOptions)
  return {
    session,
    req,
    res,
  }
}

export type Context = inferAsyncReturnType<typeof trpcContext>
