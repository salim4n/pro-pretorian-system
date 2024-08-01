"use server"
import LabelDetection from "@/components/label-detection"
import { UserView } from "@/lib/identity/definition"
import { verifySession } from "@/lib/identity/session-local"

export default async function LabelDetectionPage() {
  const session = await verifySession()

  const user: UserView = {
    id: session?.userId as string,
    name: session?.name as string,
    surname: session?.surname as string,
    chatid: session.chatid && (session?.chatid as string),
    container: session?.container as string,
  }

  return <LabelDetection />
}
