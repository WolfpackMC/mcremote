

import { createContext, Dispatch, SetStateAction } from 'react'

import * as trpcNext from '@trpc/server/adapters/next'

import { getSession } from 'next-auth/react'
import type { inferAsyncReturnType } from '@trpc/server'

export const trpcContext = async (ctx: trpcNext.CreateNextContextOptions) => {
    const session = await getSession({req: ctx.req})
    return {
        session
    }
}

export type Context = inferAsyncReturnType<typeof trpcContext>
