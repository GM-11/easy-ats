import { NextRequest, NextResponse } from "next/server";
import pdfParse from "pdf-parse";

// Mark this file as server-only to ensure fs is available
export const runtime = "nodejs";

/**
 * API route for extracting text from a PDF file
 * This will run only on the server where fs is available
 */
export async function POST(request: NextRequest) {
  try {
    console.log("PDF extraction API called");
    const formData = await request.formData();
    const pdfFile = formData.get("pdfFile") as File | null;

    if (!pdfFile) {
      console.error("No PDF file provided in request");
      return NextResponse.json(
        { error: "No PDF file provided" },
        { status: 400 }
      );
    }

    console.log(
      `Received PDF file: size=${pdfFile.size}, type=${pdfFile.type}`
    );

    // Get the file data
    const fileData = await pdfFile.arrayBuffer();
    const fileBuffer = Buffer.from(fileData);

    console.log(`Converted to buffer: size=${fileBuffer.length} bytes`);

    // Verify this is a PDF
    const isPDF =
      fileBuffer.length > 4 && fileBuffer.toString("utf8", 0, 4) === "%PDF";
    if (!isPDF) {
      console.error(
        "File does not appear to be a valid PDF (missing %PDF signature)"
      );
      return NextResponse.json(
        { error: "File does not appear to be a valid PDF" },
        { status: 400 }
      );
    }

    try {
      console.log("Server-side parsing of PDF starting...");

      // Parse the PDF directly with the buffer using pdf-parse
      const data = await pdfParse(fileBuffer);

      const extractedText = data.text || "";

      // Check if we actually got any meaningful text
      if (extractedText.length < 50) {
        console.warn(
          `Extracted text suspiciously short (${extractedText.length} chars), might be invalid`
        );
        console.log("First 50 chars:", extractedText.substring(0, 50));
        // Return success but with warning
        return NextResponse.json({
          success: true,
          extractedText,
          length: extractedText.length,
          warning: "Extracted text is suspiciously short, might be invalid",
        });
      }

      console.log(
        `Successfully extracted ${extractedText.length} characters from PDF`
      );
      console.log("First 100 chars:", extractedText.substring(0, 100));

      // Return the extracted text
      return NextResponse.json({
        success: true,
        extractedText,
        length: extractedText.length,
      });
    } catch (parseError) {
      console.error("Error parsing PDF:", parseError);
      return NextResponse.json(
        {
          error: "Failed to parse PDF content",
          details:
            parseError instanceof Error ? parseError.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in PDF extraction API:", error);
    return NextResponse.json(
      {
        error: "Server error during PDF extraction",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
