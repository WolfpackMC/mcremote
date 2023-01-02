import { DynamoDB, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb"
import { DynamoDBAdapter } from "@next-auth/dynamodb-adapter"

const config: DynamoDBClientConfig = {
  region: "us-east-1",
  credentials: {
      accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY as string,
  },
}

export const client = DynamoDBDocument.from(new DynamoDB(config), {
  marshallOptions: {
      convertEmptyValues: true,
      removeUndefinedValues: true,
      convertClassInstanceToMap: true,
  },
})