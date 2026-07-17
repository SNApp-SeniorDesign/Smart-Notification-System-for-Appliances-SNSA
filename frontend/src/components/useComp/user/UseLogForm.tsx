"use client"

import { cn } from "@/lib/utils"
import { setToken } from "@/lib/auth"
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
  FieldDescription,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import { zodResolver } from "@hookform/resolvers/zod"
import {Controller, useForm} from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import {useRouter} from "next/navigation"


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
    rememberMe: z.boolean(),

})

type LogFormProps = React.ComponentProps<"div"> & {
    onLoginSuccess?: () => void
    onSwitchToSignup?: () => void
}

export function LogForm({
  className,
  onLoginSuccess,
  onSwitchToSignup,
  ...props
}: LogFormProps) {

    const router = useRouter()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email:"",
            password:"",
            rememberMe: true,
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

    const returnedData = await res.json()
    setToken(returnedData.access_token, data.rememberMe)

    if(res.status !== 200){
        toast.error("Unexpected response from server. Please try again later.",{
            position: "top-center",
        })
    }
    
    toast.success("Login successful", {
        position: "top-center",
    })
    form.reset()
    onLoginSuccess?.()
    router.push("/dashboard")
}

     
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
        </CardHeader>
        <CardContent>
          <form id="login-form" onSubmit={form.handleSubmit(onSubmit)}>
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
                      placeholder="Em@example.com"
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
                      placeholder="*******"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]}/>
                    )}
                  </Field>
                )}
              />

              <Controller
                name="rememberMe"
                control={form.control}
                render={({field}) => (
                  <Field orientation="horizontal">
                  <input
                    id="rememberMe"
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    className="h-fit w-fit cursor-pointer accent-primary"
                  />
                  <FieldLabel htmlFor="rememberMe" className="cursor-pointer text-sm font-normal">
                    Remember me
                  </FieldLabel>
                  </Field>
                )}
              />
              
              <Field>
                <Button type="submit">Log In</Button>
              </Field>

              <FieldDescription className="text-center">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={onSwitchToSignup}
                >
                  Sign up
                </button>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
