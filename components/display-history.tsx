"use client"

import React from "react"
import { PictureStored } from "@/lib/send-detection/action"
import ImgDisplayHistory from "./img-display-history"

interface IProps {
  pictures: PictureStored[]
}

export default function DisplayHistory({ pictures }: IProps) {
  return (
    <div className="w-full max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Picture History</h1>
      <div className="flex flex-wrap">
        {pictures?.map((pic, i) => (
          <div className="w-1/2 p-2" key={i}>
            <ImgDisplayHistory key={i} pic={pic} />
          </div>
        ))}
      </div>
    </div>
  )
}
