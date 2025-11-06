import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const OTP_LENGTH = 4;

const LoginOtpForm: React.FC = () => {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const location = useLocation();
  const navigate = useNavigate();

  // identifier can be phone or email passed from LoginForm
  const state = (location.state || {}) as { identifier?: string };
  const identifier = state.identifier || "";
  const isEmail = identifier.includes("@");

  useEffect(() => {
    // focus first input on mount
    inputsRef.current[0]?.focus();
  }, []);

  const handleChange = (value: string, idx: number) => {
    if (!/^[0-9]?$/.test(value)) return;
    const next = [...otp];
    next[idx] = value;
    setOtp(next);
    if (value && idx < OTP_LENGTH - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number
  ) => {
    const key = e.key;
    if (key === "Backspace") {
      if (otp[idx]) {
        // clear current
        const next = [...otp];
        next[idx] = "";
        setOtp(next);
      } else if (idx > 0) {
        inputsRef.current[idx - 1]?.focus();
        const next = [...otp];
        next[idx - 1] = "";
        setOtp(next);
      }
    } else if (key === "ArrowLeft" && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    } else if (key === "ArrowRight" && idx < OTP_LENGTH - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData.getData("text").trim();
    if (!/^[0-9]+$/.test(paste)) return;
    const chars = paste.split("").slice(0, OTP_LENGTH);
    const next = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < chars.length; i++) next[i] = chars[i];
    setOtp(next);
    const lastIdx = Math.min(chars.length, OTP_LENGTH) - 1;
    inputsRef.current[lastIdx]?.focus();
    e.preventDefault();
  };

  const handleVerify = () => {
    const code = otp.join("");
    // placeholder: integrate with auth flow
    console.log("Verifying OTP:", code, "for", identifier);
    // TODO: call verify API
  };

  const handleResend = () => {
    console.log("Resend OTP requested");
    // TODO: call resend API
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-center text-lg font-semibold text-gray-800">
        Verify Your Account
      </h2>

      <p className="mt-2 text-center text-sm text-gray-500">
        {identifier ? (
          isEmail ? (
            <>
              Enter the OTP you have received in your email{" "}
              <span className="font-medium text-gray-700">{identifier}</span>{" "}
            </>
          ) : (
            <>
              Enter the OTP you have received in your number{" "}
              <span className="font-medium text-gray-700">{identifier}</span>{" "}
            </>
          )
        ) : (
          <>Enter the OTP you have received</>
        )}
        <button
          type="button"
          className="text-sm text-blue-600 hover:underline ml-1"
          onClick={() => navigate("../login", { state: { identifier } })}
        >
          (Change)
        </button>
      </p>

      <div className="mt-6 flex justify-center space-x-3">
        {Array.from({ length: OTP_LENGTH }).map((_, idx) => (
          <input
            key={idx}
            ref={(el) => {
              inputsRef.current[idx] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={otp[idx]}
            onChange={(e) =>
              handleChange(e.target.value.replace(/\s/g, ""), idx)
            }
            onKeyDown={(e) => handleKeyDown(e, idx)}
            onPaste={handlePaste}
            className="w-14 h-12 text-center text-lg font-medium rounded-md border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={`OTP digit ${idx + 1}`}
          />
        ))}
      </div>

      <div className="mt-6 space-y-3">
        <button
          onClick={handleVerify}
          className="w-full bg-blue-600 text-white py-2 rounded-md shadow-sm hover:bg-blue-700 transition-colors"
        >
          Verify Now
        </button>

        <button
          onClick={handleResend}
          className="w-full border border-blue-600 text-blue-600 py-2 rounded-md hover:bg-blue-50 transition-colors"
        >
          Resend OTP
        </button>
      </div>
    </div>
  );
};

export default LoginOtpForm;
