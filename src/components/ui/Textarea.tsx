import React, { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      fullWidth = true,
      rows = 4,
      ...props
    },
    ref
  ) => {
    return (
      <div className={fullWidth ? "w-full" : ""}>
        {label && (
          <label className="block text-sm font-medium mb-1">{label}</label>
        )}
        <textarea
          className={twMerge(
            "px-4 py-3 border border-gray-300 shadow-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-blue-500 block w-full rounded-md text-base focus:ring-2 z-10 relative transition-all duration-200",
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "",
            fullWidth ? "w-full" : "",
            className
          )}
          rows={rows}
          ref={ref}
          {...props}
          style={{ resize: "vertical" }}
        />
        {error ? (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
