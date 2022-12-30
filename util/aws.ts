import * as uuid from 'uuid'
import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  UpdateItemCommand,
  DeleteItemCommand
} from '@aws-sdk/client-dynamodb'
import getConfig from 'next/config'
import { NextApiRequest, NextApiResponse } from 'next'

const { publicRuntimeConfig } = getConfig()
const { READ_ACCESS_KEY, READ_SECRET_KEY } = publicRuntimeConfig

export const client = new DynamoDBClient({
    credentials: {
        accessKeyId: READ_ACCESS_KEY,
        secretAccessKey: READ_SECRET_KEY
    },
    region: "us-east-1"
})