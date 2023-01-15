import { z } from 'zod'
import { procedure, protectedProcedure, router } from '../trpc'

import prisma from '../../util/prisma'

import { Endpoint, Redstone, BigReactor } from '@prisma/client'

// import promClient from 'prom-client'

// const httpRequestDurationMicroseconds = new promClient.Histogram({
//   name: 'http_request_duration_seconds',
//   help: 'Duration of HTTP requests in ms',
//   labelNames: ['method', 'route', 'status'],
//   buckets: [0.1, 5, 15, 50, 100, 500],
// })

// const collectDefaultMetrics = promClient.collectDefaultMetrics
// const Registry = promClient.Registry
// const register = new Registry()
// collectDefaultMetrics({ register, prefix: 'mcremote_' })

// prisma.bigReactor.findMany().then((reactors) => {
//   reactors.forEach(reactor => {
//     const ambientTemp = new promClient.Gauge({
//       name: `${reactor.id}_reactor_ambient_temp`,
//       help: 'Ambient temperature of the reactor',
//       labelNames: ['reactor'],
//       registers: [register],
//     })

//     const capacity = new promClient.Gauge({
//       name: `${reactor.id}_reactor_capacity`,
//       help: 'Capacity of the reactor',
//       labelNames: ['reactor'],
//       registers: [register],
//     })

//     const producedLastTick = new promClient.Histogram({
//       name: `${reactor.id}_reactor_produced_last_tick`,
//       help: 'Amount of energy produced last tick',
//       labelNames: ['reactor'],
//       registers: [register],
//       buckets: [0.1, 5, 15, 50, 100, 500],
//     })

// register.metrics().then((data) => {
//   console.log(data)
// })

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
  brReactor: procedure
    .input(z.number().optional())
    .query(async ({ ctx, input }) => {
      if (input) {
        const reactor = await prisma.bigReactor.findUnique({
          where: {
            id: parseInt(input.toString()),
          },
        })

        if (reactor) {
          return [reactor]
        }
      }

      const account = await prisma.account.findUnique({
        where: {
          // @ts-ignore
          id: parseInt(ctx.session.token.userId),
        },
        include: {
          endpoints: {
            include: {
              reactors: true,
            },
          },
        },
      })

      if (!account) {
        throw new Error('Account not found')
      }

      let reactors: BigReactor[] = []

      account.endpoints.forEach(endpoint => {
        reactors.push(...endpoint.reactors)
      })

      return reactors
    }),
  redstones: procedure.query(async ({ ctx }) => {
    // id is under ctx.session.token.userId
    const account = await prisma.account.findUnique({
      where: {
        // @ts-ignore
        id: parseInt(ctx.session.token.userId),
      },
    })

    if (!account) {
      throw new Error('Account not found')
    }

    // Query the redstone list from the endpoint in the database
    const endpoints = await prisma.endpoint.findMany({
      where: {
        id: account.id,
      },
    })

    if (!endpoints) {
      throw new Error('Endpoint not found')
    }

    let redstoneList: Redstone[] = []

    const promises = endpoints.map(async (endpoint: Endpoint) => {
      const redstone = await prisma.redstone.findMany({
        where: {
          endpointId: endpoint.id,
        },
      })

      if (redstone) {
        redstoneList.push(...redstone)
      }
    })

    await Promise.all(promises)

    return redstoneList
  }),
  set: protectedProcedure
    .input(
      z.object({
        redstone: z.number(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const account = await prisma.account.findUnique({
        where: {
          // @ts-ignore
          id: parseInt(ctx.session.token.userId),
        },
        include: {
          endpoints: {
            include: {
              redstones: true,
            },
          },
        },
      })

      if (!account) {
        throw new Error('Account not found')
      }

      const redstone = account.endpoints[0].redstones.find(
        redstone => redstone.id === input.redstone,
      )

      if (!redstone) {
        throw new Error('Redstone not found')
      }

      // Set the redstone
      redstone.state = !redstone.state

      await prisma.redstone.update({
        where: {
          id: redstone.id,
        },
        data: {
          state: redstone.state,
        },
      })

      return redstone
    }),
})
// export type definition of API
export type AppRouter = typeof appRouter
