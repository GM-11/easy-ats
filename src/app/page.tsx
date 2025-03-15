"use client";

import { useState, FormEvent, useEffect } from "react";
import { InputForm } from "@/components/main/InputForm";
import { AnalysisResults } from "@/components/main/AnalysisResults";
import { OptimizedResume } from "@/components/main/OptimizedResume";
import { AnalysisResult } from "@/types";

export default function Home() {
  const [jobDescription, setJobDescription] = useState("");
  const [resume, setResume] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [skills, setSkills] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [optimizedResume, setOptimizedResume] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"input" | "results" | "optimized">(
    "input"
  );
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (file: File | null) => {
    setResumeFile(file);
    // Clear text resume when file is selected
    if (file) {
      setResume("");
    }
  };

  const handleAnalyzeResume = async (e: FormEvent) => {
    e.preventDefault();

    if (!jobDescription.trim()) {
      setError("Please enter a job description");
      return;
    }

    // Both resume text and file are optional
    setError(null);
    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append("jobDescription", jobDescription);

      if (resumeFile) {
        formData.append("resumeFile", resumeFile);
      } else if (resume.trim()) {
        formData.append("resume", resume);
      }

      formData.append("skills", skills);

      const response = await fetch("/api/analyze-resume", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to analyze resume");
      }

      const result = await response.json();
      setAnalysisResult(result);

      setActiveTab("results");
    } catch (error) {
      console.error("Error analyzing resume:", error);
      setError("Failed to analyze resume. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleOptimizeResume = async () => {
    console.log("Starting optimization process...");
    setIsOptimizing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("jobDescription", jobDescription);

      if (resumeFile) {
        formData.append("resumeFile", resumeFile);
        console.log("Using resume file:", resumeFile.name);
      } else if (resume.trim()) {
        formData.append("resume", resume);
        console.log("Using resume text, length:", resume.length);
      } else {
        console.log("No resume provided, will generate from scratch");
      }

      formData.append("skills", skills);

      console.log("Sending optimize request to API...");
      const response = await fetch("/api/optimize-resume", {
        method: "POST",
        body: formData,
      });

      console.log("API response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server error:", errorData);
        throw new Error(errorData.error || "Failed to optimize resume");
      }

      const result = await response.json();
      console.log(
        "Optimization result received, length:",
        result.optimizedResume?.length || 0
      );

      if (!result.optimizedResume) {
        console.error("Received empty optimized resume");
        throw new Error("Received empty response from server");
      }

      // Use a callback to ensure the state is actually updated before moving to the next tab
      setOptimizedResume(result.optimizedResume);
      console.log(
        "Set optimizedResume state, value length:",
        result.optimizedResume.length
      );

      // Delay the tab change slightly to ensure state is updated
      setTimeout(() => {
        console.log(
          "Delayed tab change - Current optimizedResume:",
          !!optimizedResume
        );
        setActiveTab("optimized");
        console.log("Set active tab to 'optimized'");
      }, 100);
    } catch (error) {
      console.error("Error optimizing resume:", error);
      setError(
        "Failed to optimize resume. Please try again." +
          (error instanceof Error ? ` (${error.message})` : "")
      );
    } finally {
      setIsOptimizing(false);
      console.log("Optimization process complete, isOptimizing set to false");
    }
  };

  // Add a useEffect to log when the component renders
  useEffect(() => {
    console.log("Component rendered. Current state:", {
      activeTab,
      optimizedResumeExists: !!optimizedResume,
      analysisResultExists: !!analysisResult,
      isOptimizing,
      isAnalyzing,
    });
  }, [activeTab, optimizedResume, analysisResult, isOptimizing, isAnalyzing]);

  // Add a new useEffect specifically to handle optimizedResume changes
  useEffect(() => {
    if (optimizedResume && activeTab === "results") {
      console.log("Detected optimizedResume is available while on results tab");
      console.log("Enabling optimized tab navigation");
    }
  }, [optimizedResume, activeTab]);

  // Add a special function to force navigation to the optimized tab
  const forceShowOptimized = () => {
    console.log("Force navigation to optimized tab triggered");
    // Double check we have an optimized resume
    if (optimizedResume) {
      console.log(
        "Optimized resume content exists, length:",
        optimizedResume.length
      );
      console.log("Forcing tab change to optimized");
      setActiveTab("optimized");
    } else {
      console.log("Cannot navigate - no optimized resume available");
      setError(
        "No optimized resume is available yet. Please generate one first."
      );
    }
  };

  const goBackToAnalysis = () => {
    setActiveTab("results");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="bg-accent text-gray-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold">Easy ATS</h1>
          <p className="text-gray-200 mt-1">
            Optimize your resume for ATS systems
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="border-b border-accent/30">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("input")}
                className={`${
                  activeTab === "input"
                    ? "border-primary text-foreground font-bold"
                    : "border-transparent text-gray-400 hover:text-foreground hover:border-gray-400"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-base`}
              >
                Input
              </button>
              <button
                onClick={() => setActiveTab("results")}
                disabled={!analysisResult}
                className={`${
                  activeTab === "results"
                    ? "border-primary text-foreground font-bold"
                    : !analysisResult
                    ? "border-transparent text-gray-600 cursor-not-allowed"
                    : "border-transparent text-gray-400 hover:text-foreground hover:border-gray-400"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-base`}
              >
                Analysis Results
              </button>
              <button
                onClick={() => {
                  // Allow manual navigation if optimizedResume exists
                  if (optimizedResume) {
                    console.log(
                      "Navigating to optimized resume tab via button click"
                    );
                    setActiveTab("optimized");
                  }
                }}
                disabled={!optimizedResume}
                className={`${
                  activeTab === "optimized"
                    ? "border-primary text-foreground font-bold"
                    : !optimizedResume
                    ? "border-transparent text-gray-600 cursor-not-allowed"
                    : "border-transparent text-gray-400 hover:text-foreground hover:border-gray-400"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-base`}
              >
                Optimized Resume
              </button>
            </nav>
          </div>
        </div>

        {error && (
          <div className="mb-8 bg-red-900/20 border-2 border-red-700 text-red-200 px-5 py-4 rounded-md shadow-sm">
            {error}
          </div>
        )}

        {activeTab === "input" && (
          <InputForm
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            resume={resume}
            setResume={setResume}
            resumeFile={resumeFile}
            handleFileChange={handleFileChange}
            skills={skills}
            setSkills={setSkills}
            isAnalyzing={isAnalyzing}
            handleAnalyzeResume={handleAnalyzeResume}
          />
        )}

        {activeTab === "results" && (
          <AnalysisResults
            analysisResult={analysisResult}
            isAnalyzing={isAnalyzing}
            isOptimizing={isOptimizing}
            optimizedResume={optimizedResume}
            handleOptimizeResume={handleOptimizeResume}
            forceShowOptimized={forceShowOptimized}
          />
        )}

        {activeTab === "optimized" && (
          <OptimizedResume
            optimizedResume={optimizedResume}
            isOptimizing={isOptimizing}
            handleOptimizeResume={handleOptimizeResume}
            goBackToAnalysis={goBackToAnalysis}
          />
        )}
      </main>

      <footer className="bg-accent/80 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-200 text-sm">
            &copy; {new Date().getFullYear()} Easy ATS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
