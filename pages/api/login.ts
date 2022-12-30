import * as uuid from 'uuid'

import { GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb'
import { NextApiRequest, NextApiResponse } from 'next'
import {client} from '../../util/aws'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    switch (req.method) {
        case 'POST':
            const { username, password } = req.body
            const params = {
                TableName: "mcremote",
                Key: {
                    "user": {
                        S: username
                    }
                }
            }
            const command = new GetItemCommand(params)
            const data = await client.send(command)
            if (data.Item) {
                if (data.Item.pass.S === password) {
                    console.log("auth success")

                    let session_id = uuid.v4()

                    // Check if user has a session
                    const sessionParams = {
                        TableName: "sessions",
                        Key: {
                            "session": {
                                S: username
                            }
                        }
                    }
                    const sessionCommand = new GetItemCommand(sessionParams)

                    const sessionData = await client.send(sessionCommand)

                    if (sessionData.Item && sessionData.Item.session.S) {
                        console.log("Session found")
                        // Get item TTL
                        session_id = sessionData.Item.session.S
                    }
                    else {
                        console.log("Session not found")
                        // Create a session
                        const sessionParams = {
                            TableName: "sessions",
                            Item: {
                                "user": {
                                    S: username
                                },
                                "session": {
                                    S: session_id
                                }
                            }
                        }
                        const sessionCommand = new PutItemCommand(sessionParams)
                        await client.send(sessionCommand)
                    }

                    res.status(200).json({ message: "Login successful", session: session_id })

                } else {
                    res.status(401).json({ message: "Incorrect password" })
                }
            } else {
                res.status(404).json({ message: "User not found" })
            }
            break
        default:
            res.status(405).json({ message: "Method not allowed" })

        break
    }
}

export default handler;