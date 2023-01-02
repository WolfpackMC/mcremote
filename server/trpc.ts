import { TRPCError, initTRPC } from '@trpc/server'
import { Context } from '../contexts/contexts'
console.log("initTRPC", initTRPC)
// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<Context>().create()
export const middleware = t.middleware
export const router = t.router
/**
 * Unprotected procedure
 */
export const procedure = t.procedure

const isAuthed = t.middleware(({next, ctx}) => {
    if (!ctx.session) {
        throw new TRPCError({code: 'UNAUTHORIZED'})
    }
    return next({
        ctx: {
            session: ctx.session,
        },
    })
})

export const protectedProcedure = t.procedure.use(isAuthed)