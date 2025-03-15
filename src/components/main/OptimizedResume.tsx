import React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SkeletonText } from "@/components/ui/Skeleton";

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
  const handleCopyToClipboard = () => {
    if (optimizedResume) {
      navigator.clipboard.writeText(optimizedResume);
      alert("Copied to clipboard!");
    }
  };

  return (
    <div className="space-y-6">
      <Card
        title="Optimized Resume"
        description="Your resume optimized for ATS compatibility"
      >
        {isOptimizing ? (
          <SkeletonText lines={15} />
        ) : optimizedResume ? (
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap bg-secondary/60 p-6 rounded-md text-base border-2 border-accent/30 shadow-inner text-gray-200">
              {optimizedResume}
            </pre>
          </div>
        ) : (
          <div className="p-6 text-red-400 bg-red-900/20 rounded-md border border-red-700/30">
            Error: Optimized resume not available. Please try generating it
            again.
          </div>
        )}
      </Card>

      <div className="flex flex-wrap gap-4">
        <Button
          onClick={handleCopyToClipboard}
          variant="outline"
          size="lg"
          className="font-bold py-3 px-6"
          disabled={!optimizedResume}
        >
          Copy to Clipboard
        </Button>
        <Button
          onClick={goBackToAnalysis}
          variant="secondary"
          size="lg"
          className="font-bold py-3 px-6"
        >
          Back to Analysis
        </Button>
        {!optimizedResume && (
          <Button
            onClick={handleOptimizeResume}
            variant="primary"
            size="lg"
            className="font-bold py-3 px-6"
            isLoading={isOptimizing}
          >
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
};
