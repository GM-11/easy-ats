"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { InputForm } from "@/components/main/InputForm";

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
    <div className="min-h-screen bg-background text-foreground pt-24">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center py-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">Easy ATS</h1>
            <p className="text-sm text-gray-700">
              Optimize your resume for ATS systems
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="mb-12 text-center">
          <h2 className="text-4xl font-extrabold">Transform Your Resume</h2>
          <p className="mt-4 text-lg text-gray-600">
            Get tailored feedback and optimize your resume for success.
          </p>
        </section>

        {error && (
          <div className="mb-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
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
