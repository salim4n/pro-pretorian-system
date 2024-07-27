"use server"

import { UserView } from "@/lib/identity/definition"
import { verifySession } from "@/lib/identity/session-local"
import ParamTelegram from "@/components/ParamTelegram"

export default async function Page() {
  const session = await verifySession()

  const user: UserView = {
    id: session?.userId as string,
    name: session?.name as string,
    surname: session?.surname as string,
    chatid: session.chatid && (session?.chatid as string),
    container: session?.container as string,
  }

  return <ParamTelegram user={user} />
}
