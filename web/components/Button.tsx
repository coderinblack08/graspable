import React, { forwardRef } from "react";

interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  type?: "button" | "submit" | "reset";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
}

interface CustomButtonProps extends React.HTMLAttributes<HTMLOrSVGElement> {}

// eslint-disable-next-line react/display-name
export const Button = forwardRef<HTMLButtonElement | null, ButtonProps>(
  (
    {
      variant = "primary",
      leftIcon,
      rightIcon,
      size = "md",
      isLoading,
      type,
      as,
      className,
      onClick,
      children,
      ...props
    },
    ref
  ) => {
    const classes = [
      "flex select-none justify-center items-center focus:ring focus:outline-none transition text-white font-medium",
      size === "lg"
        ? "px-6 py-3 rounded-xl"
        : size === "md"
        ? "px-4 py-2 rounded-lg"
        : "px-3 py-1 rounded-md",
      variant === "primary"
        ? "bg-purple-500 focus:ring-purple-400"
        : variant === "secondary"
        ? "bg-gray-800 focus:ring-gray-600"
        : "border-gray-800 border-2 focus:ring-gray-600",
      className,
    ];

    const CustomButton: React.FC<CustomButtonProps> = ({ ...props }) => {
      const Tag = as as keyof JSX.IntrinsicElements;
      return <Tag {...props} />;
    };

    const RenderedButton = ({ children }: any) => {
      return as ? (
        <CustomButton className={classes.join(" ")} onClick={onClick}>
          {children}
        </CustomButton>
      ) : (
        <button
          {...props}
          ref={ref}
          type={type}
          className={classes.join(" ")}
          onClick={onClick}
        >
          {children}
        </button>
      );
    };

    return (
      <RenderedButton>
        {leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children && <span>{children}</span>}
        {rightIcon && <span className="ml-2">{rightIcon}</span>}
      </RenderedButton>
    );
  }
);
