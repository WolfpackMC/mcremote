import NextAuth from "next-auth/next"

import CredentialsProvider from "next-auth/providers/credentials"

import { client } from '../../../util/aws'

import crypto from "crypto"

// eslint-disable-next-line import/no-anonymous-default-export
export default NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text", placeholder: "jsmith" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials, req) => {
                // const res = await fetch(`${process.env.NEXTAUTH_URL}/api/login2`, {
                //     method: "POST",
                //     headers: {
                //         "Content-Type": "application/json",
                //     },
                //     body: JSON.stringify(credentials),
                // })

                if (credentials && credentials.username && credentials.password) {
                    const user = await client.get({
                        TableName: "mcremote_users",
                        Key: {
                            username: credentials.username,
                        },
                    })
                    if (user.Item && user.Item.pass) {
                        const [salt, hashed_password] = user.Item.pass.split("$")

                        // Decode the salt from base64
                        const saltBuffer = Buffer.from(salt, "base64")
                        const hashed_passwordBuffer = Buffer.from(hashed_password, "base64")
                        const pepper = process.env.PEPPER as string
                
                        // Convert saltBuffer to uint8array
                        const saltUint8Array = new Uint8Array(saltBuffer)
                
                
                
                        const newHash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pepper + saltUint8Array + credentials.password))
                
                        if (Buffer.from(newHash).equals(hashed_passwordBuffer)) {
                            console.log("It worked, yo")
                            return { id: user.Item.id, name: user.Item.username }
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
        async session({ session, token, user }) {
            if (token && session) {
                // @ts-ignore
                session.user.userId = token.userId
                // @ts-ignore
                session.user.username = token.name
            }
            console.log(session)
            return session
        },
    },
    jwt: {
        maxAge: 15 * 24 * 30 * 60, // 15 days
    },
    pages: {
        signIn: "/",
    }
})
