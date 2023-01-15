export {}
// import { NextApiRequest, NextApiResponse } from "next/types"

// import { DynamoDB, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb"
// import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb"
// import { DynamoDBAdapter } from "@next-auth/dynamodb-adapter"

// import crypto from "crypto"

// const config: DynamoDBClientConfig = {
//     region: "us-east-1",
//     credentials: {
//         accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
//         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
//     },
// }

// const client = DynamoDBDocument.from(new DynamoDB(config), {
//     marshallOptions: {
//         convertEmptyValues: true,
//         removeUndefinedValues: true,
//         convertClassInstanceToMap: true,
//     },
// })

// const handler = async (req: NextApiRequest, res: NextApiResponse) => {
//     const { username, password } = req.body
//     const user = await client.get({
//         TableName: "mcremote_users",
//         Key: {
//             username: username,
//         },
//     })
//     console.log("got user", user)
//     if (user.Item && user.Item.pass) {
//         const [salt, hashed_password] = user.Item.pass.split("$")

//         // Decode the salt from base64
//         const saltBuffer = Buffer.from(salt, "base64")
//         const hashed_passwordBuffer = Buffer.from(hashed_password, "base64")
//         const pepper = process.env.PEPPER as string

//         // Convert saltBuffer to uint8array
//         const saltUint8Array = new Uint8Array(saltBuffer)

//         const newHash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pepper + saltUint8Array + password))

//         if (Buffer.from(newHash).equals(hashed_passwordBuffer)) {
//             return res.status(200).json({ id: user.Item.id, name: user.Item.username })
//         }

//         return res.status(401).json({ message: "Access denied" })
//         //res.status(200).json({ name: username, id: user.Item.id })
//     }

//     res.status(401).json({ message: "Access denied" })
// }

// export default handler
