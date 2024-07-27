import { cache } from "react"
import { verifySession } from "../identity/session-local"
import { TableClient, AzureNamedKeyCredential } from "@azure/data-tables"

import * as dotenv from "dotenv"

dotenv.config()

const connectionString = process.env
  .AUTH_AZURE_STORAGE_CONNECTION_STRING as string
const accountName = process.env.AUTH_AZURE_ACCOUNT as string
const accountKey = process.env.AUTH_AZURE_ACCESS_KEY as string
const secretKey = process.env.AUTH_SECRET

if (!connectionString) throw Error("Azure Storage connectionString not found")
if (!accountName) throw Error("Azure Storage accountName not found")
if (!accountKey) throw Error("Azure Storage accountKey not found")

const key = new TextEncoder().encode(secretKey)
const credential = new AzureNamedKeyCredential(accountName, accountKey)
const client = new TableClient(
  `https://${accountName}.table.core.windows.net`,
  "PretorianSystem",
  credential
)

export const getUser = cache(async () => {
  const session = await verifySession()

  if (!session) {
    return null
  }

  const data = await client.getEntity(session.userId.toString(), "User")
  return data
})
