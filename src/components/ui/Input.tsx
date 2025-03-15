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
          <label className="block text-sm font-medium text-foreground mb-1">
            {label}
          </label>
        )}
        <input
          className={twMerge(
            "px-4 py-3 bg-white border border-gray-300 shadow-sm placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-primary block rounded-md text-base focus:ring-2 z-10 relative text-gray-900 transition-all duration-200",
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
          <p className="mt-1 text-sm text-red-600">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-sm text-gray-600">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
