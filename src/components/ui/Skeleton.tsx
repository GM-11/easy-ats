import React from "react";
import { twMerge } from "tailwind-merge";

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean | string;
  variant?: "rectangular" | "circular" | "text";
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  width,
  height,
  rounded = "md",
  variant = "rectangular",
}) => {
  const baseClass = "animate-pulse bg-gray-200 dark:bg-gray-700";

  const getRoundedClass = () => {
    if (typeof rounded === "boolean") {
      return rounded ? "rounded-full" : "";
    }
    return `rounded-${rounded}`;
  };

  const getVariantClass = () => {
    switch (variant) {
      case "circular":
        return "rounded-full";
      case "text":
        return "rounded h-4";
      default:
        return getRoundedClass();
    }
  };

  const styles: React.CSSProperties = {};
  if (width) {
    styles.width = typeof width === "number" ? `${width}px` : width;
  }
  if (height) {
    styles.height = typeof height === "number" ? `${height}px` : height;
  }

  return (
    <div
      className={twMerge(baseClass, getVariantClass(), className)}
      style={styles}
    />
  );
};

export const SkeletonText: React.FC<{
  lines?: number;
  className?: string;
  lineHeight?: string | number;
  spacing?: string | number;
}> = ({ lines = 3, className, lineHeight = "h-4", spacing = "mt-2" }) => {
  return (
    <div className={twMerge("w-full", className)}>
      {Array(lines)
        .fill(0)
        .map((_, i) => (
          <Skeleton
            key={i}
            className={twMerge(
              "w-full",
              typeof lineHeight === "string" ? lineHeight : `h-${lineHeight}`,
              i !== 0
                ? typeof spacing === "string"
                  ? spacing
                  : `mt-${spacing}`
                : ""
            )}
            variant="text"
          />
        ))}
    </div>
  );
};
