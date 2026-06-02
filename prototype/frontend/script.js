const BACKEND_URL = "https://ancient-wood-c83b.snsa-app.workers.dev";
let isOn = false;

async function getLatestEvent() {
    try {
        const response = await fetch(`${BACKEND_URL}/latest-event`);
        const data = await response.json();

        console.log("Received:", data);

        const el = document.getElementById("statusText");

        if (data && data.event === "sound_detected") {
            el.textContent = `${data.soundName} detected`;
            el.style.color = "red";
        } else {
            el.textContent = "Waiting....";
            el.style.color = "black";
        }
    } catch (error) {
        console.error("Error fetching latest event:", error);
    }
}

async function sendEvent(eventType, soundName) {
    const eventMessage = {
        deviceId: "snsa-001",
        event: eventType,
        soundName: soundName,
        timestamp: new Date().toISOString()
    };

    await fetch(`${BACKEND_URL}/event`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(eventMessage)
    });
}

async function toggleEvent() {
    isOn = !isOn;

    const btn = document.getElementById("toggleBtn");

    if (isOn) {
        btn.textContent = "Turn OFF";
        await sendEvent("sound_detected", "Washer Done");
    } else {
        btn.textContent = "Turn ON";
        await sendEvent("idle", "None");
    }

    await getLatestEvent();
}