

import { createContext, Dispatch, SetStateAction } from 'react'

import * as trpcNext from '@trpc/server/adapters/next'

import { getSession } from 'next-auth/react'
import type { inferAsyncReturnType } from '@trpc/server'

export interface IContext {
    backgroundX: number
    backgroundY: number
}

const timestamp = Math.floor(Date.now())

const x = Math.cos(timestamp / 5000) * 100
const y = Math.sin(timestamp / 5000) * 100

export const BackgroundContext = createContext<IContext>({
    backgroundX: x,
    backgroundY: y
})

export const trpcContext = async (ctx: trpcNext.CreateNextContextOptions) => {
    const session = await getSession({req: ctx.req})
    return {
        session
    }
}

export type Context = inferAsyncReturnType<typeof trpcContext>
