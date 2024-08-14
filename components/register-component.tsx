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
        <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px] gradient">
          <div className="flex items-center justify-center py-12">
            <div className="mx-auto grid w-[350px] gap-6">
              <div className="grid gap-2 text-center">
                <h1 className="text-3xl font-bold">
                  Pretorian System Security
                </h1>
                <p className="text-balance text-muted-foreground">
                  S'inscrire pour continuer
                </p>
              </div>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom</FormLabel>
                        <FormControl>
                          <Input placeholder="Votre nom..." {...field} />
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
                        <FormLabel>Prénom</FormLabel>
                        <FormControl>
                          <Input placeholder="Votre prénom..." {...field} />
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
                  {/* <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Confirmez votre mot de passe
                                        </FormLabel>
                                        <FormControl>
                                            <Input type="password" autoComplete="new-password" placeholder="Confirmez votre mot de passe..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="country"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Sélectionnez votre pays
                                        </FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} defaultValue={field?.value}>
                                                <SelectTrigger className="w-[180px]">
                                                    <SelectValue placeholder="Pays" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {langageList.map((langage) => (
                                                        <SelectItem key={langage.id} value={langage.code}>
                                                            {langage.emoji} - {langage.pays}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="postalCode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Code postal
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="Code postal..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="city"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Ville
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ville..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            /> */}

                  <Button type="submit" disabled={loading}>
                    {loading ? "Chargement..." : "S'inscrire"}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </AuroraBackground>
  )
}
