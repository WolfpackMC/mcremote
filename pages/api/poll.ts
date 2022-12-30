import { NextApiRequest, NextApiResponse } from "next"

import { client } from "../../util/aws"

import { GetItemCommand } from '@aws-sdk/client-dynamodb'


const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    switch (req.method) {
        case "GET":
            const headers = req.headers
            const session_id = headers.session_id as string
            // Check if user has a session with sort key session_id
            const params = {
                TableName: "sessions",
                Key: {
                    "session": {
                        S: session_id
                    }
                }
            }

            
            const command = new GetItemCommand(params)
            const data = await client.send(command)
            if (data.Item) {
                const mc_res = await fetch(`http://${process.env.REMOTE_IP}:8080/`, {
                    method: "GET",
                    headers: {
                        "session_id": session_id,
                        "mckey": process.env.MCREMOTE_KEY as string
                    }
                })
                const mc_data = await mc_res.json()
                res.status(200).json(mc_data)
            }
            else {
                res.status(404).json({ message: "Session not found" })
            }
            break
        default:
            res.status(405).json({ message: "Method not allowed" })
            break
    }
}

export default handler