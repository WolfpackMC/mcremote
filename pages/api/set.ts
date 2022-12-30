import { NextApiRequest, NextApiResponse } from "next"

import { client } from "../../util/aws"

import { GetItemCommand } from '@aws-sdk/client-dynamodb'


const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    switch (req.method) {
        case "POST":
            const { session_id } = req.body
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
                const { redstone }: { redstone: number } = req.body
                // If redstone does not exist, return 400
                if (!redstone) {
                    res.status(400).json({ message: "Redstone not found" })
                    return
                }
                const mc_res = await fetch(`http://${process.env.REMOTE_IP}:8080/redstone_${redstone}`, {
                    method: "POST",
                    body: JSON.stringify({ session_id: session_id, mckey: process.env.MCREMOTE_KEY as string })
                })
                const body = await mc_res.text()
                res.status(200).json({ message: "Redstone set", number: redstone })
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