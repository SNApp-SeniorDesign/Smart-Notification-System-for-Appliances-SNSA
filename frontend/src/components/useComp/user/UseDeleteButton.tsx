"use client"

import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getToken, clearToken } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export function UseDeleteButton() {
  const router = useRouter()

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    )

    if (!confirmed) return

    const token = getToken()

    try {
      const res = await fetch(`${API_URL}/users/me`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        toast.error("Failed to delete account. Please try again later.", {
          position: "top-center",
        })
        return
      }

      clearToken()
      toast.success("Account deleted successfully", {
        position: "top-center",
      })

      router.replace("/")
      router.refresh()
    } catch {
      toast.error("Failed to delete account. Please try again later.", {
        position: "top-center",
      })
    }
  }

  return (
    <Button variant="destructive" onClick={handleDeleteAccount}>
      Delete Account
    </Button>
  )
}