import React, { useState, useRef } from "react";
import { Button } from "@mantine/core";

const QrCodePage: React.FC = () => {
  const mockCenter = {
    id: "center-123",
    name: "V-Xplore Clinic",
    address: "123 Main St, Cityville, Country",
    phone: "+1 (555) 123-4567",
    qrImage: (() => {
      const svg = `
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300' width='600' height='600'>
          <rect width='300' height='300' fill='white'/>
          <rect x='10' y='10' width='70' height='70' fill='black' />
          <rect x='220' y='10' width='70' height='70' fill='black' />
          <rect x='10' y='220' width='70' height='70' fill='black' />
          <rect x='90' y='90' width='30' height='30' fill='black' />
          <rect x='140' y='90' width='40' height='40' fill='black' />
          <rect x='200' y='90' width='10' height='10' fill='black' />
          <rect x='90' y='140' width='20' height='20' fill='black' />
          <rect x='140' y='160' width='20' height='20' fill='black' />
          <rect x='190' y='140' width='20' height='20' fill='black' />
          <rect x='50' y='200' width='15' height='15' fill='black' />
        </svg>
      `;
      return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    })(),
  };

  const [flipped, setFlipped] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleShare = async () => {
    const shareText = `${mockCenter.name}\n${mockCenter.address}\n${mockCenter.phone}`;
    const shareUrl = `${window.location.origin}/centers/${mockCenter.id}`;

    type NavigatorShareable = {
      share?: (data?: {
        title?: string;
        text?: string;
        url?: string;
        files?: File[];
      }) => Promise<void>;
      canShare?: (data?: { files?: File[] }) => boolean;
      clipboard?: { writeText?: (text: string) => Promise<void> };
    };

    const nav = navigator as unknown as NavigatorShareable;

    if (nav.share) {
      try {
        try {
          const res = await fetch(mockCenter.qrImage);
          const blob = await res.blob();
          const file = new File([blob], `${mockCenter.name}-qr.png`, {
            type: blob.type || "image/png",
          });

          if (nav.canShare?.({ files: [file] })) {
            await nav.share?.({
              title: `Visit ${mockCenter.name}`,
              text: shareText,
              url: shareUrl,
              files: [file],
            });
            return;
          }
        } catch (e) {
          console.warn("Could not attach image to share:", e);
        }

        await nav.share?.({
          title: `Visit ${mockCenter.name}`,
          text: shareText,
          url: shareUrl,
        });
      } catch (e) {
        console.warn("Share canceled or failed", e);
      }
    } else if (nav.clipboard?.writeText) {
      try {
        await nav.clipboard!.writeText(`${shareText}\n${shareUrl}`);
        alert("Share text copied to clipboard");
      } catch {
        alert("Failed to copy. Please manually share the details.");
      }
    } else {
      alert("Sharing not supported on this device.");
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = mockCenter.qrImage;
    link.download = `${mockCenter.name}-qr.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-8xl mx-auto py-2 px-1">
      {/* Header + buttons */}
      <div className="bg-white rounded-lg shadow px-6 py-4 mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{mockCenter.name}</h2>
          <p className="text-sm text-gray-600">{mockCenter.address}</p>
          <p className="text-sm text-gray-600">{mockCenter.phone}</p>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleShare} variant="outline">
            Share
          </Button>
          <Button onClick={handleDownload}>Download</Button>
        </div>
      </div>

      {/* FLIP QR CARD */}
      <div className="flex flex-col items-center justify-center mt-6">
        <div
          className="w-[320px] h-[320px] cursor-pointer"
          onClick={() => setFlipped((prev) => !prev)}
          style={{ perspective: 1000 }}
        >
          <div
            className={`relative w-full h-full duration-700 transform-style-preserve-3d ${
              flipped ? "rotate-y-180" : ""
            }`}
          >
            {/* FRONT (QR) */}
            <div className="absolute inset-0 backface-hidden bg-white shadow-lg rounded-xl p-4 flex items-center justify-center">
              <img
                ref={imgRef}
                src={mockCenter.qrImage}
                alt="QR Code"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>

            {/* BACK (Please Scan) */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white shadow-lg rounded-xl flex flex-col items-center justify-center">
              <h1 className="text-2xl font-semibold text-gray-700">
                📲 Please Scan
              </h1>
              <p className="text-sm text-gray-500 mt-2">(Tap to flip back)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QrCodePage;
