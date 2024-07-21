"use client"

import Link from "next/link"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import Image from "next/image"
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

export default function Login() {
  const form = useForm<z.infer<typeof LoginFormSchema>>({
    resolver: zodResolver(LoginFormSchema),
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function onSubmit(value: z.infer<typeof LoginFormSchema>) {
    setLoading(true)
    const device = window && window.navigator && window.navigator.userAgent
    const result = await login(value, device)
    setLoading(false)
    if (result.isAuth === true) {
      router.push("/board")
    } else {
      alert(result.message)
    }
  }

  return (
    <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
      <div className="flex items-center justify-center py-12 lg:py-0">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Pretorian System Security</h1>
            <p className="text-muted-foreground">
              Entrer votre email et mot de passe pour continuer
            </p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        autoComplete="username"
                        placeholder="Votre email..."
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
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        placeholder="Votre mot de passe..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Chargement..." : "Se connecter"}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            <span>Vous n'avez pas de compte ?</span>
            <Link href="/register" className="underline ml-1">
              S'inscrire
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden lg:flex bg-muted items-center justify-center">
        <Image
          src="/pretorian.jpeg"
          alt="Image"
          width="1920"
          height="1080"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  )
}
