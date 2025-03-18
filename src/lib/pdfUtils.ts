import { jsPDF } from "jspdf";

interface ResumeMetadata {
  name: string;
  email: string;
  phone: string;
  generatedDate: string;
}

interface ResumeData {
  content: string;
  metadata: ResumeMetadata;
}

interface ExtractedResumeInfo {
  name: string;
  email: string;
  phone: string;
  education: string[];
  experience: string[];
}

// Helper function to clean HTML content
const stripHtml = (html: string): string => {
  // If the content is a PDF file, try to extract text
  if (html && html.trim().startsWith("%PDF")) {
    // Try to extract text content from PDF data by looking for text in parentheses
    // This is a simple approach that works for some PDFs
    const textMatches = html.match(/\(([^)]+)\)/g) || [];

    if (textMatches.length > 0) {
      // Extract text from PDF content by removing parentheses and cleaning up
      const extractedText = textMatches
        .map((match) => match.substring(1, match.length - 1))
        .filter((text) => text.trim().length > 1) // Filter out single characters
        .join("\n");

      // If we found substantial text, use it
      if (extractedText.length > 100) {
        console.log(
          "Extracted text from PDF content:",
          extractedText.substring(0, 100) + "..."
        );
        return extractedText;
      }
    }

    // If extraction failed, return a placeholder
    return "Resume content could not be extracted from PDF. Please provide a text version.";
  }

  // For HTML content, use the standard approach
  if (html && html.startsWith("<")) {
    // Create a temporary div element
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    // Extract the text content without HTML tags
    return tempDiv.textContent || tempDiv.innerText || "";
  }

  // If not HTML or PDF, return as is
  return html;
};

/**
 * Extracts personal information and key sections from the resume text
 * @param resumeText The optimized resume text
 * @returns Object containing extracted name, email, phone, education, and experience
 */
export const extractResumeInfo = (resumeText: string): ExtractedResumeInfo => {
  // Check if input is HTML content and convert to plain text if needed
  const cleanedText = resumeText.startsWith("<")
    ? stripHtml(resumeText)
    : resumeText;

  // If the content is a PDF file, use default values
  if (cleanedText.trim().startsWith("%PDF")) {
    return {
      name: "Your Name",
      email: "email@example.com",
      phone: "(123) 456-7890",
      education: [],
      experience: [],
    };
  }

  // Initialize with default values
  const result: ExtractedResumeInfo = {
    name: "Your Name",
    email: "email@example.com",
    phone: "(123) 456-7890",
    education: [],
    experience: [],
  };

  // Split the resume into lines for processing
  const lines = cleanedText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line);

  // Extract name - usually one of the first few lines that doesn't look like a section header or contact info
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    // Avoid lines that look like email, phone, section headers, etc.
    if (
      line &&
      !line.includes("@") &&
      !line.match(/^\d/) &&
      !line.match(/^(EDUCATION|EXPERIENCE|SKILLS|PROFILE)/i) &&
      !line.match(/^(http|www)/) &&
      line.length > 2 &&
      line.split(" ").length <= 5
    ) {
      result.name = line;
      break;
    }
  }

  // Extract email - look for standard email pattern
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const emailMatch = cleanedText.match(emailRegex);
  if (emailMatch) {
    result.email = emailMatch[0];
  }

  // Extract phone number - look for common phone formats
  const phoneRegex = /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const phoneMatch = cleanedText.match(phoneRegex);
  if (phoneMatch) {
    result.phone = phoneMatch[0];
  }

  // Extract education section
  let currentSection = "";
  let educationSection = false;
  let experienceSection = false;

  for (const line of lines) {
    // Check for section headers
    if (line.toUpperCase() === line && line.trim() !== "") {
      currentSection = line.toUpperCase();
      educationSection = currentSection.includes("EDUCATION");
      experienceSection =
        currentSection.includes("EXPERIENCE") ||
        currentSection.includes("EMPLOYMENT") ||
        currentSection.includes("WORK HISTORY");
      continue;
    }

    // Collect lines in relevant sections
    if (educationSection && line) {
      result.education.push(line);
    } else if (experienceSection && line) {
      result.experience.push(line);
    }
  }

  return result;
};

/**
 * Generates a properly formatted PDF resume
 *
 * @param resumeInput Either the optimized resume text as a string or a ResumeData object
 * @returns A Blob containing the PDF file
 */
export const generateResumePDF = (resumeInput: string | ResumeData): Blob => {
  // Determine if input is string or ResumeData
  let resumeData: ResumeData;

  if (typeof resumeInput === "string") {
    // Check if the content is HTML and extract text if needed
    const cleanedContent = resumeInput.startsWith("<")
      ? stripHtml(resumeInput)
      : resumeInput;

    // Check if the content is a PDF file
    if (cleanedContent.trim().startsWith("%PDF")) {
      // If it's already a PDF file, try to convert it to a Blob and return
      try {
        return new Blob([cleanedContent], { type: "application/pdf" });
      } catch (e) {
        console.error("Failed to convert PDF content to blob:", e);
        // Fall back to generating a simple PDF with error message
        resumeData = {
          content:
            "Error: Unable to process the PDF content. Please try uploading a text version of your resume.",
          metadata: {
            name: "Resume",
            email: "",
            phone: "",
            generatedDate: new Date().toISOString(),
          },
        };
      }
    } else {
      // Extract information from the resume text
      const extractedInfo = extractResumeInfo(cleanedContent);

      // Create resume data structure with extracted information
      resumeData = {
        content: cleanedContent,
        metadata: {
          name: extractedInfo.name,
          email: extractedInfo.email,
          phone: extractedInfo.phone,
          generatedDate: new Date().toISOString(),
        },
      };
    }
  } else {
    // Input is already a ResumeData object
    // Check if content is HTML and clean it if needed
    if (resumeInput.content.startsWith("<")) {
      resumeInput.content = stripHtml(resumeInput.content);
    }

    // If the content is a PDF file, replace with an error message
    if (resumeInput.content.trim().startsWith("%PDF")) {
      resumeInput.content =
        "Error: Unable to process the PDF content. Please try uploading a text version of your resume.";
    }

    resumeData = resumeInput;
  }

  const { content, metadata } = resumeData;

  // Create a new PDF document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Set up document properties
  doc.setProperties({
    title: `${metadata.name} - Resume`,
    subject: "Professional Resume",
    creator: "Easy ATS Resume Builder",
    author: metadata.name,
  });

  // Define page dimensions and margins
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20; // Margin in mm
  const contentWidth = pageWidth - margin * 2;

  // Add styling
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");

  // Add header with name
  doc.text(metadata.name, pageWidth / 2, margin, { align: "center" });

  // Add contact information
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const contactY = margin + 7;
  doc.text(metadata.email, pageWidth / 2, contactY, { align: "center" });
  doc.text(metadata.phone, pageWidth / 2, contactY + 5, { align: "center" });

  // Add a horizontal line
  doc.setLineWidth(0.5);
  doc.line(margin, contactY + 10, pageWidth - margin, contactY + 10);

  // Process content and add it to the document
  doc.setFontSize(10);

  // Helper function to split and format sections
  const formatResumeContent = (content: string): string[] => {
    // Clean up the content - remove excessive line breaks and fix spacing
    const processedContent = content.replace(/\n{3,}/g, "\n\n");
    return processedContent.split("\n");
  };

  // Format the text
  const lines = formatResumeContent(content);

  // Start position for content
  let y = contactY + 20;

  // Add content line by line
  for (const line of lines) {
    // Detect headers and apply bold formatting
    if (line.toUpperCase() === line && line.trim() !== "") {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);

      // Add some spacing before sections
      y += 5;
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
    }

    // Check if we need to add a new page
    if (y > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }

    // Split long lines to fit within the content width
    const textLines = doc.splitTextToSize(line, contentWidth);

    // Add each line to the document
    for (const textLine of textLines) {
      doc.text(textLine, margin, y);
      y += 5; // Line spacing
    }

    // Add small spacing between paragraphs
    if (line.trim() === "") {
      y += 2;
    }
  }

  // Add footer with generation date
  const footerText = `Generated on ${new Date(
    metadata.generatedDate
  ).toLocaleDateString()}`;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100); // Light gray
  doc.text(
    footerText,
    pageWidth - margin,
    doc.internal.pageSize.getHeight() - 10,
    { align: "right" }
  );

  // Output as blob
  return doc.output("blob");
};

/**
 * Downloads a generated PDF with a specified filename
 *
 * @param pdfBlob The PDF file as a Blob
 * @param filename The filename to download the PDF as
 */
export const downloadPDF = (
  pdfBlob: Blob,
  filename: string = "resume.pdf"
): void => {
  // Create a URL for the blob
  const blobUrl = URL.createObjectURL(pdfBlob);

  // Create a link element and trigger download
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  // Clean up
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
};

// Add a new function to extract information from the original resume
/**
 * Extracts personal information from the original resume text for
 * optimization purposes
 * @param originalResumeText The original resume text submitted by the user
 * @returns Object containing extracted user information
 */
export const extractOriginalResumeInfo = (
  originalResumeText: string
): ExtractedResumeInfo => {
  // Initialize with default values
  const result: ExtractedResumeInfo = {
    name: "",
    email: "",
    phone: "",
    education: [],
    experience: [],
  };

  // Split the resume into lines for processing
  const lines = originalResumeText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line);

  // Extract name - usually one of the first few lines that doesn't look like a section header or contact info
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i];
    // Avoid lines that look like email, phone, section headers, etc.
    if (
      line &&
      !line.includes("@") &&
      !line.match(/^\d/) &&
      !line.match(
        /^(EDUCATION|EXPERIENCE|SKILLS|PROFILE|OBJECTIVE|SUMMARY)/i
      ) &&
      !line.match(/^(http|www)/) &&
      line.length > 2 &&
      line.split(" ").filter((word) => word.length > 0).length <= 5
    ) {
      result.name = line;
      break;
    }
  }

  // Extract email - look for standard email pattern
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const emailMatch = originalResumeText.match(emailRegex);
  if (emailMatch) {
    result.email = emailMatch[0];
  }

  // Extract phone number - look for common phone formats
  const phoneRegex = /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const phoneMatch = originalResumeText.match(phoneRegex);
  if (phoneMatch) {
    result.phone = phoneMatch[0];
  }

  // Extract education and experience sections
  let currentSection = "";
  let educationSection = false;
  let experienceSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for section headers (using a more flexible detection approach)
    if (
      (line.toUpperCase() === line && line.trim() !== "") ||
      line.match(/^(EDUCATION|EXPERIENCE|EMPLOYMENT|WORK HISTORY)/i)
    ) {
      currentSection = line.toUpperCase();
      educationSection = currentSection.includes("EDUCATION");
      experienceSection =
        currentSection.includes("EXPERIENCE") ||
        currentSection.includes("EMPLOYMENT") ||
        currentSection.includes("WORK HISTORY");
      continue;
    }

    // Collect lines in relevant sections (up to 5 lines for each section)
    if (educationSection && line && result.education.length < 10) {
      result.education.push(line);
    } else if (experienceSection && line && result.experience.length < 15) {
      result.experience.push(line);
    }
  }

  return result;
};

/**
 * Enhanced method to extract text from a PDF by calling the server-side API endpoint
 * @param pdfFile File or Buffer or ArrayBuffer containing PDF data
 * @returns Extracted text content or empty string if extraction fails
 */
export const extractPDFText = async (
  pdfFile: File | Buffer | ArrayBuffer
): Promise<string> => {
  try {
    console.log("Extracting text using server-side API");

    // Create form data to send to the API
    const formData = new FormData();

    // If pdfFile is already a File, use it directly
    if (pdfFile instanceof File) {
      console.log(
        `PDF file size: ${pdfFile.size} bytes, type: ${pdfFile.type}`
      );
      formData.append("pdfFile", pdfFile);
    }
    // If pdfFile is a Buffer or ArrayBuffer, convert to File
    else {
      const buffer =
        pdfFile instanceof Buffer
          ? pdfFile
          : Buffer.from(new Uint8Array(pdfFile as ArrayBuffer));

      console.log(`PDF buffer size: ${buffer.length} bytes`);

      // Check if this is a valid PDF by looking for the PDF signature
      const isPDF =
        buffer.length > 4 && buffer.toString("utf8", 0, 4) === "%PDF";
      if (!isPDF) {
        console.warn(
          "Input does not appear to be a valid PDF (missing %PDF signature)"
        );
        return "";
      }

      // Create a File object from the buffer
      const blob = new Blob([buffer], { type: "application/pdf" });
      console.log(`Created blob with size: ${blob.size} bytes`);
      formData.append("pdfFile", blob, "document.pdf");
    }

    // Log that we're about to make the API call
    console.log("Sending PDF to extraction API...");

    // Call the server-side API
    const response = await fetch("/api/extract-pdf", {
      method: "POST",
      body: formData,
    });

    console.log(`API response status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("PDF extraction API error:", errorData);
      return "";
    }

    const data = await response.json();

    // Log the response structure to help debug
    console.log("API response structure:", Object.keys(data));

    if (!data.success || !data.extractedText) {
      console.error("PDF extraction failed:", data);
      return "";
    }

    const extractedText = data.extractedText;
    console.log(
      `Successfully extracted ${extractedText.length} characters from PDF`
    );

    // Return empty string if the extracted text is too short (likely failed extraction)
    if (extractedText.length < 50) {
      console.warn("Extracted text is suspiciously short, might be invalid");
      return "";
    }

    return extractedText;
  } catch (error) {
    console.error("Error in PDF text extraction:", error);
    return "";
  }
};
