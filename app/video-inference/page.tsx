import { UserView } from "../../lib/identity/definition"
import VideoInference from "@/components/VideoInference"

export default async function VideoInferencePage() {
  //const session = await verifySession()

  // const user: UserView = {
  //   id: session?.userId as string,
  //   name: session?.name as string,
  //   surname: session?.surname as string,
  //   chatid: session?.chatid as string,
  //   container: session?.container as string,
  // }

  return <VideoInference />
}
