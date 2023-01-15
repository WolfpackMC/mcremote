import NextAuth from 'next-auth/next'

import { NextApiRequest, NextApiResponse } from 'next'

import NextCors from 'nextjs-cors'
import { authOptions } from '../../../server/auth'

const pepper = process.env.PEPPER as string

// eslint-disable-next-line import/no-anonymous-default-export

export default async function DoAuth(req: NextApiRequest, res: NextApiResponse) {
  console.log("hi")
  await NextCors(req, res, {
    // Options
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    origin: '*',
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  })

  return NextAuth(authOptions)(req, res)
}
