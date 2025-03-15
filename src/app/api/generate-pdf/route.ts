import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const {
      resumeText,
      name = "Your Name",
      email = "email@example.com",
      phone = "(123) 456-7890",
    } = await request.json();

    if (!resumeText) {
      return NextResponse.json(
        { error: "Resume text is required" },
        { status: 400 }
      );
    }

    // Return the resume content that will be used to generate PDF on the client-side
    // We send structured data that will be formatted on the client
    return NextResponse.json({
      success: true,
      resumeData: {
        content: resumeText,
        metadata: {
          name,
          email,
          phone,
          generatedDate: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Error in generate-pdf API:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
