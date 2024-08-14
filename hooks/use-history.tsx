import { UserView } from "@/lib/identity/definition"
import { PictureStored, getPictures } from "@/lib/send-detection/action"
import { addDays } from "date-fns"
import { useEffect, useState } from "react"
import { DateRange } from "react-day-picker"

interface IProps {
  user: UserView
}

export default function useHistory({ user }: IProps) {
  const actualDate = new Date()
  const actualYear = actualDate.getFullYear()
  const actualMonth = actualDate.getMonth()
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(actualYear, actualMonth, 1),
    to: addDays(new Date(actualYear, actualMonth, 1), 6),
  })
  const [blobs, setBlobs] = useState<PictureStored[]>([])

  const fetchPicturesFromRange = async () => {
    if (date && date.from && date.to) {
      const fromDateStr = date.from.toISOString()
      const toDateStr = date.to.toISOString()
      const blobs = await getPictures(fromDateStr, toDateStr, user.container)
      setBlobs(blobs)
    }
  }

  useEffect(() => {
    fetchPicturesFromRange()
  }, [date])

  return { blobs, setBlobs, date, setDate }
}
