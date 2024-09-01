"use client"

import { AuroraBackground } from "./ui/aurora-background"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { Meteors } from "./ui/meteors"
import { BlurIn } from "./ui/text-blur"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState } from "react"
import { signup } from "@/lib/identity/auth"
import { useToast } from "./ui/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"

export const signupFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Votre nom doit contenir au minimum deux caractères" })
    .max(50, { message: "Votre nom doit contenir au maximum 50 caractères" }),
  surname: z
    .string()
    .min(2, {
      message: "Votre prénom doit contenir au minimum deux caractères",
    })
    .max(50, {
      message: "Votre prénom doit contenir au maximum 50 caractères",
    }),
  email: z
    .string()
    .email({ message: "Veuillez entrer une adresse email valide" }),
  password: z.string().min(6).max(24),
})
// confirmPassword: z.string().min(6).max(24),
// country: z.string().min(2),
// postalCode: z.string().length(5),
// city: z.string().min(2).max(255),
// }).superRefine(({ confirmPassword, password }, ctx) => {
//     if (confirmPassword !== password) {
//         ctx.addIssue({
//             code: "custom",
//             message: "Les mots de passe ne correspondent pas",
//             path: ['confirmPassword']
//         })
//     }
// })

export default function RegisterComponent() {
  const { theme } = useTheme()
  const [buttonHover, setButtonHover] = useState(false)
  const form = useForm<z.infer<typeof signupFormSchema>>({
    resolver: zodResolver(signupFormSchema),
  })
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function onSubmit(values: z.infer<typeof signupFormSchema>) {
    setLoading(true)
    const device = window && window.navigator && window.navigator.userAgent
    const result = await signup(values as FormData, device)

    if (result?.errors) {
      form.setError("email", {
        type: "manual",
        message: result.errors[0].message,
      })
      toast({
        title: "Erreur",
        description: result.errors[0].message,
        content: "error",
        color: "#EF4444",
        duration: 5000,
      })
    } else {
      toast({
        title: "Inscription réussie",
        description: "Vous êtes maintenant inscrit",
        content: "success",
        color: "#10B981",
        duration: 5000,
      })
      router.push("/")
    }
    setLoading(false)
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
            text="Pro Pretorian System Solution"
            balise="h1"
            className={`text-3xl font-bold bg-gradient-to-r from-indigo-500 via-yellow-500 to-indigo-500 inline-block text-transparent bg-clip-text`}
          />
          <BlurIn
            text="Inscrivez-vous pour continuer"
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-indigo-500">
                    <BlurIn text="Nom" balise="span" className="text-sm" />
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Votre nom..."
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
              name="surname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-indigo-500">
                    <BlurIn text="Prénom" balise="span" className="text-sm" />
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Votre prénom..."
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
                text={loading ? "Chargement..." : "S'inscrire"}
                balise="span"
                className="text-sm"
              />
            </Button>
          </form>
        </Form>
        <div className={`mt-4 text-center text-sm z-10 text-indigo-500`}>
          <BlurIn text="Vous avez déjà un compte ?" balise="span" />
          <Link href="/login" className="underline ml-1 border">
            <BlurIn text="Connectez-vous" balise="span" className="text-sm" />
          </Link>
        </div>
      </div>
    </AuroraBackground>
  )
}
