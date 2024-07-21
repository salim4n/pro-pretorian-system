"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from "./ui/card"
import { Label } from "./ui/label"
import { Button } from "./ui/button"

interface PriceCardProps {
    title: string
    price: number
    features: string[]
    description: string
    buttonText: string
    url: string
}

export default function PriceCard({title, price, features,description,buttonText,url}: PriceCardProps){

    return(
      <Card className="flex flex-col justify-between h-full transition transform hover:scale-105 hover:shadow-lg">
        <CardTitle className="text-2xl font-bold text-center m-2">
          {title}
        </CardTitle>
        <CardDescription className="text-center">
          {description}
        </CardDescription>
        <div className="text-lg font-semibold text-center">
            <Label>
               {title === "Entreprise" ? (
                     "Contactez-nous pour un devis personnalisé"
                ) : (
                     `${price}€/mois`
               )}
            </Label>
        </div>
        <CardContent className="flex flex-col items-center space-y-2 m-4">
            <ul className="space-y-1">
                {features.map((feature, index) => (
                    <li key={index}>
                    <div className="flex items-center space-x-2">
                        <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="size-5 text-green-700"
                        >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        <span>{feature}</span>
                    </div>
                    </li>
                ))}
            </ul>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href={url}>
            <Button>{buttonText}</Button>
          </Link>
        </CardFooter>
      </Card>
    )

}