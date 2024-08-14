"use server"

import * as dotenv from "dotenv"
import {
  BlobSASPermissions,
  generateBlobSASQueryParameters,
  BlobServiceClient,
  StorageSharedKeyCredential,
  BlobSASSignatureValues,
} from "@azure/storage-blob"
import { DetectedObject } from "@tensorflow-models/coco-ssd"
import { UserView } from "../identity/definition"
import { sendDetection } from "../telegram-bot/action"

const { v4: uuidv4 } = require("uuid")

dotenv.config()

const accountName = process.env.AUTH_AZURE_ACCOUNT as string
const accountKey = process.env.AUTH_AZURE_ACCESS_KEY as string
const connectionString = process.env
  .AUTH_AZURE_STORAGE_CONNECTION_STRING as string

if (!accountName) throw Error("Azure Storage accountName not found")
if (!accountKey) throw Error("Azure Storage accountKey not found")
if (!connectionString) throw Error("Azure Storage connectionString not found")

const sharedKeyCredential = new StorageSharedKeyCredential(
  accountName,
  accountKey
)

const blobServiceClient = new BlobServiceClient(
  `https://${accountName}.blob.core.windows.net`,
  sharedKeyCredential
)

export type Detected = {
  detected: DetectedObject
  picture?: string
}

export type PictureStored = {
  url: string
  created: Date
  hour?: string
  detectedClass?: string
}

export async function getPictures(
  dateFrom: string | number | Date,
  dateTo: string | number | Date,
  containerName: string
): Promise<PictureStored[]> {
  const containerClient = blobServiceClient.getContainerClient(containerName)
  const blobs = containerClient.listBlobsFlat({
    includeMetadata: true,
  })
  const blobsArray: PictureStored[] = []

  for await (const blob of blobs) {
    const date = new Date(blob.properties.lastModified)
    const item: PictureStored = {
      url: blob.name,
      created: date,
      detectedClass: blob.metadata.class,
    }
    blobsArray.push(item)
  }

  const filteredBlobs = blobsArray.filter(blob => {
    const date = blob.created
    return date >= new Date(dateFrom) && date <= new Date(dateTo)
  })

  const pictures = await Promise.all(
    filteredBlobs.map(async blob => {
      const imageUrl = await generateSasToken(containerName, blob.url)
      return {
        url: imageUrl,
        created: blob.created,
        detectedClass: blob.detectedClass,
        hour: blob.created.toLocaleTimeString(),
      } as PictureStored
    })
  )
  console.log(pictures[0])
  return pictures
}

export async function sendPicture(body: Detected, user: UserView) {
  try {
    const picture = body.picture
    const base64Data =
      picture && picture.replace(/^data:image\/webp;base64,/, "")
    const buffer = base64Data && Buffer.from(base64Data, "base64")
    const blobName = `${uuidv4()}.png`
    const containerClient = blobServiceClient.getContainerClient(user.container)
    const blockBlobClient = containerClient.getBlockBlobClient(blobName)
    buffer &&
      (await blockBlobClient.upload(buffer, buffer.length, {
        blobHTTPHeaders: { blobContentType: "image/png" },
      }))
    await blockBlobClient.setMetadata({ class: body.detected.class })
    const imageUrl = await generateSasToken(user.container, blobName)
    const message = `Detection : ${
      body.detected.class
    }, Confidence: ${body.detected.score.toPrecision(
      2
    )} % \n Image: ${imageUrl}`
    await sendDetection(user.chatid, message)
  } catch (e) {
    console.error(e)
  }
}

export async function downloadPictures(
  dateFrom: string | number | Date,
  dateTo: string | number | Date,
  container: string
) {
  const containerClient = blobServiceClient.getContainerClient(container)
  const blobs = containerClient.listBlobsFlat()
  const blobsArray = []

  for await (const blob of blobs) {
    blobsArray.push(blob)
  }

  const filteredBlobs = blobsArray.filter(blob => {
    const date = new Date(blob.properties.lastModified)
    return date >= new Date(dateFrom) && date <= new Date(dateTo)
  })

  const images = await Promise.all(
    filteredBlobs.map(async blob => {
      const imageUrl = await generateSasToken(container, blob.name)
      return imageUrl
    })
  )
  console.log(`Pictures downloaded: ${images.length}`)
  console.table(images)

  return images
}

export async function deletePictures(
  dateFrom: string | number | Date,
  dateTo: string | number | Date,
  container: string
) {
  const containerClient = blobServiceClient.getContainerClient(container)
  const blobs = containerClient.listBlobsFlat()
  const blobsArray = []

  for await (const blob of blobs) {
    blobsArray.push(blob)
  }

  const filteredBlobs = blobsArray.filter(blob => {
    const date = new Date(blob.properties.lastModified)
    return date >= new Date(dateFrom) && date <= new Date(dateTo)
  })

  await Promise.all(
    filteredBlobs.map(async blob => {
      const blobClient = containerClient.getBlobClient(blob.name)
      await blobClient.delete()
      console.log(`Blob deleted: ${blob.name}`)
    })
  )
  return filteredBlobs.length
}

export const generateSasToken = async (
  containerName: string,
  blobName: string
): Promise<string> => {
  const sharedKeyCredential = new StorageSharedKeyCredential(
    accountName,
    accountKey
  )
  const blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    sharedKeyCredential
  )
  const containerClient = blobServiceClient.getContainerClient(containerName)
  const blobClient = containerClient.getBlobClient(blobName)

  const expiryDate = new Date()
  expiryDate.setHours(expiryDate.getHours() + 12)

  const sasOptions: BlobSASSignatureValues = {
    containerName: containerName,
    blobName: blobName,
    permissions: BlobSASPermissions.parse("r"), // Permission de lecture
    expiresOn: expiryDate,
  }
  const sasToken = generateBlobSASQueryParameters(
    sasOptions,
    sharedKeyCredential
  ).toString()
  const imageUrl = blobClient.url + "?" + sasToken

  return imageUrl
}
