import { useEffect, useState } from "react";

export function useDeviceType() {
    const [deviceType, setDeviceType] = useState<string>("unknown");

    useEffect(() => {
        if (typeof navigator === "undefined") {
            setDeviceType("unknown");
            return;
        }
        const ua = navigator.userAgent || "";
        // keep a console log for debugging
        console.log("User Agent:", ua);
        if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) setDeviceType("mobile");
        else setDeviceType("desktop");
    }, []);

    return deviceType;
}