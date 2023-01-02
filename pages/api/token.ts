export {}
// import { NextApiRequest, NextApiResponse } from "next"

// import { client } from "../../util/aws"

// import { GetItemCommand } from '@aws-sdk/client-dynamodb'


// const handler = async (req: NextApiRequest, res: NextApiResponse) => {
//     switch (req.method) {
//         case "POST":
//             const { session_id } = req.body
//             // Check if user has a session with sort key session_id
//             const params = {
//                 TableName: "sessions",
//                 Key: {
//                     "session": {
//                         S: session_id
//                     }
//                 }
//             }

            
//             const command = new GetItemCommand(params)
//             const data = await client.send(command)
//             if (data.Item) {
//                 res.status(200).json({ session: data.Item.session.S })
//             }
//             else {
//                 res.status(404).json({ message: "Session not found" })
//             }
//         break
//     }

// }

// export default handler
