"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnalysisResults } from "@/components/main/AnalysisResults";
import Header from "@/components/ui/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SkeletonText } from "@/components/ui/Skeleton";
import { Progress } from "@/components/ui/Progress";
import { AnalysisResult } from "@/types";
import {
  generateResumePDF,
  downloadPDF,
  extractResumeInfo,
} from "@/lib/pdfUtils";

export default function ResultsPage() {
  const router = useRouter();
  const [activeResumeTab, setActiveResumeTab] = useState<
    "original" | "optimized"
  >("original");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [optimizedResume, setOptimizedResume] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [resume, setResume] = useState("");
  const [skills, setSkills] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [savedUserInfo, setSavedUserInfo] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editableContent, setEditableContent] = useState("");
  const [contentSource, setContentSource] = useState<string>("none");

  // Load data from localStorage on component mount
  useEffect(() => {
    try {
      console.log("Loading data from localStorage");
      const savedAnalysisResult = localStorage.getItem("analysisResult");
      const savedJobDescription = localStorage.getItem("jobDescription");
      const savedSkills = localStorage.getItem("skills");
      const savedResume = localStorage.getItem("resume");
      const savedOptimizedResume = localStorage.getItem("optimizedResume");
      const userInfoStr = localStorage.getItem("userInfo");

      // Check for extracted resume text (should take priority)
      const extractedResumeText = localStorage.getItem("extractedResumeText");

      // Debug log what we're finding in localStorage
      console.log("Found in localStorage:");
      console.log("- analysisResult:", !!savedAnalysisResult);
      console.log("- jobDescription:", !!savedJobDescription);
      console.log("- skills:", !!savedSkills);
      console.log("- resume:", !!savedResume);
      console.log("- optimizedResume:", !!savedOptimizedResume);
      console.log("- extractedResumeText:", !!extractedResumeText);

      if (savedAnalysisResult) {
        const parsedResult = JSON.parse(savedAnalysisResult);
        setAnalysisResult(parsedResult);

        // Check if the analysis result contains extractedText field
        if (parsedResult.extractedText) {
          console.log(
            "Using extractedText from analysis result (length:",
            parsedResult.extractedText.length,
            ")"
          );
          setResume(parsedResult.extractedText);
          setContentSource("analysisResult");

          // Also prepare for edit mode and save to localStorage for future use
          setEditableContent(parsedResult.extractedText);
          localStorage.setItem(
            "extractedResumeText",
            parsedResult.extractedText
          );
          localStorage.setItem("resume", parsedResult.extractedText);
        }
      } else {
        // No analysis result found, redirect back to home
        router.push("/");
        return;
      }

      if (savedJobDescription) setJobDescription(savedJobDescription);
      if (savedSkills) setSkills(savedSkills);

      // If we didn't already set the resume from the analysis result
      if (contentSource !== "analysisResult") {
        // RESUME HANDLING PRIORITY:
        // 1. Use previously extracted text if available
        // 2. If resume is PDF, extract text and use that
        // 3. Use plain text resume as is

        // First, check if we have already extracted text
        if (extractedResumeText && extractedResumeText.length > 100) {
          console.log(
            "Using previously extracted resume text (length:",
            extractedResumeText.length,
            ")"
          );
          setResume(extractedResumeText);
          setContentSource("extractedText");

          // Also prepare for edit mode
          setEditableContent(extractedResumeText);
        }
        // Next, check if we have a resume to process
        else if (savedResume) {
          console.log("Found resume, length:", savedResume.length);

          // Check if resume is in PDF format
          if (savedResume.startsWith("%PDF")) {
            console.log("PDF format detected, extracting text");

            // Store original PDF for reference
            localStorage.setItem("originalResumePDF", savedResume);

            // Extract text from PDF
            const extractedContent = extractTextFromPDF(savedResume);

            if (extractedContent && extractedContent.length > 100) {
              console.log(
                "Successfully extracted text from PDF (length:",
                extractedContent.length,
                ")"
              );

              // Use the extracted content
              setResume(extractedContent);
              setContentSource("freshlyExtracted");

              // Save for future use
              localStorage.setItem("extractedResumeText", extractedContent);
              localStorage.setItem("resume", extractedContent);

              // Prepare for edit mode
              setEditableContent(extractedContent);
            } else {
              console.log(
                "Failed to extract useful text, creating placeholder"
              );
              const placeholderResume =
                generateBasicResumePlaceholder(savedUserInfo);
              setResume(placeholderResume);
              setContentSource("placeholder");

              localStorage.setItem("extractedResumeText", placeholderResume);
              localStorage.setItem("resume", placeholderResume);

              // Auto-enable edit mode for placeholder and prepare content
              setIsEditMode(true);
              setEditableContent(placeholderResume);
            }
          } else {
            // Not a PDF, use as plain text
            console.log(
              "Using plain text resume (length:",
              savedResume.length,
              ")"
            );
            setResume(savedResume);
            setContentSource("plainText");
            setEditableContent(savedResume);
          }
        } else {
          console.log("No resume found in localStorage");
          setContentSource("none");
        }
      }

      // Handle optimized resume with similar logic
      if (savedOptimizedResume) {
        if (savedOptimizedResume.startsWith("%PDF")) {
          console.log(
            "PDF format detected in optimized resume, extracting text"
          );
          const extractedContent = extractTextFromPDF(savedOptimizedResume);

          // Store the original PDF
          localStorage.setItem(
            "originalOptimizedResumePDF",
            savedOptimizedResume
          );

          if (extractedContent && extractedContent.length > 100) {
            console.log(
              "Successfully extracted optimized resume text from PDF"
            );
            setOptimizedResume(extractedContent);
            localStorage.setItem(
              "extractedOptimizedResumeText",
              extractedContent
            );
            localStorage.setItem("optimizedResume", extractedContent);

            if (activeResumeTab === "optimized") {
              setEditableContent(extractedContent);
            }
          } else {
            console.log("Failed to extract useful text from optimized PDF");

            // Use the original resume as a base for optimization if extraction failed
            const baseContent =
              resume || localStorage.getItem("extractedResumeText") || "";
            setOptimizedResume(baseContent);
            localStorage.setItem("optimizedResume", baseContent);

            if (activeResumeTab === "optimized") {
              setEditableContent(baseContent);
              setIsEditMode(true);
            }
          }
        } else {
          // Not a PDF, use as-is
          setOptimizedResume(savedOptimizedResume);

          if (activeResumeTab === "optimized") {
            setEditableContent(savedOptimizedResume);
          }
        }
      } else {
        // Try to use previously extracted optimized text
        const extractedOptimizedText = localStorage.getItem(
          "extractedOptimizedResumeText"
        );
        if (extractedOptimizedText) {
          console.log("Using previously extracted optimized resume text");
          setOptimizedResume(extractedOptimizedText);

          if (activeResumeTab === "optimized") {
            setEditableContent(extractedOptimizedText);
          }
        }
      }

      // Load user info
      if (userInfoStr) {
        const userInfo = JSON.parse(userInfoStr);
        setSavedUserInfo(userInfo);
        console.log("Loaded user info from localStorage:", userInfo);
      }
    } catch (error) {
      console.error("Error loading saved data:", error);
      setError("An error occurred loading your results. Please try again.");
    }
  }, [router]); // Remove activeResumeTab dependency to prevent reloading issues

  // Function to extract text from PDF content (improved version)
  const extractTextFromPDF = (pdfContent: string): string => {
    console.log("Attempting to extract text from PDF");
    if (!pdfContent || !pdfContent.startsWith("%PDF")) {
      console.log("Not a valid PDF");
      return "";
    }

    try {
      // Try multiple patterns to extract text from PDF data
      let extractedText = "";

      // Pattern 1: Look for text between parentheses
      const textMatches = pdfContent.match(/\(([^)]+)\)/g) || [];
      console.log(`Found ${textMatches.length} text matches in PDF`);

      if (textMatches.length > 0) {
        // Extract text from PDF content by removing parentheses and cleaning up
        extractedText = textMatches
          .map((match) => match.substring(1, match.length - 1))
          .filter((text) => text.trim().length > 1) // Filter out single characters
          .join("\n");

        // Replace special characters and formatting
        extractedText = extractedText
          .replace(/\\n/g, "\n")
          .replace(/\\r/g, "")
          .replace(/\\t/g, "  ")
          .replace(/\\/g, "");

        // Remove PDF internal notation and extra spaces
        extractedText = extractedText
          .replace(/Tj ET/g, "")
          .replace(/TJ ET/g, "")
          .replace(/BT\s*\/F\d+\s+\d+\s+Tf/g, "")
          .replace(/\s{3,}/g, "\n")
          .trim();

        // If we found substantial text, make some final cleanups and return it
        if (extractedText.length > 100) {
          // Make final cleanups to make the content more readable
          extractedText = extractedText
            .split("\n")
            .filter((line) => line.trim().length > 0)
            .join("\n");

          // Try to identify and remove repeated header/footer text
          extractedText = removeRepeatedHeadersFooters(extractedText);

          console.log("Successfully extracted text from PDF (pattern 1)");
          return extractedText;
        }
      }

      // Pattern 2: Try a fallback pattern for different PDF formats
      const fallbackMatches = pdfContent.match(/BT\s*\[(.*?)\]\s*TJ/g) || [];
      console.log(`Found ${fallbackMatches.length} fallback matches in PDF`);

      if (fallbackMatches.length > 0) {
        extractedText = fallbackMatches.join("\n");
        extractedText = extractedText
          .replace(/BT\s*\[/g, "")
          .replace(/\]\s*TJ/g, "")
          .replace(/[0-9.-]+/g, " ")
          .replace(/\s{2,}/g, "\n")
          .trim();

        if (extractedText.length > 100) {
          console.log("Successfully extracted text from PDF (pattern 2)");
          return extractedText;
        }
      }

      // Pattern 3: Try to find text streams
      const streamMatches =
        pdfContent.match(/stream([\s\S]*?)endstream/g) || [];
      console.log(`Found ${streamMatches.length} stream matches in PDF`);

      if (streamMatches.length > 0) {
        // Get the largest stream which is likely to contain the text
        const largestStream = streamMatches.reduce(
          (prev, current) => (current.length > prev.length ? current : prev),
          ""
        );

        // Extract readable characters
        const readableText = largestStream
          .replace(/[^\x20-\x7E\n]/g, " ")
          .replace(/\s{2,}/g, "\n")
          .trim();

        if (readableText.length > 100) {
          console.log("Successfully extracted text from PDF (pattern 3)");
          return readableText;
        }
      }

      console.log("Failed to extract meaningful text from PDF");
    } catch (e) {
      console.error("Error extracting text from PDF:", e);
    }

    return "";
  };

  // Function to remove repeated headers/footers from extracted text
  const removeRepeatedHeadersFooters = (text: string): string => {
    const lines = text.split("\n");
    const lineFrequency: Record<string, number> = {};

    // Count frequency of each line
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.length > 0) {
        lineFrequency[trimmed] = (lineFrequency[trimmed] || 0) + 1;
      }
    });

    // Filter out lines that appear too frequently (likely headers/footers)
    const threshold = Math.max(3, Math.floor(lines.length / 10)); // Adjust as needed
    return lines
      .filter((line) => {
        const trimmed = line.trim();
        return (
          trimmed.length === 0 ||
          (lineFrequency[trimmed] || 0) < threshold ||
          trimmed.length > 50
        ); // Keep longer lines even if repeated
      })
      .join("\n");
  };

  // Function to generate a basic resume placeholder when extraction fails
  const generateBasicResumePlaceholder = (userInfo: any = null) => {
    const name = userInfo?.name || "Your Name";
    const email = userInfo?.email || "email@example.com";
    const phone = userInfo?.phone || "(123) 456-7890";

    return `${name}
${email} | ${phone}

>> Your original resume text could not be extracted from the PDF. <<
>> Please replace this text with your resume content. <<

Professional Summary:
(Add a brief summary of your professional background and key qualifications.)

Work Experience:
(List your work experience, including job titles, companies, dates, and accomplishments.)

Education:
(List your educational background, degrees, institutions, and graduation dates.)

Skills:
(List relevant skills for the position you're applying for.)

Certifications:
(List any professional certifications you hold.)
`;
  };

  const handleOptimizeResume = async () => {
    setIsOptimizing(true);
    setError(null);

    try {
      // Ensure we have the job description
      if (!jobDescription.trim()) {
        throw new Error("Job description is required to optimize resume");
      }

      // Get the best available text version of the resume
      let resumeTextToOptimize = "";

      // PRIORITY ORDER FOR RESUME TEXT:
      // 1. Use the current state's resume if it's not a PDF
      // 2. Use extractedResumeText from localStorage
      // 3. Extract text from PDF if needed

      if (resume && !resume.startsWith("%PDF")) {
        // If current resume state is already text, use it
        console.log(
          "Using current resume state text for optimization, length:",
          resume.length
        );
        resumeTextToOptimize = resume;
      } else {
        // Try to get previously extracted text
        const extractedResumeText = localStorage.getItem("extractedResumeText");
        if (extractedResumeText && extractedResumeText.length > 100) {
          console.log(
            "Using previously extracted text for optimization, length:",
            extractedResumeText.length
          );
          resumeTextToOptimize = extractedResumeText;
        } else if (resume && resume.startsWith("%PDF")) {
          console.log("Current resume is PDF, extracting text locally");
          const extractedContent = extractTextFromPDF(resume);
          if (extractedContent && extractedContent.length > 100) {
            console.log(
              "Successfully extracted text locally, length:",
              extractedContent.length
            );
            resumeTextToOptimize = extractedContent;
            // Save for future use
            localStorage.setItem("extractedResumeText", extractedContent);
          } else {
            // Last resort: Try to get any resume text from localStorage
            const savedResume = localStorage.getItem("resume");
            if (savedResume && !savedResume.startsWith("%PDF")) {
              console.log(
                "Using saved resume text as fallback, length:",
                savedResume.length
              );
              resumeTextToOptimize = savedResume;
            } else {
              // We've tried everything and still don't have usable text
              throw new Error("No usable resume text found for optimization");
            }
          }
        }
      }

      // Final check to ensure we have text to optimize
      if (!resumeTextToOptimize.trim() || resumeTextToOptimize.length < 100) {
        throw new Error(
          "Resume text is too short or empty. Please edit your resume first."
        );
      }

      const formData = new FormData();
      formData.append("jobDescription", jobDescription);
      formData.append("resume", resumeTextToOptimize);
      formData.append("skills", skills);

      console.log(
        "Sending optimization request with resume text, length:",
        resumeTextToOptimize.length
      );

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

      // If we've successfully optimized text, ensure our original resume state
      // is using the extracted text, not PDF data
      if (!resume || resume.startsWith("%PDF")) {
        // If our current resume state is empty or PDF, update it with the text we used
        console.log("Updating resume state with text used for optimization");
        setResume(resumeTextToOptimize);
        localStorage.setItem("resume", resumeTextToOptimize);
      }

      // Check if the result contains extractedText
      if (result.extractedText) {
        console.log(
          "Using extractedText from optimization result (length:",
          result.extractedText.length,
          ")"
        );
        // Keep tracked of extracted text but don't override current text content
        localStorage.setItem("extractedResumeText", result.extractedText);
        setResume(result.extractedText);

        // Make sure editableContent is updated if we're in edit mode on the original tab
        if (isEditMode && activeResumeTab === "original") {
          setEditableContent(result.extractedText);
        }
      }

      // Set the optimized resume state using the optimizedResume field
      console.log(
        "Setting optimized resume (length):",
        result.optimizedResume.length
      );
      setOptimizedResume(result.optimizedResume);

      // Save the optimized resume to localStorage
      localStorage.setItem("optimizedResume", result.optimizedResume);

      // If we're in edit mode on the optimized tab, update the editable content
      if (isEditMode && activeResumeTab === "optimized") {
        setEditableContent(result.optimizedResume);
      }

      // Log the extracted user info for debugging
      if (result.userInfo) {
        console.log("Extracted user information:", result.userInfo);
        setSavedUserInfo(result.userInfo);
        localStorage.setItem("userInfo", JSON.stringify(result.userInfo));
      }

      // Switch to the optimized tab
      setActiveResumeTab("optimized");
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

  const handleGetNewScore = async () => {
    // Prevent running if already in progress
    if (isOptimizing) {
      console.log("Already optimizing, ignoring duplicate request");
      return;
    }

    setIsOptimizing(true);
    setError(null);

    try {
      // Debug current state before proceeding
      console.log("=== GET NEW SCORE DEBUG INFO ===");
      console.log("Current Tab:", activeResumeTab);
      console.log("isEditMode:", isEditMode);

      // DIRECTLY read content from localStorage first for more reliability
      const storedOptimizedResume = localStorage.getItem("optimizedResume");
      const storedResume = localStorage.getItem("resume");
      const extractedResumeText = localStorage.getItem("extractedResumeText");

      console.log("Content from localStorage:");
      console.log(
        "- storedOptimizedResume length:",
        storedOptimizedResume?.length || 0
      );
      console.log("- storedResume length:", storedResume?.length || 0);
      console.log(
        "- extractedResumeText length:",
        extractedResumeText?.length || 0
      );

      // Content from React state (less reliable due to async updates)
      console.log("Content from React state:");
      console.log("- optimizedResume length:", optimizedResume?.length || 0);
      console.log("- resume length:", resume?.length || 0);

      // Create the form data object
      const formData = new FormData();
      formData.append("jobDescription", jobDescription);

      // Determine which content to use, PRIORITIZING localStorage over React state
      let currentResume = "";
      let contentSource = "";

      if (activeResumeTab === "optimized") {
        // First priority: localStorage optimized resume
        if (
          storedOptimizedResume &&
          storedOptimizedResume.length > 100 &&
          !storedOptimizedResume.startsWith("%PDF")
        ) {
          console.log("Using optimized resume from localStorage");
          currentResume = storedOptimizedResume;
          contentSource = "localStorage-optimized";

          // Update state to match localStorage (not required for API call but keeps UI consistent)
          setOptimizedResume(storedOptimizedResume);
        }
        // Second priority: React state optimized resume
        else if (
          optimizedResume &&
          optimizedResume.length > 100 &&
          !optimizedResume.startsWith("%PDF")
        ) {
          console.log("Using optimized resume from React state");
          currentResume = optimizedResume;
          contentSource = "state-optimized";
        }
        // Third priority: localStorage original resume
        else if (
          storedResume &&
          storedResume.length > 100 &&
          !storedResume.startsWith("%PDF")
        ) {
          console.log("Falling back to original resume from localStorage");
          currentResume = storedResume;
          contentSource = "localStorage-original";

          // Update state for consistency
          setResume(storedResume);
        }
        // Fourth priority: React state original resume
        else if (resume && resume.length > 100 && !resume.startsWith("%PDF")) {
          console.log("Falling back to original resume from React state");
          currentResume = resume;
          contentSource = "state-original";
        }
        // Last resort: extracted text
        else if (extractedResumeText && extractedResumeText.length > 100) {
          console.log("Using extracted resume text from localStorage");
          currentResume = extractedResumeText;
          contentSource = "localStorage-extracted";

          // Update state for consistency
          setResume(extractedResumeText);
        } else {
          throw new Error(
            "No valid resume content found. Please edit your resume first."
          );
        }
      } else {
        // Original tab - similar priority but without optimized content
        if (
          storedResume &&
          storedResume.length > 100 &&
          !storedResume.startsWith("%PDF")
        ) {
          console.log("Using original resume from localStorage");
          currentResume = storedResume;
          contentSource = "localStorage-original";

          // Update state for consistency
          setResume(storedResume);
        } else if (
          resume &&
          resume.length > 100 &&
          !resume.startsWith("%PDF")
        ) {
          console.log("Using original resume from React state");
          currentResume = resume;
          contentSource = "state-original";
        } else if (extractedResumeText && extractedResumeText.length > 100) {
          console.log("Using extracted resume text from localStorage");
          currentResume = extractedResumeText;
          contentSource = "localStorage-extracted";

          // Update state for consistency
          setResume(extractedResumeText);
        } else {
          throw new Error(
            "No valid resume content found. Please edit your resume first."
          );
        }
      }

      // Final validation
      console.log("Selected content source:", contentSource);
      console.log("Final currentResume length:", currentResume.length);
      console.log("First 50 chars:", currentResume.substring(0, 50));

      if (!currentResume || currentResume.length < 100) {
        throw new Error(
          "Selected resume content is too short. Please edit your resume to add more content."
        );
      }

      // Add to form data and make the API call
      formData.append("resume", currentResume);
      formData.append("skills", skills);

      console.log(
        "Sending request to analyze-resume API with content from:",
        contentSource
      );
      const response = await fetch("/api/analyze-resume", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze resume");
      }

      // Process the response
      const result = await response.json();
      setAnalysisResult(result);

      console.log("Successfully updated analysis result");

      // Handle extracted text if available
      if (result.extractedText && result.extractedText.length > 100) {
        console.log(
          "Got extractedText in response (length:",
          result.extractedText.length,
          ")"
        );

        // Save extracted text to localStorage regardless of tab
        localStorage.setItem("extractedResumeText", result.extractedText);

        // Only update the resume state if we're on the original tab
        if (activeResumeTab === "original") {
          console.log("Updating original resume with extracted text");
          setResume(result.extractedText);
          localStorage.setItem("resume", result.extractedText);
        }
      }

      // Save to localStorage
      localStorage.setItem("analysisResult", JSON.stringify(result));
    } catch (error) {
      console.error("Error getting new score:", error);
      setError(
        "Failed to update the score. Please try again." +
          (error instanceof Error ? ` (${error.message})` : "")
      );
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleCopyToClipboard = () => {
    const resumeText =
      activeResumeTab === "optimized" && optimizedResume
        ? optimizedResume
        : resume;

    if (resumeText) {
      navigator.clipboard.writeText(resumeText);
      setCopySuccess(true);

      // Reset the success message after 2 seconds
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    }
  };

  const handleDownloadPDF = async () => {
    const resumeText =
      activeResumeTab === "optimized" && optimizedResume
        ? optimizedResume
        : resume;

    if (!resumeText) return;

    setIsDownloading(true);
    try {
      // Extract information from resume
      const extractedInfo = extractResumeInfo(resumeText);

      // Use saved user info from the original resume if available
      const resumeData = {
        content: resumeText,
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

      // Generate filename based on name and type
      const formattedName = resumeData.metadata.name
        .replace(/\s+/g, "_")
        .toLowerCase();
      const resumeType =
        activeResumeTab === "optimized" ? "optimized" : "original";
      const filename = `${formattedName}_${resumeType}_resume.pdf`;

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

  // Navigate back to home page
  const goToHomePage = () => {
    router.push("/");
  };

  // Toggle edit mode and ensure current content is loaded
  const toggleEditMode = () => {
    if (!isEditMode) {
      // Entering edit mode - load current content for editing
      const currentContent =
        activeResumeTab === "optimized" && optimizedResume
          ? optimizedResume
          : resume;

      console.log(
        `Entering edit mode with ${activeResumeTab} resume content (length: ${currentContent.length})`
      );
      setEditableContent(currentContent);
    } else {
      // Exiting edit mode - save changes
      console.log("Saving edited content");
      saveChanges();
    }

    setIsEditMode(!isEditMode);
  };

  // Save changes with better logging
  const saveChanges = () => {
    console.log(`Saving changes to ${activeResumeTab} resume`);

    if (activeResumeTab === "optimized") {
      console.log(
        `Updated optimized resume (length: ${editableContent.length})`
      );
      setOptimizedResume(editableContent);
      localStorage.setItem("optimizedResume", editableContent);
      localStorage.setItem("extractedOptimizedResumeText", editableContent);
    } else {
      console.log(
        `Updated original resume (length: ${editableContent.length})`
      );
      setResume(editableContent);
      localStorage.setItem("resume", editableContent);
      localStorage.setItem("extractedResumeText", editableContent);
    }
  };

  // Handle content changes in edit mode
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditableContent(e.target.value);
  };

  // Handle tab switching with auto-optimization
  const handleTabSwitch = (tab: "original" | "optimized") => {
    if (isEditMode) {
      saveChanges();
    }

    console.log(`Switching to ${tab} resume tab`);

    // Check if we're switching to optimized tab
    if (tab === "optimized") {
      // First check if we already have optimized content
      let hasOptimizedContent = false;

      // Check state first
      if (optimizedResume && optimizedResume.length > 100) {
        console.log("Already have optimized resume in state");
        hasOptimizedContent = true;
      } else {
        // Check localStorage
        const storedOptimizedResume = localStorage.getItem("optimizedResume");
        if (
          storedOptimizedResume &&
          storedOptimizedResume.length > 100 &&
          !storedOptimizedResume.startsWith("%PDF")
        ) {
          console.log("Found optimized resume in localStorage");
          setOptimizedResume(storedOptimizedResume);
          hasOptimizedContent = true;

          // Also update editable content if in edit mode
          if (isEditMode) {
            setEditableContent(storedOptimizedResume);
          }
        }
      }

      // Only start optimization if we don't have content and aren't already optimizing
      if (!hasOptimizedContent && !isOptimizing) {
        // Validate that we have a resume to optimize
        const extractedResumeText = localStorage.getItem("extractedResumeText");
        if (
          (resume && resume.length > 100 && !resume.startsWith("%PDF")) ||
          (extractedResumeText && extractedResumeText.length > 100)
        ) {
          console.log("Starting optimization process");
          // Set the tab first so the UI updates, then start optimization
          setActiveResumeTab(tab);
          setTimeout(() => handleOptimizeResume(), 100); // slight delay to let state update
          return; // Return early as we're handling the tab switch asynchronously
        } else {
          console.log("No valid resume content available for optimization");
          setError(
            "Please edit your resume before generating an optimized version."
          );
        }
      }
    }

    // Set active tab (for cases where we didn't return early)
    setActiveResumeTab(tab);

    // Update editable content if in edit mode
    if (isEditMode) {
      if (tab === "optimized" && optimizedResume) {
        setEditableContent(optimizedResume);
      } else {
        setEditableContent(resume);
      }
    }
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

  // Update renderResumeDocument with a fallback mechanism for optimized content
  const renderResumeDocument = () => {
    // For optimized tab, check for stored optimized resume if state is empty
    let currentContent;

    if (activeResumeTab === "optimized") {
      // Try multiple sources for optimized content
      if (
        optimizedResume &&
        typeof optimizedResume === "string" &&
        optimizedResume.length > 100
      ) {
        // Use state if it's valid
        console.log("Using optimized resume from state for rendering");
        currentContent = optimizedResume;
      } else {
        // Try to get from localStorage
        const storedOptimizedResume = localStorage.getItem("optimizedResume");
        if (
          storedOptimizedResume &&
          storedOptimizedResume.length > 100 &&
          !storedOptimizedResume.startsWith("%PDF")
        ) {
          // Use the stored version and update state
          console.log("Using optimized resume from localStorage for rendering");
          currentContent = storedOptimizedResume;

          // Update state if not already updating (avoids state update in render)
          if (!isOptimizing) {
            console.log("Updating optimizedResume state from localStorage");
            // Use setTimeout to defer the state update until after render
            setTimeout(() => {
              setOptimizedResume(storedOptimizedResume);
            }, 0);
          }
        } else if (
          resume &&
          typeof resume === "string" &&
          resume.length > 100
        ) {
          // If we still don't have optimized content, fall back to original resume
          console.log("Falling back to original resume for rendering");
          currentContent = resume;
        } else {
          // Last resort - check localStorage for original resume
          const storedResume = localStorage.getItem("resume");
          if (
            storedResume &&
            storedResume.length > 100 &&
            !storedResume.startsWith("%PDF")
          ) {
            console.log(
              "Using original resume from localStorage as fallback for rendering"
            );
            currentContent = storedResume;

            // Update state if not already updating
            if (!isOptimizing) {
              setTimeout(() => {
                setResume(storedResume);
              }, 0);
            }
          } else {
            // Really nothing is available
            console.log("No valid content available for rendering");
            currentContent = "";
          }
        }
      }
    } else {
      // Original tab - try state first, then localStorage
      if (resume && typeof resume === "string" && resume.length > 100) {
        console.log("Using original resume from state for rendering");
        currentContent = resume;
      } else {
        // Try localStorage
        const storedResume = localStorage.getItem("resume");
        if (
          storedResume &&
          storedResume.length > 100 &&
          !storedResume.startsWith("%PDF")
        ) {
          console.log("Using original resume from localStorage for rendering");
          currentContent = storedResume;

          // Update state if not already updating
          if (!isOptimizing) {
            setTimeout(() => {
              setResume(storedResume);
            }, 0);
          }
        } else {
          // Last resort - try extracted text
          const extractedResumeText = localStorage.getItem(
            "extractedResumeText"
          );
          if (extractedResumeText && extractedResumeText.length > 100) {
            console.log("Using extracted resume text for rendering");
            currentContent = extractedResumeText;

            // Update state
            if (!isOptimizing) {
              setTimeout(() => {
                setResume(extractedResumeText);
              }, 0);
            }
          } else {
            console.log("No valid content available for rendering");
            currentContent = "";
          }
        }
      }
    }

    console.log(
      `Rendering document for ${activeResumeTab} tab. Content source: ${contentSource}`
    );
    console.log(
      `Content length: ${
        currentContent?.length || 0
      }, Edit mode: ${isEditMode}, Type: ${typeof currentContent}`
    );

    if (activeResumeTab === "optimized") {
      console.log("optimizedResume state:", {
        length: optimizedResume?.length || 0,
        type: typeof optimizedResume,
        isEmpty: !optimizedResume,
        firstFewChars: optimizedResume?.substring(0, 30) || "N/A",
      });

      // Check localStorage for optimized resume
      const storedOptimizedResume = localStorage.getItem("optimizedResume");
      console.log("localStorage optimizedResume:", {
        length: storedOptimizedResume?.length || 0,
        firstFewChars: storedOptimizedResume?.substring(0, 30) || "N/A",
      });
    }

    // Display loading state when optimizing
    if (activeResumeTab === "optimized" && isOptimizing) {
      return (
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
      );
    }

    // If in edit mode, show the text editor
    if (isEditMode) {
      return (
        <div className="h-full">
          <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-4 min-h-[800px] max-h-[800px]">
            <textarea
              value={editableContent}
              onChange={handleContentChange}
              className="w-full h-full p-4 text-gray-800 font-mono text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              style={{ minHeight: "760px", resize: "none" }}
              placeholder="Your resume content here..."
            />
          </div>
        </div>
      );
    }

    // Check if content is invalid or missing
    if (!currentContent || currentContent.length < 10) {
      return (
        <div className="h-full">
          <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-8 min-h-[800px] max-h-[800px] overflow-y-auto">
            <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md border border-yellow-200 mb-4">
              <h3 className="font-bold mb-2">No Resume Content Available</h3>
              <p className="mb-2">
                There appears to be no resume content to display.
              </p>
              <p className="mb-2">
                Please click the "Edit Resume" button to create your resume.
              </p>
            </div>
            <div className="p-6 text-center">
              <button
                onClick={toggleEditMode}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium"
              >
                Create Resume Now
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Handle PDF content
    if (currentContent.startsWith("%PDF")) {
      console.log(
        "WARNING: Still displaying raw PDF data. This should not happen."
      );
      return (
        <div className="h-full">
          <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-8 min-h-[800px] max-h-[800px] overflow-y-auto">
            <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md border border-yellow-200 mb-4">
              <h3 className="font-bold mb-2">PDF Content Detected</h3>
              <p className="mb-2">
                Your resume appears to be in PDF format, which is difficult to
                display properly.
              </p>
              <p className="mb-2">
                Please click the "Edit Resume" button to edit your resume
                content.
              </p>
            </div>
            <div className="p-6 text-center">
              <button
                onClick={toggleEditMode}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium"
              >
                Edit Resume Now
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Simple plain text display, no HTML formatting
    return (
      <div className="h-full">
        <div
          className="bg-white rounded-lg border border-gray-200 shadow-lg p-8 min-h-[800px] max-h-[800px] overflow-y-auto"
          style={{ fontFamily: "monospace" }}
        >
          <div className="whitespace-pre-wrap text-gray-800">
            {currentContent}
          </div>
        </div>
      </div>
    );
  };

  // Main JSX return
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Header />

      <main className="pt-20 pb-16 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900">
            Your Results
          </h2>
          <p className="mt-2 text-lg text-gray-600 max-w-2xl mx-auto">
            Review the analysis of your resume and get an optimized version
            tailored to the job description.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md max-w-3xl mx-auto">
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

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Analysis Results */}
          <div className="lg:w-5/12 space-y-6">
            {/* ATS Score Card */}
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

                <div className="mt-8 flex justify-center">
                  <Button
                    onClick={handleGetNewScore}
                    isLoading={isOptimizing}
                    size="lg"
                    className="font-bold shadow-md"
                    variant="primary"
                  >
                    {isOptimizing ? "Analyzing..." : "Get New Score"}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Strengths and Weaknesses */}
            <div className="grid grid-cols-1 gap-6">
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

            {/* Keywords */}
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

            {/* Improvement Suggestions (if space allows) */}
            <Card
              title="Improvement Suggestions"
              description="Specific ways to improve your resume"
              variant="primary"
            >
              <ul className="list-disc pl-6 space-y-4">
                {analysisResult.improvement_suggestions.map(
                  (suggestion, index) => (
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
                  )
                )}
              </ul>
            </Card>
          </div>

          {/* Right Column - Resume Document */}
          <div className="lg:w-7/12 space-y-4">
            {/* Resume Tabs */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="text-lg font-semibold text-gray-800">
                  Resume Document
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={toggleEditMode}
                    variant="outline"
                    size="sm"
                    className="font-medium"
                    aria-label="Edit Resume"
                  >
                    {isEditMode ? "Save Changes" : "Edit Resume"}
                  </Button>
                  <Button
                    onClick={handleCopyToClipboard}
                    variant="outline"
                    size="sm"
                    className="font-medium"
                    disabled={isEditMode}
                  >
                    {copySuccess ? (
                      <span className="flex items-center">
                        <svg
                          className="mr-1 h-4 w-4"
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
                      "Copy Text"
                    )}
                  </Button>
                  <Button
                    onClick={handleDownloadPDF}
                    variant="outline"
                    size="sm"
                    className="font-medium"
                    isLoading={isDownloading}
                    disabled={isEditMode}
                  >
                    {downloadSuccess ? "Downloaded!" : "Download PDF"}
                  </Button>
                </div>
              </div>

              <div className="mb-4">
                <nav className="flex space-x-2">
                  <button
                    onClick={() => handleTabSwitch("original")}
                    className={`px-4 py-2 rounded-lg transition font-medium text-sm cursor-pointer ${
                      activeResumeTab === "original"
                        ? "bg-primary-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Original Resume
                  </button>

                  <button
                    onClick={() => handleTabSwitch("optimized")}
                    className={`px-4 py-2 rounded-lg transition font-medium text-sm cursor-pointer ${
                      activeResumeTab === "optimized"
                        ? "bg-primary-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Optimized Resume
                  </button>
                </nav>
              </div>

              {/* Document Viewer */}
              {renderResumeDocument()}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-8 mt-8">
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
