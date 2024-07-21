
require('dotenv').config()

const accountName = process.env.AUTH_AZURE_ACCOUNT
const accountKey = process.env.AUTH_AZURE_ACCESS_KEY 
const containerName = process.env.AZURE_STORAGE_CONTAINER 
const connectionString = process.env.AUTH_AZURE_STORAGE_CONNECTION_STRING 
const token = process.env.TELEGRAM_BOT_TOKEN
const chatId = process.env.TELEGRAM_CHAT_ID

console.log(accountName, accountKey, containerName, connectionString, token, chatId)
