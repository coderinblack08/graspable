import { useField } from "formik";
import React, { forwardRef } from "react";

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: "sm" | "md" | "lg";
}

// eslint-disable-next-line react/display-name
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ size, className, ...props }, ref) => {
    const classes = [
      "transition select-none border border-gray-800 bg-transparent font-medium text-gray-300 focus:ring focus:ring-gray-800 focus:outline-none placeholder:text-gray-600 w-full",
      size === "lg"
        ? "px-6 py-3 rounded-xl"
        : size === "md"
        ? "px-4 py-2 rounded-lg"
        : "px-3 py-1.5 rounded-md",
      className,
    ];
    return <input className={classes.join(" ")} ref={ref} {...props} />;
  }
);

export const InputField: React.FC<InputProps & { name: string }> = ({
  name,
  ...props
}) => {
  const [field, meta, _] = useField(name);
  return (
    <div>
      <Input {...field} {...props} />
      {meta.touched && meta.error ? (
        <div className="mt-0.5 text-sm text-red-500">{meta.error}</div>
      ) : null}
    </div>
  );
};
