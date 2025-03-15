import React from "react";
import { twMerge } from "tailwind-merge";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "accent"
  | "success"
  | "warning";
type ButtonSize = "sm" | "md" | "lg" | "xl";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500/50 shadow-md",
  secondary:
    "bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500/50 shadow-md",
  accent:
    "bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500/50 shadow-md",
  success:
    "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500/50 shadow-md",
  warning:
    "bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-500/50 shadow-md",
  outline:
    "bg-transparent border-2 border-blue-500 text-blue-700 hover:bg-blue-50 focus:ring-blue-500/30",
  ghost: "bg-transparent text-blue-700 hover:bg-blue-50 focus:ring-blue-500/30",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "text-xs py-1.5 px-3 rounded-lg",
  md: "text-sm py-2 px-4 rounded-lg",
  lg: "text-base py-2.5 px-5 rounded-xl",
  xl: "text-lg py-3 px-6 rounded-xl",
};

export const Button = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={twMerge(
        "font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white flex items-center justify-center transition-all duration-200 active:scale-[0.98]",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth ? "w-full" : "",
        disabled || isLoading
          ? "opacity-70 cursor-not-allowed active:scale-100"
          : "",
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="mr-2">
          <svg
            className="animate-spin h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      ) : leftIcon ? (
        <div className="mr-2">{leftIcon}</div>
      ) : null}

      {children}

      {rightIcon && !isLoading ? <div className="ml-2">{rightIcon}</div> : null}
    </button>
  );
};
