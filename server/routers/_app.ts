import { z } from 'zod'
import { procedure, protectedProcedure, router } from '../trpc'

export const appRouter = router({
hello: procedure
    .input(
    z.object({
        text: z.string(),
    }),
    )
    .query(({ input }) => {
    return {
        greeting: `hello ${input.text}`,
    }
    }),
poll: protectedProcedure
    .query(async () => {
        const res = await fetch(`http://${process.env.REMOTE_IP}:8080/`, {
            method: "GET",
            headers: {
                "mckey": process.env.MCREMOTE_KEY as string
            }
        })
        const data = await res.json()
        return data
    }),
set: protectedProcedure
    .input(
        z.object({
            redstone: z.number()
        })
    )
    .query(async ({ input }) => {
        const res = await fetch(`http://${process.env.REMOTE_IP}:8080/redstone_${input.redstone}`, {
            method: "POST",
            body: JSON.stringify({ mckey: process.env.MCREMOTE_KEY as string })
        })
        const body = await res.json()
        return body
    })
})
// export type definition of API
export type AppRouter = typeof appRouter