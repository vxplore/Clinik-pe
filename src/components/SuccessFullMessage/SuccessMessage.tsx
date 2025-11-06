import React, { useEffect, useState } from "react";
import { Paper, Text, Button, Anchor, Center } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import success from "../../assets/success.png";

interface SuccessMessageProps {
  title?: string;
  description?: string;
  onContinue?: () => void;
  supportEmail?: string;
  /** seconds to countdown before auto-redirect */
  countdownStart?: number;
  /** path to redirect to after countdown (defaults to /login) */
  redirectPath?: string;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({
  title = "Thank You! Your Registration Is Complete",
  description = "We’re reviewing your details. You’ll get notified once your clinic is verified and your dashboard is ready.",
  onContinue,
  supportEmail = "support@yourapp.com",
  countdownStart = 10,
  redirectPath = "/login",
}) => {
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState<number>(countdownStart);

  useEffect(() => {
    setSeconds(countdownStart);
  }, [countdownStart]);

  useEffect(() => {
    if (seconds <= 0) {
      // auto-redirect when countdown reaches zero
      if (onContinue) {
        onContinue();
      } else {
        navigate(redirectPath);
      }
      return;
    }

    const t = setInterval(() => {
      setSeconds((s) => s - 1);
    }, 1000);
    return () => clearInterval(t);
  }, [seconds, navigate, onContinue, redirectPath]);

  const handleGotoLogin = () => {
    if (onContinue) onContinue();
    else navigate(redirectPath);
  };
  return (
    <div className="w-full flex justify-center">
      <Paper
        withBorder
        radius="md"
        className="p-8 w-full max-w-lg bg-white"
        style={{ boxShadow: "0 2px 10px rgba(16,24,40,0.04)" }}
      >
        <div className="flex my-18 flex-col items-center text-center">
          <Center>
            <div className="flex items-center gap-2 mb-2">
              <img src={success} alt="ClinikPe logo" className="w-50 h-auto" />
            </div>
          </Center>

          <h3 className="text-2xl sm:text-3xl font-extrabold mt-6">
            🎉 {title}
          </h3>

          <Text color="dimmed" className="mt-4 max-w-xl">
            {description}
          </Text>

          <div className="mt-6 w-full max-w-sm">
            <Button
              fullWidth
              onClick={handleGotoLogin}
              styles={{ root: { backgroundColor: "#2563eb", borderRadius: 8 } }}
            >
              Go to Login
            </Button>
          </div>

          <Text size="sm" color="dimmed" className="mt-4">
            Redirecting in <span className="font-medium">{seconds}s</span>. You
            can also click the button to go to the login page now.
          </Text>

          <Text size="sm" color="dimmed" className="mt-4">
            Need help?{" "}
            <Anchor href={`mailto:${supportEmail}`}>Contact Support</Anchor>
          </Text>
        </div>
      </Paper>
    </div>
  );
};

export default SuccessMessage;
