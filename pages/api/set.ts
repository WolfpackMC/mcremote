export {}
// import { NextApiRequest, NextApiResponse } from "next"

// import { client } from "../../util/aws"

// import { GetItemCommand } from '@aws-sdk/client-dynamodb'

// import { getToken } from "next-auth/jwt"


// const handler = async (req: NextApiRequest, res: NextApiResponse) => {
//     const session = await getToken({ req })
//     switch (req.method) {
//         case "POST":
//             if (session) {
//                 const { redstone }: { redstone: number } = req.body
//                 // If redstone does not exist, return 400
//                 if (!redstone) {
//                     res.status(400).json({ message: "Redstone not found" })
//                     return
//                 }
//                 const mc_res = await fetch(`http://${process.env.REMOTE_IP}:8080/redstone_${redstone}`, {
//                     method: "POST",
//                     body: JSON.stringify({ mckey: process.env.MCREMOTE_KEY as string })
//                 })
//                 const body = await mc_res.json()
//                 res.status(200).json({ message: "Redstone set", number: redstone })
//             }
//             else {
//                 res.status(404).json({ message: "Session not found" })
//             }
//             break
//         default:
//             res.status(405).json({ message: "Method not allowed" })
//             break
//     }

//     res.end()
// }

// export default handler