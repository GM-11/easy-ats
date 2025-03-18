import { NextRequest, NextResponse } from "next/server";
import { generateOptimizedResume } from "@/lib/langchain";
import { extractPDFText, extractOriginalResumeInfo } from "@/lib/pdfUtils";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const jobDescription = formData.get("jobDescription") as string;
    const skills = (formData.get("skills") as string) || "";

    let resume = "";
    let extractedText = "";

    // Check if resume is provided as text
    const resumeText = formData.get("resume");
    if (resumeText && typeof resumeText === "string") {
      // Check if the resume text is a PDF
      if (resumeText.startsWith("%PDF")) {
        console.log("Received resume text that is actually PDF data");

        try {
          // Convert string to Buffer for PDF extraction
          const buffer = Buffer.from(resumeText);

          // Extract text from the PDF data using buffer
          extractedText = await extractPDFText(buffer);

          if (extractedText && extractedText.length > 100) {
            console.log(
              `Successfully extracted text from PDF data (${extractedText.length} chars)`
            );
            resume = extractedText;
          } else {
            console.log(
              "Failed to extract sufficient text from PDF data, using original"
            );
            resume = resumeText;
          }
        } catch (error) {
          console.error("Error extracting text from PDF data:", error);
          resume = resumeText;
        }
      } else {
        // Not PDF data, use as-is
        console.log("Using provided resume text, length:", resumeText.length);
        resume = resumeText;
      }
    }

    // If we still don't have resume text, check for resume file
    if (!resume.trim()) {
      const resumeFile = formData.get("resumeFile") as File | null;
      if (resumeFile) {
        // Get file type
        const fileType = resumeFile.type;
        console.log("Resume file type:", fileType);

        // Use PDF extraction for PDF files
        if (fileType === "application/pdf") {
          console.log("PDF file detected, sending to extraction API");
          try {
            // Call the dedicated PDF extraction API
            const extractionFormData = new FormData();
            extractionFormData.append("pdfFile", resumeFile);

            console.log(
              `Sending PDF file to extraction API, size: ${resumeFile.size} bytes`
            );

            const extractionResponse = await fetch(
              new URL("/api/extract-pdf", request.url).toString(),
              {
                method: "POST",
                body: extractionFormData,
              }
            );

            console.log(
              `PDF extraction API response status: ${extractionResponse.status}`
            );

            if (extractionResponse.ok) {
              const extractionData = await extractionResponse.json();
              console.log(
                "PDF extraction API response keys:",
                Object.keys(extractionData)
              );

              if (extractionData.success && extractionData.extractedText) {
                console.log(
                  `Successfully extracted ${extractionData.extractedText.length} characters from PDF`
                );

                // If the extracted text is too short, it might be invalid
                if (extractionData.extractedText.length < 100) {
                  console.warn(
                    "Extracted text is suspiciously short, may not be valid PDF content"
                  );
                  console.log(
                    "First 100 chars:",
                    extractionData.extractedText.substring(0, 100)
                  );

                  // Fall back to regular text extraction
                  console.log("Falling back to regular text extraction");
                  resume = await resumeFile.text();
                  console.log(
                    `Regular text extraction result length: ${resume.length}`
                  );
                } else {
                  extractedText = extractionData.extractedText;
                  resume = extractedText;
                  console.log("Using extracted PDF text for optimization");
                }
              } else {
                console.log(
                  "PDF extraction API returned unsuccessfully, falling back to regular text extraction"
                );
                resume = await resumeFile.text();
                console.log(
                  `Regular text extraction result length: ${resume.length}`
                );
              }
            } else {
              console.log(
                "PDF extraction API call failed, falling back to regular text extraction"
              );
              resume = await resumeFile.text();
              console.log(
                `Regular text extraction result length: ${resume.length}`
              );
            }
          } catch (error) {
            console.error("Error extracting PDF text:", error);
            console.log("Falling back to regular text extraction");
            resume = await resumeFile.text();
            console.log(
              `Regular text extraction result length: ${resume.length}`
            );
          }
        } else {
          // For non-PDF files, just use text extraction
          console.log("Non-PDF file, using regular text extraction");
          resume = await resumeFile.text();
          console.log(
            `Regular text extraction result length: ${resume.length}`
          );
        }
      }
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
      resume = `Please edit the following resume and make it optimzed for ATS for the following job description:
    Job Description: ${jobDescription}
    Skills: ${
      skills || "general professional skills required by the Job Description"
    }
    Here is the resume you need to edit: ${resume}
  `;
    } else {
      console.log(
        "Using provided resume text for optimization, length:",
        resume.length
      );
    }

    // Extract user information from original resume
    const userInfo = extractOriginalResumeInfo(resume);

    console.log("Extracted User Info:", JSON.stringify(userInfo));

    // Verify we actually have sufficient resume content to optimize
    if (resume.trim().length < 100) {
      console.warn(`Resume content is too short: ${resume.length} chars`);
      // We'll still proceed since we have the fallback template above
    }

    // Generate optimized resume using LangChain and Groq
    console.log("Starting resume optimization process...");
    const optimizedResume = await generateOptimizedResume(
      jobDescription,
      resume,
      skills,
      userInfo
    );

    console.log("Optimization complete, returning result");

    // Include the extracted text in the response if we extracted it
    if (extractedText) {
      return NextResponse.json({
        optimizedResume,
        userInfo,
        extractedText,
      });
    }

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
