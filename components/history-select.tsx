"use client"

import { cn } from "@/lib/utils"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Calendar } from "./ui/calendar"
import { format } from "date-fns"
import { CalendarIcon, LucideTrash2 } from "lucide-react"
import { DateRange } from "react-day-picker"
import { Dispatch, SetStateAction } from "react"

interface IProps {
  date: DateRange
  setDate: Dispatch<SetStateAction<DateRange>>
  pictures?: string[]
  handleDeleteAllSelection: () => void
}

export default function HistorySelect({
  date,
  setDate,
  pictures,
  handleDeleteAllSelection,
}: IProps) {
  return (
    <Card className="bg-background">
      <CardHeader className="flex flex-row items-start bg-muted/50">
        <div className="grid gap-0.5">
          <CardTitle className="text-lg">Date sélection</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 text-sm font-bold">
        <div className={cn("grid gap-2")}>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[300px] justify-start text-left font-normal m-3",
                  !date && "text-muted-foreground"
                )}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "dd LLL, y")} -{" "}
                      {format(date.to, "dd LLL, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Selectionner une date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
      <CardContent className="p-6 text-sm font-bold">
        <Button
          className=" w-full text-center mt-4"
          variant="destructive"
          disabled={pictures?.length === 0}
          onClick={handleDeleteAllSelection}>
          <LucideTrash2 className="mr-2 h-4 w-4" />
          {`Supprimer toutes les détections de la période sélectionnée`}
        </Button>
      </CardContent>
    </Card>
  )
}
