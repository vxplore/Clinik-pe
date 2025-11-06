import { useEffect, useRef, useState } from "react";
import { API_KEY } from "../Confidential/MapAPI";

declare const google: any;

interface SelectableMapProps {
  height?: string;
  onLocationSelect: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
}

export default function SelectableMap({
  height = "500px",
  onLocationSelect,
  initialLat = 22.548256,
  initialLng = 88.345177,
}: SelectableMapProps) {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<any>(null);
  const [centerLat, setCenterLat] = useState<number>(initialLat);
  const [centerLng, setCenterLng] = useState<number>(initialLng);
  const listenersRef = useRef<Array<{ remove?: () => void }>>([]);

  const loadScript = (src: string) =>
    new Promise<void>((resolve, reject) => {
      const existing = document.querySelector(
        `script[src*="maps.googleapis.com"]`
      );
      if (existing) {
        if ((window as unknown as { google?: unknown }).google !== undefined)
          resolve();
        else {
          existing.addEventListener("load", () => resolve());
          existing.addEventListener("error", () => reject());
        }
        return;
      }
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.defer = true;
      s.onload = () => resolve();
      s.onerror = () => reject();
      document.head.appendChild(s);
    });

  useEffect(() => {
    const apiKey = API_KEY.GOOGLE_API_KEY; // replace with your key
    const src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    loadScript(src).then(() => {
      if (!mapContainerRef.current) return;

      mapRef.current = new google.maps.Map(mapContainerRef.current, {
        center: { lat: initialLat, lng: initialLng },
        zoom: 16,
        fullscreenControl: false,
      });

      // Keep a non-draggable marker visually by using an overlay; still create a marker (not shown) for compatibility
      markerRef.current = new google.maps.Marker({
        position: { lat: initialLat, lng: initialLng },
        map: mapRef.current,
        clickable: false,
        visible: false,
      });

      // Update center coordinates when the map becomes idle (after drag/zoom)
      const idleListener = mapRef.current.addListener("idle", () => {
        const c = mapRef.current.getCenter();
        if (c) {
          const lat = c.lat();
          const lng = c.lng();
          setCenterLat(lat);
          setCenterLng(lng);
          // keep marker position in sync (hidden marker)
          markerRef.current.setPosition({ lat, lng });
        }
      });
      listenersRef.current.push(idleListener);

      // Also respond to clicks by recentering and updating
      const clickListener = mapRef.current.addListener(
        "click",
        (e: unknown) => {
          const evt = e as { latLng: { lat: () => number; lng: () => number } };
          const lat = evt.latLng.lat();
          const lng = evt.latLng.lng();
          mapRef.current.panTo({ lat, lng });
          setCenterLat(lat);
          setCenterLng(lng);
          markerRef.current.setPosition({ lat, lng });
        }
      );
      listenersRef.current.push(clickListener);
    });
    const currentListeners = listenersRef.current.slice();
    return () => {
      // remove any listeners captured at the time of effect
      currentListeners.forEach((l) => l && l.remove && l.remove());
    };
  }, [initialLat, initialLng]);

  return (
    <div style={{ width: "100%" }}>
      <div style={{ position: "relative", width: "100%", height }}>
        <div ref={mapContainerRef} style={{ width: "100%", height }} />

        {/* Center pin overlay */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -100%)",
            pointerEvents: "none",
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C8.13401 2 5 5.13401 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13401 15.866 2 12 2Z"
              stroke="#ef4444"
              strokeWidth="1.2"
              fill="#ef4444"
            />
            <circle cx="12" cy="9" r="2.5" fill="white" />
          </svg>
        </div>

        {/* live coords display */}
        <div
          style={{
            position: "absolute",
            right: 12,
            top: 12,
            background: "rgba(255,255,255,0.95)",
            padding: "8px 10px",
            borderRadius: 8,
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            fontSize: 13,
          }}
        >
          <div style={{ fontWeight: 600 }}>Lat: {centerLat.toFixed(6)}</div>
          <div style={{ fontWeight: 600 }}>Lng: {centerLng.toFixed(6)}</div>
        </div>
      </div>

      <div
        style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}
      >
        <button
          onClick={() => onLocationSelect(centerLat, centerLng)}
          style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            padding: "8px 12px",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Save location
        </button>
      </div>
    </div>
  );
}
