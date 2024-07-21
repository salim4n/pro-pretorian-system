"use server"

import * as dotenv from "dotenv"
import { TableClient, AzureNamedKeyCredential } from "@azure/data-tables"
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob"
const { v4: uuidv4 } = require("uuid")
import bcrypt from "bcrypt"
import { createSession, deleteSession } from "./session-local"
import { createSessionBdd } from "./session"
import { redirect } from "next/navigation"

dotenv.config()

const connectionString = process.env
  .AUTH_AZURE_STORAGE_CONNECTION_STRING as string
const accountName = process.env.AUTH_AZURE_ACCOUNT as string
const accountKey = process.env.AUTH_AZURE_ACCESS_KEY as string

if (!connectionString) throw Error("Azure Storage connectionString not found")
if (!accountName) throw Error("Azure Storage accountName not found")
if (!accountKey) throw Error("Azure Storage accountKey not found")

const credential = new AzureNamedKeyCredential(accountName, accountKey)

const sharedKeyCredential = new StorageSharedKeyCredential(
  accountName,
  accountKey
)

const blobServiceClient = new BlobServiceClient(
  `https://${accountName}.blob.core.windows.net`,
  sharedKeyCredential
)

const client = new TableClient(
  `https://${accountName}.table.core.windows.net`,
  "propretoriantable",
  credential
)

export async function signup(formData: any, device: string) {
  const validateResult = {
    name: formData.name,
    surname: formData.surname,
    email: formData.email,
    password: formData.password,
  }

  const { name, surname, email, password } = validateResult

  // 3. Check if the user's email already exists
  let entitiesIter = client.listEntities()
  for await (const entity of entitiesIter) {
    if (entity.email === email) {
      return {
        message: "Cet email existe déjà. Veuillez vous connecter.",
      } as any
    }
  }

  // create a container for the user
  const containerName = uuidv4()
  const containerClient = blobServiceClient.getContainerClient(containerName)
  await containerClient.create()

  // Hash the user's password
  const hashedPassword = await bcrypt.hash(password, 10)
  // create user
  const user = {
    partitionKey: "User",
    rowKey: uuidv4(),
    name,
    surname,
    email,
    password: hashedPassword,
    role: "pro",
    createdAt: new Date().toISOString(),
    expireDate: "TODO : Paid subscription date",
    device: device,
    container: containerName,
  }

  // 4. Insert the user into the database
  await client.createEntity(user).then(() => {
    createSession(user)
    return {
      message: "Utilisateur créé avec succès",
      user: user,
    }
  })
}

export async function login(formData: any, device: string) {
  const validateResult = {
    email: formData.email,
    password: formData.password,
  }

  const { email, password } = validateResult

  // 3. Check if the user's email already exists
  let entitiesIter = client.listEntities()
  let i = 1
  for await (const entity of entitiesIter) {
    console.log(
      `Entity${i}: PartitionKey: ${entity?.partitionKey} RowKey: ${entity?.rowKey}`
    )
    i++
    if (entity.email === email) {
      const passwordMatch = await bcrypt.compare(
        password,
        entity.password as string
      )

      if (passwordMatch) {
        console.log("Password match")
        const userEntity = {
          partitionKey: entity.partitionKey as string,
          rowKey: entity.rowKey as string,
          name: entity.name as string,
          surname: entity.surname as string,
          email: entity.email as string,
          password: entity.password as string,
          role: entity.role as string,
          createdAt: entity.createdAt as string,
          expireDate: entity.expireDate as string,
          device: device,
          chatid: entity.chatid as string,
          container: entity.container as string,
        }
        createSession(userEntity)
        createSessionBdd(userEntity)

        return {
          message: "Connecté avec succès",
          isAuth: true,
          user: userEntity,
        }
      } else {
        return {
          message: "Email ou mot de passe incorrect",
          isAuth: false,
        } as any
      }
    }
  }

  return {
    message: "Email ou mot de passe incorrect",
    isAuth: false,
  } as any
}

export async function logout() {
  deleteSession()
  redirect("/login")
}
