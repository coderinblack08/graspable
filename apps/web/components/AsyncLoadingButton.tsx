import { Button, ButtonProps } from "@mantine/core";
import React from "react";

interface AsyncLoadingButtonProps {
  onClick: () => Promise<void>;
}

export const AsyncLoadingButton: React.FC<
  AsyncLoadingButtonProps & ButtonProps<"button">
> = ({ onClick, ...props }) => {
  const [loading, setLoading] = React.useState(false);
  return (
    <Button
      onClick={async () => {
        setLoading(true);
        await onClick();
        setLoading(false);
      }}
      loading={loading}
      {...props}
    ></Button>
  );
};
