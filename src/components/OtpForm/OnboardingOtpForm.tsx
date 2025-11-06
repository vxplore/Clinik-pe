import React, { useState } from "react";
import { Button, TextInput, ActionIcon } from "@mantine/core";
import { useNavigate, useLocation } from "react-router-dom";
import { IconPencil } from "@tabler/icons-react";
import OtpPinInput from "./Components/OtpPinInput";
import Notification from "../GlobalNotification/Notification";

const OnboardingOtpForm: React.FC = () => {
  const [otpValue, setOtpValue] = useState<string>("");
  const [notif, setNotif] = useState<{
    open: boolean;
    data: { success: boolean; message: string };
  }>({ open: false, data: { success: true, message: "" } });
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as {
    phoneNumber?: string;
    countryCode?: string;
  };
  const maskNumber = (num?: string) => {
    if (!num) return "xxxxxx1234";
    const cleaned = num.replace(/\D/g, "");
    if (cleaned.length <= 4) return cleaned;
    const visible = cleaned.slice(-4);
    const masked = "x".repeat(Math.max(0, cleaned.length - 4));
    return `${masked}${visible}`;
  };

  const phoneDisplay = state.phoneNumber
    ? `${state.countryCode ?? "+91"} -${maskNumber(state.phoneNumber)}`
    : "+91 - xxxxxx1234";

  const handleComplete = (val: string) => {
    setOtpValue(val);
    // Optionally auto-verify here or enable the Verify button
    console.log("OTP complete:", val);
  };

  const handleVerify = () => {
    if (otpValue.length !== 6) {
      setNotif({
        open: true,
        data: {
          success: false,
          message: "Please enter the complete 6-digit OTP.",
        },
      });
      return;
    }
    // TODO: Call API to verify OTP with phoneNumber and otpValue
    // Example: fetch('/api/verify-otp', { method: 'POST', body: JSON.stringify({ phone: state.phoneNumber, otp: otpValue }) })
    // If success, navigate to organization
    console.log("Verifying OTP:", otpValue);
    navigate("/organization");
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md ring-1 ring-gray-100">
      <Notification
        open={notif.open}
        data={notif.data}
        onClose={() => setNotif((s) => ({ ...s, open: false }))}
      />
      <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
        Verify Your Mobile Number
      </h3>
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2 text-center">
          We have sent a 6-digit code to {phoneDisplay}. Please enter it below
          to continue
        </p>
        <div className="max-w-sm mx-auto">
          <TextInput
            readOnly
            value={phoneDisplay}
            size="sm"
            className="w-full"
            variant="filled"
            styles={{
              input: {
                backgroundColor: "#f3f4f6", // tailwind gray-100
                borderColor: "#e5e7eb",
                paddingRight: 40,
              },
            }}
            rightSection={
              <ActionIcon
                variant="transparent"
                onClick={() =>
                  navigate("/", {
                    state: {
                      phoneNumber: state.phoneNumber,
                      countryCode: state.countryCode,
                    },
                  })
                }
                aria-label="Edit phone number"
              >
                <IconPencil size={16} />
              </ActionIcon>
            }
          />
        </div>
      </div>

      <div className="mb-72">
        <div className="flex gap-2 justify-center">
          <OtpPinInput
            length={6}
            value={otpValue}
            onChange={(v) => setOtpValue(v)}
            onComplete={handleComplete}
          />
        </div>
        <div className="text-center text-sm text-gray-500 mt-3">
          Resend OTP in 30s. <button className="text-blue-600">Resend</button>
        </div>
      </div>

      <Button
        fullWidth
        onClick={handleVerify}
        styles={{ root: { backgroundColor: "#2563eb", borderRadius: 6 } }}
      >
        Verify & Continue
      </Button>
    </div>
  );
};

export default OnboardingOtpForm;
