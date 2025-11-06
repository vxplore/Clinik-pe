import React from "react";
import { PinInput } from "@mantine/core";

interface OtpPinInputProps {
  length?: number;
  value?: string;
  onChange?: (val: string) => void;
  onComplete?: (val: string) => void;
  className?: string;
}

const OtpPinInput: React.FC<OtpPinInputProps> = ({
  length = 6,
  value,
  onChange,
  onComplete,
  className,
}) => {
  return (
    <div className={className}>
      <PinInput
        length={length}
        value={value}
        onChange={onChange}
        onComplete={onComplete}
        placeholder="-"
        size="md"
      />
    </div>
  );
};

export default OtpPinInput;
