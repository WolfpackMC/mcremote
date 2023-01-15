export {}
// import { z } from 'zod'
// import { procedure, router } from '../trpc'

// import { client } from '../../util/aws'

// export const loginRoute = procedure
// .input(
//     z.object({
//         username: z.string(),
//         password: z.string()
//     })
// )
// .query(async ({ input }) => {
//     const params = {
//         TableName: "mcremote",
//         Key: {
//             "user": {
//                 S: input.username
//             }
//         }
//     }
//     const data = await client.get(params)
//     if (data.Item && data.Item.pass) {
//         const [salt, hashed_password] = data.Item.pass.split("$")

//         // Decode the salt from base64
//         const saltBuffer = Buffer.from(salt, "base64")
//         const hashed_passwordBuffer = Buffer.from(hashed_password, "base64")
//         const pepper = process.env.PEPPER as string

//         // Convert saltBuffer to uint8array
//         const saltUint8Array = new Uint8Array(saltBuffer)

//         const newHash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pepper + saltUint8Array + input.password))

//         console.log("Hey, this happened!")

//         if (Buffer.from(newHash).equals(hashed_passwordBuffer)) {
//             //return res.status(200).json({ id: user.Item.id, name: user.Item.username })
//             return { id: data.Item.id, name: data.Item.username }
//         }

//         return null
//     }
// })
