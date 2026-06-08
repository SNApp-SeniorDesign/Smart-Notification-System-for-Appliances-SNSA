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
    password: z.string()
                .trim()
                .min(8, "Password must be at least 8 characters")
                .max(10, "Password must be at most 10 characters"),

})


export function LogForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email:"",
            password:"",
        }
    })
    async function onSubmit(data: z.infer<typeof formSchema>){
        const res = await fetch(`${API_URL}/users/login`,{
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/x-www-form-urlencoded",
            },
        body: new URLSearchParams({
            username: data.email,
            password: data.password
        }).toString(),
    })

    if(!res.ok){
        const errorData = await res.json()
        toast.error(`Login failed: ${errorData?.message || "Unknown error"}`, {
            position: "top-center",
        })
        return
    }

    if(res.status !== 200){
        toast.error("Unexpected response from server. Please try again later.",{
            position: "top-center",
        })
    }
    
    const tokenData = await res.json()
    localStorage.setItem("access_token", tokenData.access_token)

    toast.success("Login successful", {
        position: "top-center",
    })
    form.reset()
}

     
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Log in to your account</CardTitle>
          <CardDescription>
            Enter your information to log in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="login-form" onSubmit={form.handleSubmit(onSubmit)}>
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
                <Button type="submit">Log In</Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
