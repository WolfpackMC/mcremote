import { createContext, Dispatch, SetStateAction } from 'react'

import * as trpcNext from '@trpc/server/adapters/next'

import { getSession } from 'next-auth/react'
import type { inferAsyncReturnType } from '@trpc/server'
import { NodeHTTPCreateContextFnOptions } from '@trpc/server/dist/adapters/node-http/types'
import { IncomingMessage } from 'http'
import ws from 'ws'

export const trpcContext = async (
  {
    req,
    res,
  } : trpcNext.CreateNextContextOptions
) => {
  const session = await getSession({ req })
  return {
    session,
    req,
    res
  }
}

export type Context = inferAsyncReturnType<typeof trpcContext>
