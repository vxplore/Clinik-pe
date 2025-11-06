import React, { useState } from "react";
import { Paper, TextInput, Button, Text } from "@mantine/core";

interface LoginFormProps {
  onLogin?: (identifier: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [identifier, setIdentifier] = useState("");

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!identifier.trim()) return;
    if (onLogin) onLogin(identifier.trim());
    else console.log("Login identifier:", identifier.trim());
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
