import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Paper, TextInput, Button, Text } from "@mantine/core";

interface LoginFormProps {
  onLogin?: (identifier: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");

  useEffect(() => {
    
    const state = (location.state || {}) as { identifier?: string };
    if (state.identifier) setIdentifier(state.identifier);
  }, [location.state]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!identifier.trim()) return;
    const trimmed = identifier.trim();
    if (onLogin) onLogin(trimmed);
    else console.log("Login identifier:", trimmed);
   
    navigate("../login-otp", { state: { identifier: trimmed } });
  };

  return (
    <div className="w-full flex justify-center">
      <Paper
        withBorder
        radius="md"
        className="p-6 w-full max-w-md bg-white shadow-xl"
        style={{ boxShadow: "0 2px 10px rgba(16,24,40,0.04)" }}
      >
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold">Login</h3>
          <Text color="dimmed" size="sm">
            Start your journey with ClinikPe
          </Text>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextInput
            placeholder="Mobile or Email id"
            value={identifier}
            onChange={(e) => setIdentifier(e.currentTarget.value)}
            size="md"
          />

          <Button
            type="submit"
            fullWidth
            styles={{ root: { backgroundColor: "#0b5ed7" } }}
          >
            Login Now
          </Button>
        </form>
      </Paper>
    </div>
  );
};

export default LoginForm;
