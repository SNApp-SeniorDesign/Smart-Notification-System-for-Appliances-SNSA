"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

import { cn } from "@/lib/utils"
import { getToken, clearToken } from "@/lib/auth"

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
    FieldError,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

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


    //submitting update user information
    async function onSubmit(data: z.infer<typeof formSchema>) {
        const token = getToken()
        
        const dirtyFields = form.formState.dirtyFields
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

        //waiting backend reponse
        const returnedData = await res.json();

        //FIXME: For testing using the uncomment code
        //The comment code is for successful login, for real implementation
        // toast.success("Login successful!",
        //   {position: "top-center"})
        //   form.reset()

        //code to display submited input as JSON in the toast
        toast("Here is your Account Information:", {
            description: (
                <pre className="mt-2 w-[320px] overflow-x-auto rounded-md bg-code p-4 text-code-foreground">
                    <code>
                        {res.status === 200 ?
                            "Account Updated Successfully!" :
                            "Unexpected response from server. Please try again later."
                        }
                    </code>
                </pre>
            ),
            position: "bottom-right",
            classNames: {
                content: "flex flex-col gap-2",
            },
            style: {
                "--border-radius": "calc(var(--radius)  + 4px)",
            } as React.CSSProperties,
        });
        return returnedData;
    }
    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            {/* eyebrow + heading mirror the dashboard's welcome block */}
            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-600 dark:text-slate-300">
                    Settings
                </p>
                <h1 className="mt-2 text-4xl font-bold leading-tight text-gray-900 sm:text-5xl dark:text-white">
                    Account Settings
                </h1>
                <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">
                    Manage your profile and preferences
                </p>
            </div>

            {/* glass card matching dashboard / detail pages */}
            <Card
                className={cn(
                    "gap-6 rounded-2xl p-2 ring-0",
                    "border border-foreground/10 bg-white/70 backdrop-blur-md",
                    "dark:border-white/10 dark:bg-white/[0.03]"
                )}
            >
                <CardHeader>
                    <CardTitle className="text-lg text-gray-900 dark:text-white">
                        Profile
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-slate-400">
                        Update the basics on your account.
                    </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col gap-6">
                    {/* avatar row */}
                    <div className="flex items-center gap-5">
                        <UserProfile className="h-16 w-16 text-gray-700 dark:text-slate-200" />
                        <div className="flex flex-col gap-1">
                            <Button
                                type="button"
                                className={cn(
                                    "h-9 w-fit rounded-full px-4 text-sm font-semibold",
                                    "bg-blue-700 text-white hover:bg-blue-800",
                                    "dark:bg-yellow-300 dark:text-gray-900 dark:hover:bg-yellow-200"
                                )}
                            >
                                Change Avatar
                            </Button>
                            <p className="text-xs text-gray-500 dark:text-slate-400">
                                JPG, GIF, or PNG
                            </p>
                        </div>
                    </div>

                    <form id="signin-form" onSubmit={form.handleSubmit(onSubmit)}>
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

                            {/* action row — primary save, ghost log-out, destructive delete */}
                            <div className="flex flex-wrap items-center gap-3 pt-2">
                                <Button
                                    type="submit"
                                    className={cn(
                                        "h-10 rounded-full px-5 text-sm font-semibold",
                                        "bg-blue-700 text-white hover:bg-blue-800",
                                        "dark:bg-yellow-300 dark:text-gray-900 dark:hover:bg-yellow-200"
                                    )}
                                >
                                    Save changes
                                </Button>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={handleLogOut}
                                    className="h-10 rounded-full px-4 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white"
                                >
                                    Log out
                                </Button>

                                <Button
                                    type="button"
                                    onClick={handleDeleteAccount}
                                    className={cn(
                                        "ml-auto h-10 rounded-full px-4 text-sm font-medium",
                                        "border border-red-300 bg-transparent text-red-600 hover:bg-red-50",
                                        "dark:border-red-400/30 dark:text-red-300 dark:hover:bg-red-500/10"
                                    )}
                                >
                                    Delete account
                                </Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}