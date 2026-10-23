"use client"

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button"
import { enableNotifications } from "@/lib/notifications";

export function EnableNotificationsButton() {
    const [loading, setLoading] = useState(false);

    async function handleEnableNotifications() {
        try {
            setLoading(true);
            await enableNotifications();
            
            toast.success("Notifications enabled");
        } catch(error) {
        toast.error(
            error instanceof Error 
                ? error.message
                : "Failed to enable notification"
        )
        } finally {
            setLoading(false);
        }
    }

    return (
        <Button
            type="button"
            onClick={handleEnableNotifications}
            disabled={loading}
        >
            {loading ? "Enabling..." : "Enable Notifications"}
        </Button>
    );
}