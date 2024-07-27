import 'server-only'

import { cache } from 'react'
import { verifySession } from './session-local'
import * as dotenv from 'dotenv'
import  { TableClient, AzureNamedKeyCredential } from '@azure/data-tables'

dotenv.config()

const connectionString = process.env.AUTH_AZURE_STORAGE_CONNECTION_STRING as string
const accountName = process.env.AUTH_AZURE_ACCOUNT as string
const accountKey = process.env.AUTH_AZURE_ACCESS_KEY as string

if (!connectionString) throw Error('Azure Storage connectionString not found')
if (!accountName) throw Error('Azure Storage accountName not found')
if (!accountKey) throw Error('Azure Storage accountKey not found')

const credential = new AzureNamedKeyCredential(
    accountName,
    accountKey
)

const client = new TableClient(`https://${accountName}.table.core.windows.net`, "PretorianSystem", credential)

export const getUser = cache(async () => {
  const session = await verifySession()
  if (!session) return null

  try {
    const data = await client.getEntity(session.userId.toString(), 'User')
    const user = data[0]
    return user
  } catch (error) {
    console.log('Failed to fetch user');
    return null;
  }
});