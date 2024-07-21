"use client"
import React from "react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible"
import { FAQ } from "../models/faq"
import { Card, CardContent, CardDescription, CardTitle } from "./ui/card"

export default function FaqCollapsible({ faq }: { faq: FAQ[] }) {
  return (
    <div>
      <Card className="bg-transparent border-none">
        {faq.map((item, index) => (
          <Collapsible key={index}>
            <CollapsibleTrigger className="flex items-center justify-between w-full text-lg font-medium">
              <CardContent>
                <CardTitle>{item.question}</CardTitle>
              </CardContent>
              <ChevronDownIcon className="w-5 h-5 transition-transform [&[data-state=open]]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="text-muted-foreground text-pretty">
                <CardContent>
                  <CardDescription>{item.answer}</CardDescription>
                </CardContent>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </Card>
    </div>
  )
}

function ChevronDownIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}
