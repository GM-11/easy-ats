import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SkeletonText } from "@/components/ui/Skeleton";
import {
  generateResumePDF,
  downloadPDF,
  extractResumeInfo,
} from "@/lib/pdfUtils";

interface OptimizedResumeProps {
  optimizedResume: string | null;
  isOptimizing: boolean;
  handleOptimizeResume: () => Promise<void>;
  goBackToAnalysis: () => void;
}

export const OptimizedResume: React.FC<OptimizedResumeProps> = ({
  optimizedResume,
  isOptimizing,
  handleOptimizeResume,
  goBackToAnalysis,
}) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [savedUserInfo, setSavedUserInfo] = useState<any>(null);

  // Load saved user info from localStorage
  useEffect(() => {
    try {
      const userInfoStr = localStorage.getItem("userInfo");
      if (userInfoStr) {
        const userInfo = JSON.parse(userInfoStr);
        setSavedUserInfo(userInfo);
        console.log("Loaded user info from localStorage:", userInfo);
      }
    } catch (error) {
      console.error("Error loading user info from localStorage:", error);
    }
  }, []);

  const handleCopyToClipboard = () => {
    if (optimizedResume) {
      navigator.clipboard.writeText(optimizedResume);
      setCopySuccess(true);

      // Reset the success message after 2 seconds
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    }
  };

  const handleDownloadPDF = async () => {
    if (!optimizedResume) return;

    setIsDownloading(true);
    try {
      // Extract information from optimized resume
      const extractedInfo = extractResumeInfo(optimizedResume);

      // Use saved user info from the original resume if available
      const resumeData = {
        content: optimizedResume,
        metadata: {
          name: (savedUserInfo?.name || extractedInfo.name || "Resume").trim(),
          email: savedUserInfo?.email || extractedInfo.email || "",
          phone: savedUserInfo?.phone || extractedInfo.phone || "",
          generatedDate: new Date().toLocaleDateString(),
        },
      };

      console.log("Using resume data for PDF:", resumeData);

      // Generate the PDF with the combined data
      const pdfBlob = generateResumePDF(resumeData);

      // Generate filename based on name
      const formattedName = resumeData.metadata.name
        .replace(/\s+/g, "_")
        .toLowerCase();
      const filename = `${formattedName}_resume.pdf`;

      // Download the PDF
      downloadPDF(pdfBlob, filename);

      // Show success message
      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card
        title="Optimized Resume"
        description="Your resume optimized for ATS compatibility"
      >
        {isOptimizing ? (
          <div className="p-6">
            <div className="mb-4 text-center">
              <div className="inline-block rounded-full bg-primary-50 p-3">
                <svg
                  className="animate-spin h-6 w-6 text-primary-600"
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
              <p className="mt-3 text-gray-600 font-medium">
                Optimizing your resume...
              </p>
            </div>
            <SkeletonText lines={15} />
          </div>
        ) : optimizedResume ? (
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap bg-gray-50 p-6 rounded-md text-base border border-gray-200 shadow-inner text-gray-800 overflow-auto max-h-[500px]">
              {optimizedResume}
            </pre>
          </div>
        ) : (
          <div className="p-6 text-red-700 bg-red-50 rounded-md border border-red-300">
            Error: Optimized resume not available. Please try generating it
            again.
          </div>
        )}
      </Card>

      <div className="flex flex-wrap justify-center gap-4">
        {optimizedResume && (
          <>
            <Button
              onClick={handleCopyToClipboard}
              variant="outline"
              size="lg"
              className="font-medium py-3 px-6"
            >
              {copySuccess ? (
                <span className="flex items-center">
                  <svg
                    className="mr-2 h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Copied!
                </span>
              ) : (
                "Copy to Clipboard"
              )}
            </Button>

            <Button
              onClick={handleDownloadPDF}
              variant="primary"
              size="lg"
              className="font-medium py-3 px-6 shadow-md"
              isLoading={isDownloading}
            >
              <span className="flex items-center">
                {downloadSuccess ? (
                  <>
                    <svg
                      className="mr-2 h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Downloaded!
                  </>
                ) : (
                  <>
                    <svg
                      className="mr-2 h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Download as PDF
                  </>
                )}
              </span>
            </Button>
          </>
        )}

        <Button
          onClick={goBackToAnalysis}
          variant="outline"
          size="lg"
          className="font-medium py-3 px-6"
        >
          Back to Analysis
        </Button>

        {!optimizedResume && !isOptimizing && (
          <Button
            onClick={handleOptimizeResume}
            variant="primary"
            size="lg"
            className="font-medium py-3 px-6 shadow-md"
            isLoading={isOptimizing}
          >
            Generate Resume
          </Button>
        )}
      </div>
    </div>
  );
};
