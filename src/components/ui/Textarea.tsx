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
          <label className="block text-sm font-medium text-gray-200 mb-1">
            {label}
          </label>
        )}
        <textarea
          className={twMerge(
            "px-4 py-3 bg-secondary/80 border-2 shadow-sm border-accent/30 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-primary block w-full rounded-md text-base focus:ring-1 z-10 relative text-foreground",
            error
              ? "border-red-600 focus:border-red-500 focus:ring-red-500"
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
          <p className="mt-1 text-sm text-red-400">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-sm text-gray-300">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
