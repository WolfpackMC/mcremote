import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  ScanCommand,
} from 'https://esm.sh/@aws-sdk/client-dynamodb@3.241.0'

import * as log from 'https://deno.land/std@0.170.0/log/mod.ts'

import {
  encode,
  decode,
} from 'https://deno.land/std@0.170.0/encoding/base64.ts'

import 'https://deno.land/x/dotenv@v3.2.0/load.ts'

import { Input, Secret } from 'https://deno.land/x/cliffy@v0.25.6/prompt/mod.ts'

import { PrismaClient } from './node_modules/.prisma/client/deno/edge.ts'
const prisma = new PrismaClient()

// Create a client instance by providing your region information.
// The credentials are obtained from environment variables which
// we set during our project creation step on Deno Deploy.
const client = new DynamoDBClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID') as string,
    secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY') as string,
  },
})

const suggestions = ['prisma', 'dynamodb']

const promptMethod: () => Promise<string> = async () => {
  const method = await Input.prompt({
    message: 'Choose a database method (prisma works best)',
    suggestions: suggestions,
    list: true,
    info: true,
  })

  if (!suggestions.includes(method)) {
    log.warning('Invalid method')
    return promptMethod()
  }

  return method
}

const method = await promptMethod()

// Prompt the user to enter a username.
const promptUsername: () => Promise<string> = async () => {
  const name: string = await Input.prompt('Enter a username')

  if (!name) {
    log.warning('Username is required')
    return promptUsername()
  }

  if (method === 'dynamodb') {
    const out = await client.send(
      new GetItemCommand({
        TableName: 'mcremote_users',
        Key: {
          username: { S: name },
        },
      }),
    )

    if (out.Item) {
      log.warning('Username already exists')
      return promptUsername()
    }
  }

  if (method === 'prisma') {
    const out = await prisma.account.findUnique({
      where: {
        name: 'lel',
      },
    })

    if (out) {
      log.warning('Username already exists')
      return promptUsername()
    }
  }
  return name
}

const username = await promptUsername()

const promptPassword: () => Promise<string> = async () => {
  const password: string = await Secret.prompt('Enter a password')

  if (!password) {
    log.warning('Password is required')
  }

  const password2: string = await Secret.prompt('Confirm password')

  if (password !== password2) {
    log.warning('Passwords do not match')
    return promptPassword()
  }

  return password
}

const password = await promptPassword()

const salt = crypto.getRandomValues(new Uint8Array(16))

const pepper = Deno.env.get('PEPPER') as string

if (!pepper) {
  log.error('PEPPER is not set')
  Deno.exit(1)
} else {
  log.info('PEPPER is set')
}

const hash = await crypto.subtle.digest(
  'SHA-256',
  new TextEncoder().encode(pepper + salt + password),
)

const encodedSalt = encode(salt)
const encodedHash = encode(new Uint8Array(hash))

// Verify the password.
const verifyPassword = async (
  password: string,
  encodedSalt: string,
  encodedHash: string,
) => {
  const salt = decode(encodedSalt)
  const hash = decode(encodedHash)

  const newHash = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(pepper + salt + password),
  )

  return new Uint8Array(newHash).every((v, i) => v === hash[i])
}

const verified = await verifyPassword(password, encodedSalt, encodedHash)

if (!verified) {
  log.error('Somehow, the password was not verified.')
  Deno.exit(1)
}

const out = `${encodedSalt}$${encodedHash}`

switch (method) {
  case 'dynamodb': {
    // Scan the table for the highest ID.

    const scanCommand = new ScanCommand({
      TableName: 'mcremote_users',
      ProjectionExpression: 'id',
    })

    const scanData = await client.send(scanCommand)

    if (scanData.$metadata.httpStatusCode !== 200) {
      log.error('Error scanning table')
      Deno.exit(1)
    }

    const ids =
      scanData.Items?.map(item => item.id?.N as string).map(id =>
        parseInt(id),
      ) ?? []

    // If there are no IDs, start at 1.
    // Otherwise, increment the highest ID by 1.
    const id = ids.length === 0 ? 0 : Math.max(...ids) + 1

    const params = {
      TableName: 'mcremote_users',
      Item: {
        username: { S: username },
        pass: { S: out },
        id: { N: id.toString() },
      },
    }

    const command = new PutItemCommand(params)

    const data = await client.send(command)

    if (data.$metadata.httpStatusCode !== 200) {
      log.error('Error creating user')
      Deno.exit(1)
    }
    break
  }
  case 'prisma':
    break
  default:
    log.error('Invalid method')
    Deno.exit(1)
}

// Verify the password.
