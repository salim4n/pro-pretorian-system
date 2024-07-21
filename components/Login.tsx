"use client"

import Link from "next/link"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { z } from "zod"
import { LoginFormSchema } from "@/app/lib/identity/definition"
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
import { login } from "@/app/lib/identity/auth"
import { AuroraBackground } from "./ui/aurora-background"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { Meteors } from "./ui/meteors"

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
      <div className="mx-auto grid w-[350px] gap-6 z-10">
        <div className="grid gap-2 text-center">
          <h1
            className={`text-3xl font-bold  bg-gradient-to-r from-blue-600 via-emerald-500 to-indigo-400 inline-block text-transparent bg-clip-text`}>
            Pretorian System Security{" "}
          </h1>
          <p className="text-muted-foreground ">
            Entrer votre email et mot de passe pour continuer
          </p>
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
                  <FormLabel
                    className={theme === "light" ? "text-black" : "text-white"}>
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="username"
                      placeholder="Votre email..."
                      className={
                        theme === "light" ? "text-black" : "text-white"
                      }
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
                  <FormLabel
                    className={theme === "light" ? "text-black" : "text-white"}>
                    Mot de passe
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      placeholder="Votre mot de passe..."
                      className={
                        theme === "light" ? "text-black" : "text-white"
                      }
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
              onMouseEnter={() => setButtonHover(true)}
              onMouseOut={() => setButtonHover(false)}
              className="w-full animate-shimmer bg-gradient">
              {loading ? "Chargement..." : "Se connecter"}
            </Button>
          </form>
        </Form>
        <div
          className={`mt-4 text-center text-sm z-10 ${
            theme === "light" ? "text-black" : "text-white"
          }`}>
          <span>Vous n'avez pas de compte ?</span>
          <Link href="/register" className="underline ml-1 border ">
            S'inscrire
          </Link>
        </div>
      </div>
    </AuroraBackground>
  )
}
