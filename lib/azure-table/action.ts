"use server"

import * as dotenv from "dotenv"
import { TableClient, AzureNamedKeyCredential } from "@azure/data-tables"
import { User } from "../identity/definition"

dotenv.config()

const connectionString = process.env
  .AUTH_AZURE_STORAGE_CONNECTION_STRING as string
const accountName = process.env.AUTH_AZURE_ACCOUNT as string
const accountKey = process.env.AUTH_AZURE_ACCESS_KEY as string

if (!connectionString) throw Error("Azure Storage connectionString not found")
if (!accountName) throw Error("Azure Storage accountName not found")
if (!accountKey) throw Error("Azure Storage accountKey not found")

const credential = new AzureNamedKeyCredential(accountName, accountKey)

const client = new TableClient(
  `https://${accountName}.table.core.windows.net`,
  "propretoriantable",
  credential
)

export const addChatIdToUser = async (rowKey: string, chatid: string) => {
  const entity = {
    partitionKey: "User",
    rowKey: rowKey,
    chatid: chatid,
  }

  await client
    .updateEntity(entity)
    .catch(error => console.log(error))
    .then(() => console.log("ChatId added to user"))
}

export const getUser = async (rowKey: string) => {
  const user = await client.getEntity<User>("User", rowKey)
  return user
}

export const getUsers = async () => {
  const users = client.listEntities({
    queryOptions: { filter: `PartitionKey eq 'User'` },
  })
  return users
}

export const deleteUser = async (rowKey: string) => {
  await client
    .deleteEntity("User", rowKey)
    .catch(error => console.log(error))
    .then(() => console.log("User deleted", rowKey))
}
