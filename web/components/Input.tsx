import React from "react";

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: "sm" | "md" | "lg";
}

export const Input: React.FC<InputProps> = ({ size, className, ...props }) => {
  const classes = [
    "transition border border-gray-700 bg-transparent font-medium text-gray-300 focus:ring focus:ring-gray-700 focus:outline-none placeholder:text-gray-600 w-full",
    size === "lg"
      ? "px-6 py-3 rounded-xl"
      : size === "md"
      ? "px-4 py-2 rounded-lg"
      : "px-3 py-1.5 rounded-md",
    className,
  ];
  return <input className={classes.join(" ")} {...props} />;
};
