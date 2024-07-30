"use client"

import Link from "next/link"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { z } from "zod"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form"

import { AuroraBackground } from "./ui/aurora-background"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { Meteors } from "./ui/meteors"
import { BlurIn } from "./ui/text-blur"
import { login } from "@/app/lib/identity/auth"
import { LoginFormSchema } from "@/app/lib/identity/definition"

export default function Login() {
  const { theme } = useTheme()

  const form = useForm<z.infer<typeof LoginFormSchema>>({
    resolver: zodResolver(LoginFormSchema),
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [buttonHover, setButtonHover] = useState(false)

  async function onSubmit(value: z.infer<typeof LoginFormSchema>) {
    setLoading(true)
    const device = window && window.navigator && window.navigator.userAgent
    const result = await login(value, device)
    setLoading(false)
    if (result.isAuth === true) {
      router.push("/")
    } else {
      alert(result.message)
    }
  }

  return (
    <AuroraBackground>
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative flex flex-col gap-4 items-center justify-center px-4"></motion.div>
      {buttonHover && <Meteors number={30} />}
      <div
        className="mx-auto grid w-[350px] gap-6 z-10"
        onMouseEnter={() => setButtonHover(true)}
        onMouseLeave={() => setButtonHover(false)}>
        <div className="grid gap-2 text-center">
          <BlurIn
            text="Pro Pretorian System Solution  "
            balise="h1"
            className={`text-3xl font-bold  bg-gradient-to-r from-indigo-500 via-yellow-500 to-indigo-500 inline-block text-transparent bg-clip-text`}
          />{" "}
          <BlurIn
            text="Connectez-vous pour continuer"
            balise="h3"
            className={`text-sm font-bold bg-gradient-to-r from-gray-500 via-gray-200 to-gray-500 inline-block text-transparent bg-clip-text`}
          />
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 z-10">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-indigo-500">
                    <BlurIn text="Email" balise="span" className="text-sm" />
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="username"
                      placeholder="Votre email..."
                      className="text-indigo-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-indigo-500">
                    <BlurIn
                      text="Mot de passe"
                      balise="span"
                      className="text-sm"
                    />
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      placeholder="Votre mot de passe..."
                      className="text-indigo-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={loading}
              className="w-full animate-shimmer bg-gradient">
              <BlurIn
                text={loading ? "Chargement..." : "Se connecter"}
                balise="span"
                className="text-sm"
              />
            </Button>
          </form>
        </Form>
        <div className={`mt-4 text-center text-sm z-10 text-indigo-500`}>
          <BlurIn text="Vous n'avez pas de compte ?" balise="span" />
          <Link href="/register" className="underline ml-1 border ">
            <BlurIn text="Inscrivez-vous" balise="span" className="text-sm" />
          </Link>
        </div>
      </div>
    </AuroraBackground>
  )
}
