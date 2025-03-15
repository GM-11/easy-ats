import React from "react";
import { twMerge } from "tailwind-merge";

interface CardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  bordered?: boolean;
  hoverable?: boolean;
  variant?: "default" | "accent" | "primary" | "secondary";
}

export const Card: React.FC<CardProps> = ({
  title,
  description,
  children,
  className,
  footer,
  headerClassName,
  bodyClassName,
  footerClassName,
  bordered = true,
  hoverable = true,
  variant = "default",
}) => {
  const variantStyles = {
    default: "",
    primary: "border-primary-200 bg-primary-50/30",
    secondary: "border-secondary-200 bg-secondary-50/30",
    accent: "border-accent-200 bg-accent-50/30",
  };

  return (
    <div
      className={twMerge(
        "bg-white shadow-card rounded-2xl overflow-hidden transition-all duration-300",
        bordered && "border",
        bordered &&
          (variant === "default" ? "border-gray-200" : variantStyles[variant]),
        hoverable && "hover:shadow-lg hover:translate-y-[-2px]",
        variant !== "default" && variantStyles[variant],
        className
      )}
    >
      {(title || description) && (
        <div
          className={twMerge(
            "px-6 py-5 border-b",
            variant === "default"
              ? "border-gray-200 bg-gray-50"
              : `border-${variant}-200/50`,
            headerClassName
          )}
        >
          {title && (
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          )}
        </div>
      )}
      <div className={twMerge("px-6 py-5", bodyClassName)}>{children}</div>
      {footer && (
        <div
          className={twMerge(
            "px-6 py-4 border-t",
            variant === "default"
              ? "border-gray-200 bg-gray-50"
              : `border-${variant}-200/50`,
            footerClassName
          )}
        >
          {footer}
        </div>
      )}
    </div>
  );
};
