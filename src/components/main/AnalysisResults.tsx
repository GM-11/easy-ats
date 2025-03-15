import React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { SkeletonText } from "@/components/ui/Skeleton";
import { AnalysisResult } from "@/types";

interface AnalysisResultsProps {
  analysisResult: AnalysisResult | null;
  isAnalyzing: boolean;
  isOptimizing: boolean;
  optimizedResume: string | null;
  handleOptimizeResume: () => Promise<void>;
  forceShowOptimized: () => void;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  analysisResult,
  isAnalyzing,
  isOptimizing,
  optimizedResume,
  handleOptimizeResume,
  forceShowOptimized,
}) => {
  if (isAnalyzing) {
    return (
      <div className="space-y-6">
        <Card
          title="Analyzing Resume..."
          description="Please wait while we analyze your resume"
        >
          <div className="py-4">
            <div className="animate-pulse bg-gray-700 h-6 w-full rounded-full mb-4"></div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Strengths">
            <SkeletonText lines={5} />
          </Card>

          <Card title="Weaknesses">
            <SkeletonText lines={5} />
          </Card>
        </div>
      </div>
    );
  }

  if (!analysisResult) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card
        title="ATS Score"
        description="How well your resume matches the job description"
      >
        <div className="py-4">
          <Progress
            value={analysisResult.score}
            label="ATS Compatibility Score"
            size="lg"
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-4">
          <Button
            onClick={handleOptimizeResume}
            isLoading={isOptimizing}
            size="lg"
            className="font-bold text-lg py-4 px-8"
          >
            Generate Optimized Resume
          </Button>

          {optimizedResume && (
            <Button
              onClick={forceShowOptimized}
              variant="secondary"
              size="lg"
              className="font-bold text-lg py-4 px-8"
            >
              View Optimized Resume
            </Button>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          title="Strengths"
          description="What's working well in your resume"
        >
          <ul className="list-disc pl-5 space-y-2">
            {analysisResult.strengths.map((strength, index) => (
              <li key={index} className="text-base text-gray-200">
                {strength}
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Weaknesses" description="Areas that need improvement">
          <ul className="list-disc pl-5 space-y-2">
            {analysisResult.weaknesses.map((weakness, index) => (
              <li key={index} className="text-base text-gray-200">
                {weakness}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card
        title="Important Keywords"
        description="Keywords from the job description you should include"
      >
        <div className="flex flex-wrap gap-2">
          {analysisResult.keywords.map((keyword, index) => (
            <span
              key={index}
              className="inline-flex items-center px-4 py-2 rounded-full text-base font-medium bg-primary/20 text-gray-200 border border-primary/40"
            >
              {keyword}
            </span>
          ))}
        </div>
      </Card>

      <Card
        title="Improvement Suggestions"
        description="Specific ways to improve your resume"
      >
        <ul className="list-disc pl-5 space-y-2">
          {analysisResult.improvement_suggestions.map((suggestion, index) => (
            <li key={index} className="text-base text-gray-200">
              {suggestion}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};
