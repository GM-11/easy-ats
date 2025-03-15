"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { InputForm } from "@/components/main/InputForm";
import Header from "@/components/ui/Header";

export default function Home() {
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState("");
  const [resume, setResume] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [skills, setSkills] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (file: File | null) => {
    setResumeFile(file);
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

      // Store the result in localStorage
      localStorage.setItem("analysisResult", JSON.stringify(result));
      localStorage.setItem("jobDescription", jobDescription);
      localStorage.setItem("skills", skills);
      if (resume) localStorage.setItem("resume", resume);

      // Navigate to results page
      router.push("/results");
    } catch (error) {
      console.error("Error analyzing resume:", error);
      setError("Failed to analyze resume. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Header />

      <main className="pt-24 pb-16">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="flex flex-col justify-between">
              <h2 className="text-4xl font-display font-bold leading-tight">
                Transform Your Resume with{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                  AI-Powered
                </span>{" "}
                ATS Optimization
              </h2>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                Get personalized feedback and optimize your resume to pass
                Applicant Tracking Systems and land more interviews.
              </p>
              <div className="mt-16 space-y-6">
                <div className="prose prose-blue">
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Our advanced AI analyzes your resume against job
                    descriptions to ensure you present your best self to
                    potential employers. Get detailed insights into:
                  </p>
                  <ul className="mt-4 space-y-2 text-gray-600">
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      Keyword optimization and matching
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      Skills gap analysis
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      Format and readability improvements
                    </li>
                  </ul>
                </div>

                <div>
                  <p className="text-lg mt-16 font-semibold text-gray-800">
                    Why use Easy ATS?
                  </p>
                  <p className="mt-2 text-gray-600">
                    In today's competitive job market, over 75% of resumes are
                    rejected by ATS before reaching human eyes. Our tool helps
                    you break through that barrier with smart optimization and
                    actionable feedback.
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Pro tip:</span> Upload both
                    your resume and the job description to get the most accurate
                    matching and optimization suggestions.
                  </p>
                </div>
              </div>

              <div className="mt-10 flex flex-wrap gap-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      ATS Score
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      See how well your resume matches the job
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-md bg-teal-100 text-teal-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Instant Optimization
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get an optimized version of your resume
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:ml-auto">
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Get Started
                </h3>
                {error && (
                  <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
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
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-primary-50 to-primary-100 py-16 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-display font-bold text-gray-900">
                How It Works
              </h2>
              <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                Our AI-powered system analyzes your resume against the job
                description to help you stand out.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="bg-white rounded-xl shadow-md p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary-600">1</span>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-primary-600"
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
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Paste Job Description
                </h3>
                <p className="text-gray-600">
                  Enter the job description you're applying for and upload your
                  resume.
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary-600">2</span>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-primary-600"
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
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Review Analysis
                </h3>
                <p className="text-gray-600">
                  Get detailed feedback on your resume's strengths and
                  weaknesses.
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary-600">3</span>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-primary-600"
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
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Get Optimized Resume
                </h3>
                <p className="text-gray-600">
                  Download an ATS-optimized version of your resume tailored to
                  the job.
                </p>
              </div>
            </div>
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
