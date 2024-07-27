import 'server-only'

import * as dotenv from 'dotenv'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import type { SessionPayload, User } from './definition'
import  { TableClient, AzureNamedKeyCredential } from '@azure/data-tables'

dotenv.config()

const connectionString = process.env.AUTH_AZURE_STORAGE_CONNECTION_STRING as string
const accountName = process.env.AUTH_AZURE_ACCOUNT as string
const accountKey = process.env.AUTH_AZURE_ACCESS_KEY as string
const secretKey = process.env.AUTH_SECRET

if (!connectionString) throw Error('Azure Storage connectionString not found')
if (!accountName) throw Error('Azure Storage accountName not found')
if (!accountKey) throw Error('Azure Storage accountKey not found')

const key = new TextEncoder().encode(secretKey)

const credential = new AzureNamedKeyCredential(
    accountName,
    accountKey
)

const client = new TableClient(`https://${accountName}.table.core.windows.net`, "PretorianSystem", credential)

export async function encrypt(payload: SessionPayload) {
    return new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1hr')
      .sign(key)
  }

  export async function decrypt(session: string | undefined = '') {
    try {
      const { payload } = await jwtVerify(session, key, {
        algorithms: ['HS256'],
      });
      return payload
    } catch (error) {
      console.log('Failed to verify session');
      return null;
    }
  }

  export async function createSessionBdd(user: User) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  
    // 1. Create a session in the database
     await client.createEntity({
        partitionKey: 'Session',
        rowKey: user.rowKey,
        expiresAt,
        device: user.device,
    })
  
    // 2. Encrypt the session ID
    const session = await encrypt({
      userId: user.rowKey,
      device: user.device,
      role: user.role,
      name: user.name,
      surname: user.surname,
      expiresAt: expiresAt,
      chatid: user.chatid,
      container: user.container
    })

    // 3. Store the session in cookies for optimistic auth checks
    cookies().set('session', session, {
      httpOnly: true,
      secure: true,
      expires: expiresAt,
      sameSite: 'lax',
      path: '/',
      value: session,
    })
  }