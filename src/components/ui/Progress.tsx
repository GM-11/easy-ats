import React from "react";
import { twMerge } from "tailwind-merge";

interface ProgressProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  label,
  showValue = true,
  size = "md",
  className,
}) => {
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);

  // Determine color based on percentage
  let colorClass = "";
  if (percentage < 40) {
    colorClass = "bg-red-600";
  } else if (percentage < 70) {
    colorClass = "bg-amber-500";
  } else {
    colorClass = "bg-emerald-500";
  }

  // Determine height based on size
  const heightClass = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  }[size];

  return (
    <div className={twMerge("w-full", className)}>
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-200">{label}</span>
          {showValue && (
            <span className="text-sm font-medium text-gray-200">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div
        className={twMerge(
          "w-full bg-gray-700 rounded-full overflow-hidden shadow-inner",
          heightClass
        )}
      >
        <div
          className={twMerge(
            "rounded-full transition-all duration-500 ease-out",
            colorClass,
            heightClass
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {!label && showValue && (
        <span className="text-sm font-medium text-gray-200 mt-1">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
};
