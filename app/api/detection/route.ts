import { NextRequest, NextResponse } from "next/server"
import { UserView } from "@/lib/identity/definition"
import { deleteSession } from "@/lib/identity/session-local"
import { jwtVerify } from "jose"
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob"
import * as dotenv from "dotenv"
import { generateSasToken } from "@/lib/send-detection/action"
import { sendDetection } from "@/lib/telegram-bot/action"

const { v4: uuidv4 } = require("uuid")
dotenv.config()

const secretKey = process.env.AUTH_SECRET
const accountName = process.env.AUTH_AZURE_ACCOUNT as string
const accountKey = process.env.AUTH_AZURE_ACCESS_KEY as string

if (!secretKey) throw Error("AUTH_SECRET not found")
if (!accountName) throw Error("Azure Storage accountName not found")
if (!accountKey) throw Error("Azure Storage accountKey not found")

const key = new TextEncoder().encode(secretKey)

export async function POST(req: NextRequest) {
  try {
    const { detected, picture, cookie } = await req.json()

    if (!picture || !detected || !cookie) {
      return NextResponse.json(
        { message: "Image is required" },
        { status: 400 }
      )
    }

    // Process and validate the cookie
    const { payload } = await jwtVerify(cookie, key, {
      algorithms: ["HS256"],
    }).catch(e => {
      console.error(e)
      deleteSession()
      throw Error(`Unauthorized user : ${e} ------ ${cookie}`)
    })

    const user: UserView = {
      id: payload?.userId as string,
      name: payload?.name as string,
      surname: payload?.surname as string,
      chatid: payload?.chatid as string,
      container: payload?.container as string,
    }

    // Process the image
    // Convertir l'image base64 en Buffer
    const buffer = Buffer.from(picture, "base64")

    if (!buffer.length) {
      return NextResponse.json(
        { message: "Failed to process image" },
        { status: 400 }
      )
    }

    // Upload the image to Azure Blob Storage
    const sharedKeyCredential = new StorageSharedKeyCredential(
      accountName,
      accountKey
    )
    const blobServiceClient = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      sharedKeyCredential
    )
    const containerClient = blobServiceClient.getContainerClient(user.container)
    const blobName = `${uuidv4()}.png`
    const blockBlobClient = containerClient.getBlockBlobClient(blobName)

    await blockBlobClient.upload(buffer, buffer.length, {
      blobHTTPHeaders: { blobContentType: "image/png" },
    })
    await blockBlobClient.setMetadata({ class: detected.class })

    // Generate SAS token for the image URL
    const imageUrl = await generateSasToken(user.container, blobName)
    const message = `Detection: ${
      detected.class
    }, Confidence: ${detected.score.toPrecision(2)} % \n Image: ${imageUrl}`
    await sendDetection(user.chatid, message)

    return NextResponse.json({ message: "Detection sent successfully" })
  } catch (e) {
    console.error(e)
    if (e instanceof Error) {
      return NextResponse.json({ message: e.message }, { status: 400 })
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
