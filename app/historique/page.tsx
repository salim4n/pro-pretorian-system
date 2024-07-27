import History from "@/components/History"
import { verifySession } from "../../lib/identity/session-local"
import { UserView } from "../../lib/identity/definition"

async function PageHistory() {
  const session = await verifySession()

  const user: UserView = {
    id: session?.userId as string,
    name: session?.name as string,
    surname: session?.surname as string,
    chatid: session?.chatid as string,
    container: session?.container as string,
  }

  return <History user={user} />
}

export default PageHistory
