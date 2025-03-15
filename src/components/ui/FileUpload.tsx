import React, { forwardRef, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Button } from "./Button";

interface FileUploadProps {
  label?: string;
  accept?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  onFileChange?: (file: File | null) => void;
  className?: string;
}

export const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
  (
    {
      label,
      accept = ".pdf,.doc,.docx,.txt",
      error,
      helperText = "PDF, DOC, DOCX or TXT files up to 5MB",
      fullWidth = true,
      onFileChange,
      className,
      ...props
    },
    ref
  ) => {
    const [fileName, setFileName] = useState<string | null>(null);
    const hiddenFileInput = useRef<HTMLInputElement>(null);

    const handleClick = () => {
      hiddenFileInput.current?.click();
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const fileUploaded = event.target.files?.[0] || null;
      if (fileUploaded) {
        setFileName(fileUploaded.name);
        onFileChange?.(fileUploaded);
      }
    };

    const handleRemove = (e: React.MouseEvent) => {
      e.stopPropagation();
      setFileName(null);
      if (hiddenFileInput.current) {
        hiddenFileInput.current.value = "";
      }
      onFileChange?.(null);
    };

    return (
      <div className={twMerge(fullWidth ? "w-full" : "", className)}>
        {label && (
          <label className="block text-sm font-medium text-gray-200 mb-1">
            {label}
          </label>
        )}
        <div
          onClick={handleClick}
          className={twMerge(
            "flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors",
            error ? "border-red-600" : "border-accent/40",
            fileName ? "bg-secondary/50" : ""
          )}
        >
          <input
            ref={hiddenFileInput}
            type="file"
            className="hidden"
            accept={accept}
            onChange={handleChange}
            {...props}
          />

          {!fileName ? (
            <>
              <svg
                className="w-8 h-8 mb-2 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="mb-1 text-sm text-gray-200">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-xs text-gray-300">{helperText}</p>
            </>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <svg
                  className="w-6 h-6 mr-2 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-200 truncate max-w-[250px]">
                  {fileName}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="text-red-400 hover:text-red-300"
              >
                Remove
              </Button>
            </div>
          )}
        </div>
        {error ? (
          <p className="mt-1 text-sm text-red-400">{error}</p>
        ) : helperText && !fileName ? (
          <p className="mt-1 text-sm text-gray-300">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

FileUpload.displayName = "FileUpload";
