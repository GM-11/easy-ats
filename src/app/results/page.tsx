"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnalysisResults } from "@/components/main/AnalysisResults";
import { OptimizedResume } from "@/components/main/OptimizedResume";
import { AnalysisResult } from "@/types";

export default function ResultsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"analysis" | "optimized">(
    "analysis"
  );
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [optimizedResume, setOptimizedResume] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [resume, setResume] = useState("");
  const [skills, setSkills] = useState("");

  // Load data from localStorage on component mount
  useEffect(() => {
    try {
      const savedAnalysisResult = localStorage.getItem("analysisResult");
      const savedJobDescription = localStorage.getItem("jobDescription");
      const savedSkills = localStorage.getItem("skills");
      const savedResume = localStorage.getItem("resume");

      if (savedAnalysisResult) {
        setAnalysisResult(JSON.parse(savedAnalysisResult));
      } else {
        // No analysis result found, redirect back to home
        router.push("/");
        return;
      }

      if (savedJobDescription) setJobDescription(savedJobDescription);
      if (savedSkills) setSkills(savedSkills);
      if (savedResume) setResume(savedResume);
    } catch (error) {
      console.error("Error loading saved data:", error);
      setError("An error occurred loading your results. Please try again.");
    }
  }, [router]);

  const handleOptimizeResume = async () => {
    setIsOptimizing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("jobDescription", jobDescription);
      if (resume.trim()) {
        formData.append("resume", resume);
      }
      formData.append("skills", skills);

      const response = await fetch("/api/optimize-resume", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server error:", errorData);
        throw new Error(errorData.error || "Failed to optimize resume");
      }

      const result = await response.json();

      if (!result.optimizedResume) {
        console.error("Received empty optimized resume");
        throw new Error("Received empty response from server");
      }

      setOptimizedResume(result.optimizedResume);

      // Log the extracted user info for debugging
      if (result.userInfo) {
        console.log("Extracted user information:", result.userInfo);
      }

      // Save the optimized resume to localStorage
      localStorage.setItem("optimizedResume", result.optimizedResume);

      // Save extracted user info if available
      if (result.userInfo) {
        localStorage.setItem("userInfo", JSON.stringify(result.userInfo));
      }

      // Switch to the optimized tab
      setActiveTab("optimized");
    } catch (error) {
      console.error("Error optimizing resume:", error);
      setError(
        "Failed to optimize resume. Please try again." +
          (error instanceof Error ? ` (${error.message})` : "")
      );
    } finally {
      setIsOptimizing(false);
    }
  };

  // Navigate back to home page
  const goToHomePage = () => {
    router.push("/");
  };

  if (!analysisResult) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-lg">Loading your results...</p>
          <button
            onClick={goToHomePage}
            className="text-primary hover:underline"
          >
            Return to Home Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-24">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center py-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">Easy ATS</h1>
            <p className="text-sm text-gray-700">
              Optimize your resume for ATS systems
            </p>
          </div>
          <button
            onClick={goToHomePage}
            className="mt-3 sm:mt-0 text-primary hover:underline"
          >
            Back to Home
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="mb-8">
          <h2 className="text-3xl font-bold text-center mb-8">Your Results</h2>

          <div className="mb-8">
            <nav className="flex justify-center gap-4">
              <button
                onClick={() => setActiveTab("analysis")}
                className={`px-6 py-3 rounded-full transition font-medium ${
                  activeTab === "analysis"
                    ? "bg-primary text-white shadow-md"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Analysis Results
              </button>
              <button
                onClick={() => setActiveTab("optimized")}
                disabled={!optimizedResume && isOptimizing === false}
                className={`px-6 py-3 rounded-full transition font-medium ${
                  activeTab === "optimized"
                    ? "bg-primary text-white shadow-md"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                } ${
                  !optimizedResume && isOptimizing === false
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                Optimized Resume
              </button>
            </nav>
          </div>

          {error && (
            <div className="mb-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {activeTab === "analysis" && (
            <AnalysisResults
              analysisResult={analysisResult}
              isAnalyzing={false}
              isOptimizing={isOptimizing}
              optimizedResume={optimizedResume}
              handleOptimizeResume={handleOptimizeResume}
              forceShowOptimized={() => setActiveTab("optimized")}
            />
          )}

          {activeTab === "optimized" && (
            <OptimizedResume
              optimizedResume={optimizedResume}
              isOptimizing={isOptimizing}
              handleOptimizeResume={handleOptimizeResume}
              goBackToAnalysis={() => setActiveTab("analysis")}
            />
          )}
        </section>
      </main>

      <footer className="bg-white/80 backdrop-blur-lg py-6 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-600">
            &copy; {new Date().getFullYear()} Easy ATS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
