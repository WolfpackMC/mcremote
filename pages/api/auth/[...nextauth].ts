import NextAuth from 'next-auth/next'

import CredentialsProvider from 'next-auth/providers/credentials'

import { NextApiRequest, NextApiResponse } from 'next'

import { client } from '../../../util/aws'

import prisma from '../../../util/prisma'

import crypto from 'crypto'
import NextCors from 'nextjs-cors'

const pepper = process.env.PEPPER as string

// eslint-disable-next-line import/no-anonymous-default-export
export default async function DoAuth(req: NextApiRequest, res: NextApiResponse) {
  await NextCors(req, res, {
    // Options
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    origin: '*',
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  })

  return NextAuth({
    providers: [
      CredentialsProvider({
        name: 'Credentials',
        credentials: {
          username: { label: 'Username', type: 'text', placeholder: 'jsmith' },
          password: { label: 'Password', type: 'password' },
        },
        authorize: async (credentials, req) => {
          // const res = await fetch(`${process.env.NEXTAUTH_URL}/api/login2`, {
          //     method: "POST",
          //     headers: {
          //         "Content-Type": "application/json",
          //     },
          //     body: JSON.stringify(credentials),
          // })

          // if (credentials && credentials.username && credentials.password) {
          //     try {
          //         console.log("a")
          //         const user = await client.get({
          //             TableName: "mcremote_users",
          //             Key: {
          //                 username: credentials.username,
          //             },
          //         })
          //         console.log("b")
          //         if (user.Item && user.Item.pass) {
          //             const [salt, hashed_password] = user.Item.pass.split("$")

          //             // Decode the salt from base64
          //             const saltBuffer = Buffer.from(salt, "base64")
          //             const hashed_passwordBuffer = Buffer.from(hashed_password, "base64")
          //             const pepper = process.env.PEPPER as string

          //             // Convert saltBuffer to uint8array
          //             const saltUint8Array = new Uint8Array(saltBuffer)

          //             const newHash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pepper + saltUint8Array + credentials.password))

          //             if (Buffer.from(newHash).equals(hashed_passwordBuffer)) {
          //                 console.log("It worked, yo")
          //                 return { id: user.Item.id, name: user.Item.username }
          //             }
          //         }
          //     } catch (e) {
          //         console.log(e)
          //     }
          // }

          if (credentials && credentials.username && credentials.password) {
            const user = await prisma.account.findUnique({
              where: {
                name: credentials.username,
              },
            })

            if (user) {
              console.log('found user: ' + user.name)
            }

            if (user && user.password) {
              const [salt, hashed_password] = user.password.split('$')

              // Decode the salt from base64
              const saltBuffer = Buffer.from(salt, 'base64')
              const hashed_passwordBuffer = Buffer.from(hashed_password, 'base64')

              // Convert saltBuffer to uint8array
              const saltUint8Array = new Uint8Array(saltBuffer)

              const newHash = await crypto.subtle.digest(
                'SHA-256',
                new TextEncoder().encode(
                  pepper + saltUint8Array + credentials.password,
                ),
              )

              if (Buffer.from(newHash).equals(hashed_passwordBuffer)) {
                console.log('It worked, yo')
                return { id: user.id.toString(), name: user.name }
              }
            }
          }
          return null
        },
      }),
    ],
    callbacks: {
      async jwt({ token, user, account, profile, isNewUser }) {
        if (user) {
          token.userId = user.id
          token.name = user.name
        }
        return token
      },
      async session({ session, token, user }: any) {
        session.token = token
        return session
      },
    },
    jwt: {
      maxAge: 15 * 24 * 30 * 60, // 15 days
    },
    pages: {
      signIn: '/',
    },
  })(req, res)
}
