import React from "react";
import { twMerge } from "tailwind-merge";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "accent";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-foreground hover:bg-primary/90 focus:ring-primary/70 shadow-button",
  secondary:
    "bg-secondary text-foreground hover:bg-secondary/90 focus:ring-secondary/70 shadow-button",
  accent:
    "bg-accent text-foreground hover:bg-accent/90 focus:ring-accent/70 shadow-button",
  outline:
    "bg-transparent border-2 border-primary text-foreground hover:bg-primary/10 focus:ring-primary/50",
  ghost:
    "bg-transparent text-foreground hover:bg-primary/10 focus:ring-primary/50",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "text-sm py-2 px-3",
  md: "text-base py-2.5 px-4",
  lg: "text-lg py-3 px-5",
};

export const Button = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={twMerge(
        "font-medium rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background flex items-center justify-center transition-all duration-200 active:scale-95",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth ? "w-full" : "",
        disabled || isLoading ? "opacity-70 cursor-not-allowed" : "",
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
      ) : null}
      {children}
    </button>
  );
};
