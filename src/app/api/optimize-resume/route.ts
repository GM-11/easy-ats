import { NextRequest, NextResponse } from "next/server";
import { generateOptimizedResume } from "@/lib/langchain";
import { extractOriginalResumeInfo } from "@/lib/pdfUtils";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const jobDescription = formData.get("jobDescription") as string;
    const skills = (formData.get("skills") as string) || "";

    let resume = "";

    // Check if resume is provided as text
    const resumeText = formData.get("resume");
    if (resumeText && typeof resumeText === "string") {
      resume = resumeText;
    }

    // Check if resume is provided as file
    const resumeFile = formData.get("resumeFile") as File | null;
    if (resumeFile) {
      // Read the file content as text
      resume = await resumeFile.text();
    }

    if (!jobDescription) {
      return NextResponse.json(
        { error: "Job description is required" },
        { status: 400 }
      );
    }

    // Log the inputs for debugging
    console.log("Job Description:", jobDescription.substring(0, 100) + "...");
    console.log("Skills:", skills);
    console.log("Resume Length:", resume.length);

    // If resume is empty, try to get it from the original analysis data
    if (!resume.trim()) {
      console.log("WARNING: Empty resume provided to optimize-resume endpoint");

      // This is a fallback approach - check whether this request is coming from
      // a previous analysis where we should already have the resume
      const originalResume = formData.get("originalResume") as string;
      if (originalResume) {
        console.log(
          "Found originalResume in form data, length:",
          originalResume.length
        );
        resume = originalResume;
      } else {
        console.log("No originalResume found in form data");
      }
    }

    // If no resume is provided, create a basic template based on the job description
    if (!resume.trim()) {
      console.log(
        "FALLBACK: Creating template resume since no resume data was provided"
      );
      resume = `Please generate a professional resume using the following information:
    Job Description: ${jobDescription}
    Skills: ${skills || "general professional skills"}

    Please format this as a proper resume with standard sections like Summary, Experience, Education, etc.
    Use a clean, professional format suitable for ATS systems.
    Focus on highlighting skills and experience relevant to the job description.`;
    } else {
      console.log("Using provided resume, length:", resume.length);
    }

    // Extract user information from original resume
    const userInfo = extractOriginalResumeInfo(resume);

    console.log("Extracted User Info:", JSON.stringify(userInfo));

    // Generate optimized resume using LangChain and Groq
    const optimizedResume = await generateOptimizedResume(
      jobDescription,
      resume,
      skills,
      userInfo
    );

    console.log("Optimization complete, returning result");

    return NextResponse.json({ optimizedResume, userInfo });
  } catch (error) {
    console.error("Error in optimize-resume API:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to generate optimized resume: ${errorMessage}` },
      { status: 500 }
    );
  }
}
