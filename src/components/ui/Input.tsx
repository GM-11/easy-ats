import React, { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { className, label, error, helperText, fullWidth = true, ...props },
    ref
  ) => {
    return (
      <div className={fullWidth ? "w-full" : ""}>
        {label && (
          <label className="block text-sm font-medium text-gray-200 mb-1">
            {label}
          </label>
        )}
        <input
          className={twMerge(
            "px-4 py-3 bg-secondary/80 border-2 shadow-sm border-accent/30 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-primary block rounded-md text-base focus:ring-1 z-10 relative text-foreground",
            error
              ? "border-red-600 focus:border-red-500 focus:ring-red-500"
              : "",
            fullWidth ? "w-full" : "",
            className
          )}
          ref={ref}
          {...props}
        />
        {error ? (
          <p className="mt-1 text-sm text-red-400">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-sm text-gray-300">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
