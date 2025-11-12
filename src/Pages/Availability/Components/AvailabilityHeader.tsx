import React from "react";
import { Avatar, Button, Text } from "@mantine/core";

type Props = {
  name: string;
  role?: string;
  image?: string;
  onAdd?: () => void;
};

const AvailabilityHeader: React.FC<Props> = ({ name, role, image, onAdd }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Avatar src={image} radius="xl" size={56} />
        <div>
          <Text fw={700} className="text-gray-800">
            {name}
          </Text>
          {role && (
            <div className="mt-1 inline-flex items-center gap-2 text-sm text-gray-600">
              <span className="inline-block bg-green-50 text-green-700 px-2 py-0.5 rounded-md text-xs">
                {role}
              </span>
            </div>
          )}
        </div>
      </div>

      <div>
        <Button onClick={onAdd} color="blue" size="sm">
          + Add Schedule
        </Button>
      </div>
    </div>
  );
};

export default AvailabilityHeader;
