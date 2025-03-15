import { NextRequest, NextResponse } from "next/server";
import { generateOptimizedResume } from "@/lib/langchain";

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

    // If no resume is provided, we'll generate one from scratch based on the job description
    if (!resume.trim()) {
      resume = `Please create a professional resume based on the following skills: ${
        skills || "general professional skills"
      }`;
    }

    // Generate optimized resume using LangChain and Groq

    const optimizedResume = await generateOptimizedResume(
      jobDescription,
      resume,
      skills
    );

    return NextResponse.json({ optimizedResume });
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
