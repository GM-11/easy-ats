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
            <div className="animate-pulse bg-gray-300 h-6 w-full rounded-full mb-4"></div>
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

  // Function to get color based on score
  const getScoreColor = () => {
    const score = analysisResult.score;
    if (score >= 80) return "primary";
    if (score >= 60) return "accent";
    if (score >= 40) return "secondary";
    return "default";
  };

  // Function to get description based on score
  const getScoreDescription = () => {
    const score = analysisResult.score;
    if (score >= 90)
      return "Excellent match! Your resume is highly compatible with this job.";
    if (score >= 80)
      return "Great match! Your resume aligns well with this job.";
    if (score >= 70)
      return "Good match. A few adjustments could improve your chances.";
    if (score >= 60)
      return "Moderate match. Consider optimizing key areas of your resume.";
    if (score >= 40)
      return "Fair match. Several improvements recommended for better ATS compatibility.";
    return "Needs improvement. Generate an optimized version to increase your chances.";
  };

  return (
    <div className="space-y-10">
      <Card
        title="ATS Compatibility Score"
        description="How well your resume matches the job description"
        variant={getScoreColor()}
        className="overflow-visible"
      >
        <div className="py-6">
          <div className="relative mb-12 pb-2">
            <Progress
              value={analysisResult.score}
              label="ATS Compatibility Score"
              size="xl"
              variant="gradient"
              animation={true}
            />
            <div className="mt-2 text-sm text-gray-600 text-center">
              {getScoreDescription()}
            </div>

            <div className="absolute top-full left-0 right-0 mt-6">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Poor Match</span>
                <span>Perfect Match</span>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            {!optimizedResume ? (
              <Button
                onClick={handleOptimizeResume}
                isLoading={isOptimizing}
                size="lg"
                className="font-bold shadow-md"
                leftIcon={
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                }
              >
                {isOptimizing ? "Generating..." : "Generate Optimized Resume"}
              </Button>
            ) : (
              <Button
                onClick={forceShowOptimized}
                variant="primary"
                size="lg"
                className="font-bold shadow-md"
                leftIcon={
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                }
              >
                View Optimized Resume
              </Button>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card
          title="Strengths"
          description="What's working well in your resume"
          className="h-full"
          variant="primary"
        >
          <ul className="list-disc pl-6 space-y-3 text-gray-700">
            {analysisResult.strengths.map((strength, index) => (
              <li key={index} className="text-base">
                <span className="flex items-start">
                  <span className="inline-flex items-center justify-center flex-shrink-0 h-5 w-5 rounded-full bg-primary-100 text-primary-600 mr-2 mt-0.5">
                    <svg
                      className="h-3 w-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  {strength}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card
          title="Weaknesses"
          description="Areas that need improvement"
          className="h-full"
          variant="accent"
        >
          <ul className="list-disc pl-6 space-y-3 text-gray-700">
            {analysisResult.weaknesses.map((weakness, index) => (
              <li key={index} className="text-base">
                <span className="flex items-start">
                  <span className="inline-flex items-center justify-center flex-shrink-0 h-5 w-5 rounded-full bg-red-100 text-red-600 mr-2 mt-0.5">
                    <svg
                      className="h-3 w-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  {weakness}
                </span>
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
              className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-primary-50 text-primary-800 border border-primary-200 shadow-sm"
            >
              {keyword}
            </span>
          ))}
        </div>
      </Card>

      <Card
        title="Improvement Suggestions"
        description="Specific ways to improve your resume"
        variant="primary"
      >
        <ul className="list-disc pl-6 space-y-4">
          {analysisResult.improvement_suggestions.map((suggestion, index) => (
            <li key={index} className="text-base text-gray-700">
              <span className="flex items-start">
                <span className="inline-flex items-center justify-center flex-shrink-0 h-5 w-5 rounded-full bg-primary-100 text-primary-600 mr-2 mt-0.5">
                  <svg
                    className="h-3 w-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
                  </svg>
                </span>
                {suggestion}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};
