"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

import { getToken} from "@/lib/auth"

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
    FieldGroup,
    FieldLabel,
    FieldError,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import { UseDeleteButton } from "./UseDeleteButton"

const API_URL = process.env.NEXT_PUBLIC_API_URL;


//form schema for validation using zod
const formSchema = z.object({
    email: z.string()
        .trim()
        .email("Invalid email address")
        .optional()
        .or(z.literal("")),
    username: z.string()
        .trim()
        .min(3, "Username must be at least 3 characters")
        .max(20, "Username must be at most 20 characters")
        .optional()
        .or(z.literal("")),
    password: z.string()
        .trim()
        .min(8, "Password must be at least 8 characters")
        .max(10, "Password must be at most 10 characters")
        .optional()
        .or(z.literal("")),
})


export function AccountForm() {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            username: "",
            password: "",
        }
    })

    React.useEffect(() => {
        async function getCurrentUser() {
            const token = getToken()
            if (!token) {
                toast.error("no login token found")
                return
            }
            const res = await fetch(`${API_URL}/users/me`, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            })

            if (!res.ok) {
                toast.error("Failed to load account info")
                return
            }
            const user = await res.json()
            
            //continously showing user username and email
            form.reset({
                email: user.email,
                username: user.username,
                password:"********"
            })
        }
        getCurrentUser()
    }, [form])

    async function onSubmit(data: z.infer<typeof formSchema>) {
        const token = getToken()
        
        const filteredData = Object.fromEntries(
            Object.entries(data).filter(([key, value]) => {
                const fieldState = form.getFieldState(key as keyof z.infer<typeof formSchema>)
                return fieldState.isDirty && value !==""
            })
        )

        //if no key being modify then return error
        if(Object.keys(filteredData).length === 0){
            toast.error("no changes to save")
            return
        }

        //sending http request
        const res = await fetch(`${API_URL}/users/update`, {
            method: "PUT",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(filteredData),
        })

        //handling error response
        if (!res.ok) {
            const errorData = await res.json()
            toast.error(`Updationg failed: ${errorData?.message || "Unknown error"}`, {
                position: "top-center",
            })
            return
        }


        const returnedData = await res.json();

       toast.success("Account updated successfully", {
        position: "top-center"
       })
        return returnedData;
    }
    return (
        <div>
            <div>
                <p>
                    Settings
                </p>
                <h1>
                    Account Settings
                </h1>
                <p>
                    Manage your account information and password
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">
                        Profile
                    </CardTitle>
                    <CardDescription>
                        Update the basics on your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form id="profile-form" onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="flex flex-col gap-6">
                            <FieldGroup className="flex-col gap-4 sm:flex-row">
                                {/* email */}
                                <Controller
                                    name="email"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor="email" className="text-gray-700 dark:text-slate-200">
                                                Email
                                            </FieldLabel>
                                            <Input
                                                {...field}
                                                id="email"
                                                aria-invalid={fieldState.invalid}
                                                placeholder="m@example.com"
                                                autoComplete="off"
                                            />
                                            {fieldState.invalid && (
                                                <FieldError errors={[fieldState.error]} />
                                            )}
                                        </Field>
                                    )}
                                />
                                {/* username */}
                                <Controller
                                    name="username"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor="username" className="text-gray-700 dark:text-slate-200">
                                                Username
                                            </FieldLabel>
                                            <Input
                                                {...field}
                                                id="username"
                                                aria-invalid={fieldState.invalid}
                                                placeholder="john_doe"
                                                autoComplete="off"
                                            />
                                            {fieldState.invalid && (
                                                <FieldError errors={[fieldState.error]} />
                                            )}
                                        </Field>
                                    )}
                                />

                                {/* password */}
                                <Controller
                                    name="password"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor="password" className="text-gray-700 dark:text-slate-200">
                                                Password
                                            </FieldLabel>
                                            <Input
                                                {...field}
                                                id="password"
                                                aria-invalid={fieldState.invalid}
                                                type="password"
                                                placeholder="********"
                                                autoComplete="off"
                                            />
                                            {fieldState.invalid && (
                                                <FieldError errors={[fieldState.error]} />
                                            )}
                                        </Field>
                                    )}
                                />
                            </FieldGroup>

                            <div className="flex flex-wrap items-center gap-3 pt-2">
                                <Button
                                    type="submit"
                                >
                                    Save changes
                                </Button>

                                <UseDeleteButton />
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}