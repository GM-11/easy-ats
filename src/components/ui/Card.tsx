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
        "bg-secondary shadow-card rounded-lg overflow-hidden border border-accent/30 hover:shadow-lg transition-shadow duration-300",
        className
      )}
    >
      {(title || description) && (
        <div className="px-6 py-5 border-b border-accent/40 bg-secondary/90">
          {title && (
            <h3 className="text-lg font-medium text-gray-50">{title}</h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-gray-300">{description}</p>
          )}
        </div>
      )}
      <div className="px-6 py-5">{children}</div>
      {footer && (
        <div className="px-6 py-4 bg-secondary/90 border-t border-accent/40">
          {footer}
        </div>
      )}
    </div>
  );
};
