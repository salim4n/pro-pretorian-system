"use client"

import { PictureStored } from "@/lib/send-detection/action"
import { Badge } from "./ui/badge"
import { useRef } from "react"

interface IProps {
  pic: PictureStored
}

export default function ImgDisplayHistory({ pic }: IProps) {
  const imgRef = useRef(null)
  return (
    <div className="bg-background rounded-lg overflow-hidden group ">
      <img
        ref={imgRef}
        src={pic.url}
        alt="img"
        className="object-cover group-hover:opacity-80 transition-opacity cursor-pointer"
        style={{
          aspectRatio: `${imgRef.current?.naturalWidth}/${imgRef.current?.naturalHeight}`,
          objectFit: "cover",
        }}
      />

      <div className="p-4 border-zinc-700">
        {pic.detected?.map((d, i) => (
          <Badge key={i} className="m-2 cursor-default">
            {d.class} - {Math.round(parseFloat(d?.score?.toString()) * 100)}%
          </Badge>
        ))}
        <p className="text-muted-foreground text-sm">
          Uploaded on {new Date(pic.created).toDateString()} at {pic.hour}
        </p>
      </div>
    </div>
  )
}
