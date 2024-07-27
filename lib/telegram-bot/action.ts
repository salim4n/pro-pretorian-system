"use server"

import * as dotenv from 'dotenv'

dotenv.config()

const token = process.env.TELEGRAM_BOT_TOKEN as string
if (!token) throw Error('Telegram Bot token not found')

export const sendDetection = async (chatId: string, message: string) => {
    const url = `https://api.telegram.org/bot${token}/sendMessage`
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: chatId,
            text: message,
        }),
    })
    return response.json()
}

export const getChatId = async (text:string) => {
    const url = `https://api.telegram.org/bot${token}/getUpdates`
    const response = await fetch(url)
    let chatId = ''
    const data = await response.json()
    data.result.forEach((element:any) => {
        if (element?.message?.text?.trim()?.toLowerCase()  === text?.trim()?.toLowerCase()) {
            console.log(element.message.chat.id)
            chatId = element.message.chat.id
        }
    })
    return chatId
}