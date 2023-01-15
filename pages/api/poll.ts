export {}
// import { NextApiRequest, NextApiResponse } from "next"

// import { client } from "../../util/aws"

// import { GetItemCommand } from '@aws-sdk/client-dynamodb'
// import { unstable_getServerSession } from "next-auth"

// const handler = async (req: NextApiRequest, res: NextApiResponse) => {
//     const session = await unstable_getServerSession(req)
//     switch (req.method) {
//         case "GET":
//             if (session) {
//                 const mc_res = await fetch(`http://${process.env.REMOTE_IP}:8080/`, {
//                     method: "GET",
//                     headers: {
//                         "mckey": process.env.MCREMOTE_KEY as string
//                     }
//                 })
//                 const mc_data = await mc_res.json()
//                 res.status(200).json(mc_data)
//             }
//             else {
//                 res.status(404).json({ message: "Session not found" })
//             }
//             break
//         default:
//             res.status(405).json({ message: "Method not allowed" })
//             break
//     }
// }

// export default handler
