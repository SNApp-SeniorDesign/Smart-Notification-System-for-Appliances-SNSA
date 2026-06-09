"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import { zodResolver } from "@hookform/resolvers/zod"
import {Controller, useForm} from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"


const API_URL = process.env.NEXT_PUBLIC_API_URL;

const formSchema = z.object({
    email: z.string()
            .trim()
            .min(1,"Email is required")
            .email("invalid email address"),
    username: z.string()
                .trim()
                .min(3,"Username must be at least 3 characters")
                .max(20,"Username must be at most 20 characters"),
    password: z.string()
                .trim()
                .min(8, "Password must be at least 8 characters")
                .max(10, "Password must be at most 10 characters"),

})

type SignFormProps = React.ComponentProps<"div"> & {
    onSuccess?: () => void
}

export function SignForm({
  className,
  onSuccess,
  ...props
}: SignFormProps) {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email:"",
            username:"",
            password:"",
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
    }

    toast.success("Account created - please log in to continue", {
        position: "top-center",
    })

    onSuccess?.();
    form.reset()
}

     
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
        </CardHeader>
        <CardContent>
          <form id="signin-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...form.register("email")}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <Input
                  id="username"
                  type="text"
                  placeholder="exampleName"
                  {...form.register("username")}
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                </div>
                <Input 
                    id="password" 
                    type="password"
                    {...form.register("password")} 
                    required />
              </Field>
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
