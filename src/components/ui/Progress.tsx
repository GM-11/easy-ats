import React, { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

interface ProgressProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  variant?: "default" | "gradient" | "striped";
  animation?: boolean;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  label,
  showValue = true,
  size = "md",
  className,
  variant = "default",
  animation = true,
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);

  useEffect(() => {
    if (animation) {
      const timer = setTimeout(() => {
        setDisplayValue(percentage);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setDisplayValue(percentage);
    }
  }, [percentage, animation]);

  // Determine color based on percentage
  let colorClass = "";
  if (percentage < 40) {
    colorClass =
      variant === "gradient"
        ? "bg-gradient-to-r from-red-500 to-red-600"
        : "bg-red-600";
  } else if (percentage < 70) {
    colorClass =
      variant === "gradient"
        ? "bg-gradient-to-r from-amber-400 to-amber-500"
        : "bg-amber-500";
  } else {
    colorClass =
      variant === "gradient"
        ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
        : "bg-emerald-500";
  }

  // Striped variant
  if (variant === "striped") {
    colorClass += " bg-stripes";
  }

  // Determine height and rounded based on size
  const sizeClasses = {
    sm: "h-2 text-xs",
    md: "h-3 text-sm",
    lg: "h-4 text-base",
    xl: "h-6 text-lg",
  };

  return (
    <div className={twMerge("w-full", className)}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className={`font-medium text-gray-700 ${sizeClasses[size]}`}>
            {label}
          </span>
          {showValue && (
            <span className={`font-medium text-gray-700 ${sizeClasses[size]}`}>
              {Math.round(displayValue)}%
            </span>
          )}
        </div>
      )}
      <div
        className={twMerge(
          "w-full bg-gray-200 rounded-full overflow-hidden shadow-inner",
          sizeClasses[size]
        )}
      >
        <div
          className={twMerge(
            "rounded-full transition-all duration-1000 ease-out",
            colorClass,
            sizeClasses[size],
            animation && "animate-pulse-slow"
          )}
          style={{ width: `${displayValue}%` }}
        />
      </div>
      {!label && showValue && (
        <div className="flex justify-end mt-1">
          <span className={`font-medium text-gray-700 ${sizeClasses[size]}`}>
            {Math.round(displayValue)}%
          </span>
        </div>
      )}
    </div>
  );
};
