import { NextRequest, NextResponse } from "next/server";
import { analyzeResume } from "@/lib/langchain";
import { extractPDFText } from "@/lib/pdfUtils";

export async function POST(request: NextRequest) {
  try {
    // Check content type to determine how to parse the request
    const contentType = request.headers.get("content-type") || "";

    let jobDescription = "";
    let skills = "";
    let resume = "";
    let extractedText = "";
    let usedPDFExtraction = false;

    // Handle JSON requests (added to support the results page)
    if (contentType.includes("application/json")) {
      console.log("Handling JSON request");
      try {
        const jsonData = await request.json();
        jobDescription = jsonData.jobDescription || "";
        skills = jsonData.skills || "";
        resume = jsonData.resume || "";

        console.log("JSON request data:");
        console.log("- Job description length:", jobDescription.length);
        console.log("- Skills length:", skills.length);
        console.log("- Resume length:", resume.length);
      } catch (jsonError) {
        console.error("Error parsing JSON request:", jsonError);
        return NextResponse.json(
          { error: "Invalid JSON request" },
          { status: 400 }
        );
      }
    }
    // Handle FormData requests (original implementation)
    else {
      console.log("Handling FormData request");
      const formData = await request.formData();

      jobDescription = formData.get("jobDescription") as string;
      skills = (formData.get("skills") as string) || "";

      // Check if resume is provided as text
      const resumeText = formData.get("resume");
      if (resumeText && typeof resumeText === "string") {
        console.log("Resume provided as text, length:", resumeText.length);
        resume = resumeText;
      }

      // If no resume text, check for file upload
      if (!resume) {
        // Check if resume is provided as file
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
                    usedPDFExtraction = true;
                    console.log("Using extracted PDF text for analysis");
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
    }

    // Validate required fields
    if (!jobDescription) {
      return NextResponse.json(
        { error: "Job description is required" },
        { status: 400 }
      );
    }

    // Verify we actually have resume content to analyze
    if (!resume || resume.trim().length < 100) {
      console.warn(
        `Resume content is too short (${resume?.length || 0} chars) or empty`
      );
      return NextResponse.json(
        { error: "Resume content is too short or empty" },
        { status: 400 }
      );
    }

    console.log(`Analyzing resume with length: ${resume.length} characters`);

    // Analyze the resume using LangChain and Groq
    const analysisResult = await analyzeResume(jobDescription, resume, skills);

    // Include the extracted text in the response if we used PDF extraction
    if (usedPDFExtraction && extractedText) {
      return NextResponse.json({
        ...analysisResult,
        extractedText,
      });
    }

    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error("Error in analyze-resume API:", error);
    return NextResponse.json(
      { error: "Failed to analyze resume" },
      { status: 500 }
    );
  }
}
