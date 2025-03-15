"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnalysisResults } from "@/components/main/AnalysisResults";
import { OptimizedResume } from "@/components/main/OptimizedResume";
import { AnalysisResult } from "@/types";
import Header from "@/components/ui/Header";

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
      console.log("Loading data from localStorage");
      const savedAnalysisResult = localStorage.getItem("analysisResult");
      const savedJobDescription = localStorage.getItem("jobDescription");
      const savedSkills = localStorage.getItem("skills");
      const savedResume = localStorage.getItem("resume");
      const savedOptimizedResume = localStorage.getItem("optimizedResume");

      // Debug log what we're finding in localStorage
      console.log("Found in localStorage:");
      console.log("- analysisResult:", !!savedAnalysisResult);
      console.log("- jobDescription:", !!savedJobDescription);
      console.log("- skills:", !!savedSkills);
      console.log("- resume:", !!savedResume);
      console.log("- optimizedResume:", !!savedOptimizedResume);

      if (savedAnalysisResult) {
        setAnalysisResult(JSON.parse(savedAnalysisResult));
      } else {
        // No analysis result found, redirect back to home
        router.push("/");
        return;
      }

      if (savedJobDescription) setJobDescription(savedJobDescription);
      if (savedSkills) setSkills(savedSkills);
      if (savedResume) {
        console.log("Setting resume, length:", savedResume.length);
        setResume(savedResume);
      }
      if (savedOptimizedResume) {
        setOptimizedResume(savedOptimizedResume);
      }
    } catch (error) {
      console.error("Error loading saved data:", error);
      setError("An error occurred loading your results. Please try again.");
    }
  }, [router]);

  const handleOptimizeResume = async () => {
    setIsOptimizing(true);
    setError(null);

    // Log data being sent to the API
    console.log("Sending data to optimize-resume API:");
    console.log("Job Description Length:", jobDescription.length);
    console.log("Resume Length:", resume.length);
    console.log("Skills:", skills);

    try {
      // Ensure we have the job description
      if (!jobDescription.trim()) {
        throw new Error("Job description is required to optimize resume");
      }

      // Check if resume is empty and try to reload it
      if (!resume.trim()) {
        console.log("Resume is empty, trying to reload from localStorage");
        const savedResume = localStorage.getItem("resume");
        if (savedResume) {
          console.log(
            "Found resume in localStorage, length:",
            savedResume.length
          );
          setResume(savedResume);
        } else {
          console.log("No resume found in localStorage");
        }
      }

      const formData = new FormData();
      formData.append("jobDescription", jobDescription);

      // Ensure we're sending the resume text if available
      if (resume.trim()) {
        console.log("Adding resume text to request, length:", resume.length);
        formData.append("resume", resume);
      } else {
        console.log("No resume text available to send");

        // Try to get resume from localStorage as a last resort
        const savedResume = localStorage.getItem("resume");
        if (savedResume) {
          console.log(
            "Adding resume from localStorage, length:",
            savedResume.length
          );
          formData.append("resume", savedResume);
        }
      }

      // Add skills data
      formData.append("skills", skills);

      // Make the API request
      console.log("Sending request to optimize-resume API");
      const response = await fetch("/api/optimize-resume", {
        method: "POST",
        body: formData,
      });

      // Handle non-200 responses
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server error response:", errorData);
        throw new Error(errorData.error || "Failed to optimize resume");
      }

      // Parse the response
      console.log("Received successful response from optimize-resume API");
      const result = await response.json();

      // Validate the response
      if (!result.optimizedResume) {
        console.error("Response missing optimizedResume field:", result);
        throw new Error("Server returned an incomplete response");
      }

      // Set the optimized resume state
      console.log(
        "Setting optimized resume (length):",
        result.optimizedResume.length
      );
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
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-10 rounded-2xl shadow-lg border border-gray-200 max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary-100 flex items-center justify-center">
            <svg
              className="animate-spin h-8 w-8 text-primary-600"
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
          <p className="mb-6 text-lg text-gray-700">Loading your results...</p>
          <button
            onClick={goToHomePage}
            className="text-primary-600 hover:text-primary-800 font-medium transition-colors"
          >
            Return to Home Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Header />

      <main className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="mb-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900">
              Your Results
            </h2>
            <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
              Review the analysis of your resume and get an optimized version
              tailored to the job description.
            </p>
          </div>

          <div className="mb-8">
            <nav className="flex justify-center gap-4">
              <button
                onClick={() => setActiveTab("analysis")}
                className={`px-6 py-3 rounded-xl transition font-medium cursor-pointer ${
                  activeTab === "analysis"
                    ? "bg-primary-600 text-black shadow-md ring-2 ring-primary-600 ring-offset-2"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                <div className="flex items-center">
                  <svg
                    className="mr-2 h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Analysis Results
                </div>
              </button>
              <button
                onClick={() => setActiveTab("optimized")}
                disabled={!optimizedResume && isOptimizing === false}
                className={`px-6 py-3 rounded-xl transition font-medium cursor-pointer ${
                  activeTab === "optimized"
                    ? "bg-primary-600 text-black shadow-md ring-2 ring-primary-600 ring-offset-2"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                } ${
                  !optimizedResume && isOptimizing === false
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <div className="flex items-center">
                  <svg
                    className="mr-2 h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                  Optimized Resume
                </div>
              </button>
            </nav>
          </div>

          {error && (
            <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-10">
            {activeTab === "analysis" && (
              <AnalysisResults
                analysisResult={analysisResult}
                isAnalyzing={false}
                isOptimizing={isOptimizing}
                optimizedResume={optimizedResume}
                handleOptimizeResume={handleOptimizeResume}
                forceShowOptimized={handleOptimizeResume}
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
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-md bg-primary-600 flex items-center justify-center mr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <span className="text-lg font-medium text-gray-900">
                Easy ATS
              </span>
            </div>
            <div className="mt-4 md:mt-0">
              <p className="text-sm text-gray-500">
                &copy; {new Date().getFullYear()} Easy ATS. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
