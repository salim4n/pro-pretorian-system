"use client"

import { UserView } from "@/lib/identity/definition"
import Link from "next/link"
import { useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { Button } from "./ui/button"
import { getChatId } from "@/lib/telegram-bot/action"
import { addChatIdToUser } from "@/lib/azure-table/action"
import { logout } from "@/lib/identity/auth"
import { useRouter } from "next/navigation"

interface ParamTelegramProps {
  user: UserView
}

export default function ParamTelegram({ user }: ParamTelegramProps) {
  const [uuid, setUuid] = useState("")
  const [status, setStatus] = useState("")
  const [chatId, setChatId] = useState("")

  const router = useRouter()

  const handleGenerateUuid = () => {
    const newUuid = uuidv4()
    setUuid(newUuid)
    setStatus("")
  }

  const handleVerifyUuid = async () => {
    try {
      setStatus("Vérification en cours...")
      const chatId = await getChatId(uuid)
      if (chatId) {
        setChatId(chatId)
        setStatus(
          "UUID vérifié avec succès ! Nous allons vous deconnecter pour appliquer les changements."
        )
        setTimeout(async () => {
          await addChatIdToUser(user.id, chatId).then(
            async () => await logout()
          )
        }, 3000)
      } else {
        setStatus(
          "UUID non trouvé. Assurez-vous d'avoir envoyé l'UUID au bot Telegram."
        )
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de l'UUID:", error)
      setStatus("Erreur lors de la vérification. Veuillez réessayer.")
    }
  }

  return !user.chatid ? (
    <div className="min-h-screen flex flex-col items-center justify-center ">
      <div className=" p-8 rounded shadow-md w-full max-w-lg bg-gradient ">
        <h1 className="text-2xl font-bold mb-4">
          Obtenir votre chatId Telegram
        </h1>
        <p className="mb-4">
          Pour obtenir votre chatId Telegram, veuillez suivre les étapes
          suivantes :
        </p>
        <ol className="list-decimal list-inside mb-4">
          <li>
            Ouvrez Telegram et recherchez notre bot
            <strong className="text-purple-300">
              <Link
                href="https://t.me/ProPretorianBot"
                target="_blank"
                rel="noopener noreferrer">
                @ProPretorionBot
              </Link>
            </strong>
            .
          </li>
          <li>Cliquez sur le bouton ci-dessous pour générer un UUID unique.</li>
          <li>Copiez l'UUID généré et envoyez-le à notre bot sur Telegram.</li>
          <li>
            Cliquez sur le bouton "Vérifier UUID" pour confirmer que vous avez
            bien envoyé l'UUID au bot.
          </li>
        </ol>

        <Button
          onClick={handleGenerateUuid}
          variant="secondary"
          className="py-2 px-4 rounded">
          Générer UUID
        </Button>

        {uuid && (
          <>
            <p className="mt-4">
              <strong>Votre UUID :</strong> {uuid}
            </p>
            <Button
              variant="secondary"
              onClick={handleVerifyUuid}
              className=" py-2 px-4 rounded  mt-2">
              Vérifier UUID
            </Button>
          </>
        )}

        {status && <p className="mt-4 text-red-500">{status}</p>}
        {chatId && (
          <p className="mt-4 text-green-500">
            <strong>Votre chatId :</strong> {chatId}
          </p>
        )}
      </div>
    </div>
  ) : (
    <div className="min-h-screen flex flex-col items-center justify-center ">
      <div className=" p-8 rounded shadow-md w-full max-w-lg bg-primary text-white">
        <h1 className="text-2xl font-bold mb-4">ChatId Telegram</h1>
        <p className="mb-4">
          Votre chatId Telegram est déjà enregistré. Vous pouvez continuer à
          utiliser l'application.
        </p>
        <Button
          onClick={() => router.push("/")}
          variant="secondary"
          className="py-2 px-4 rounded">
          Commencer
        </Button>
      </div>
    </div>
  )
}
