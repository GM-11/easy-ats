import React from "react";
import { twMerge } from "tailwind-merge";

interface CardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  title,
  description,
  children,
  className,
  footer,
}) => {
  return (
    <div
      className={twMerge(
        "bg-background shadow-card rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-transform duration-300 transform",
        className
      )}
    >
      {(title || description) && (
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-100">
          {title && (
            <h3 className="text-lg font-medium text-foreground">{title}</h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          )}
        </div>
      )}
      <div className="px-6 py-5">{children}</div>
      {footer && (
        <div className="px-6 py-4 bg-gray-100 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
};
