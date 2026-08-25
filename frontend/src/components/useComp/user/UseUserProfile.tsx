"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import { zodResolver } from "@hookform/resolvers/zod"
import {Controller, useForm} from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import {useRouter} from "next/navigation"
import {setToken} from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const formSchema = z.object({
    email: z.string()
            .trim()
            .email("invalid email address")
            .optional()
            .or(z.literal("")),
    username: z.string()
                .trim()
                .min(3,"Username must be at least 3 characters")
                .max(20,"Username must be at most 20 characters")
                .optional()
                .or(z.literal("")),
    password: z.string()
                .trim()
                .min(8, "Password must be at least 8 characters")
                .max(10, "Password must be at most 10 characters")
                .optional()
                .or(z.literal("")),
})

type SignFormProps = React.ComponentProps<"div"> & {
  onRegisterSuccess?: () => void
  onAutoLoginSuccess?: () => void  
}

export function SignForm({
  className,
  onRegisterSuccess,
  onAutoLoginSuccess,
  ...props
}: SignFormProps) {

    const router = useRouter()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email:"",
            username:"",
            password:"",
            confirmPassword:""
        }
    })
    async function onSubmit(data: z.infer<typeof formSchema>){
      const res = await fetch(`${API_URL}/users/register`,{
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        body: JSON.stringify(data),
    })

    if(!res.ok){
        const errorData = await res.json()
        toast.error(`Registration failed: ${errorData?.message || "Unknown error"}`, {
            position: "top-center",
        })
        return
    }

    if(res.status !== 201){
        toast.error("Unexpected response from server. Please try again later.",{
            position: "top-center",
        })
        return
    }

    try {
      const loginRes = await fetch(`${API_URL}/users/login`,{
        method: "Post",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          username: data.email,
          password: data.password
        }).toString()
      })

      if(loginRes.ok){
        const returnedLogin = await loginRes.json()

        setToken(returnedLogin.access_token, true)
        toast.success("Account created - welcome!", { position: "top-center"})
        form.reset()
        onAutoLoginSuccess?.()
        router.push("/dashboard")
        return
      } 
    }catch {}

    toast.success("Account created - please log in to continue", {
        position: "top-center",
    })

    form.reset()
    onRegisterSuccess?.()

}

     
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
        </CardHeader>
        <CardContent>
          <form id="signin-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="email"
                control={form.control}
                render={({field, fieldState}) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      {...field}
                      id="email"
                      aria-invalid={fieldState.invalid}
                      placeholder="@example.com"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              
              />
              <Controller
                name="username"
                control={(form.control)}
                render={({field, fieldState}) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="username">Username</FieldLabel>
                    <Input
                      {...field}
                      id="username"
                      aria-invalid={fieldState.invalid}
                      placeholder="John_doe"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="password"
                control={form.control}
                render={({field, fieldState}) => (
                  <Field data-invalid={fieldState.invalid}>
                    <div className="flex items-center">
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                    </div>
                    <Input
                      {...field}
                      id="password"
                      aria-invalid={fieldState.invalid}
                      type="password"
                      placeholder="******"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="confirmPassword"
                control={form.control}
                render={({field, fieldState}) => (
                  <Field data-invalid={fieldState.invalid}>
                    <div className="flex items-center">
                      <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                    </div>
                    <Input
                      {...field}
                      id="confirmPassword"
                      aria-invalid={fieldState.invalid}
                      type="password"
                      placeholder="*******"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                  
                )}
              />
              <Field>
                <Button type="submit">Sign Up</Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
