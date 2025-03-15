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

/**
 * Extracts personal information and key sections from the resume text
 * @param resumeText The optimized resume text
 * @returns Object containing extracted name, email, phone, education, and experience
 */
export const extractResumeInfo = (resumeText: string): ExtractedResumeInfo => {
  // Initialize with default values
  const result: ExtractedResumeInfo = {
    name: "Your Name",
    email: "email@example.com",
    phone: "(123) 456-7890",
    education: [],
    experience: [],
  };

  // Split the resume into lines for processing
  const lines = resumeText
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
  const emailMatch = resumeText.match(emailRegex);
  if (emailMatch) {
    result.email = emailMatch[0];
  }

  // Extract phone number - look for common phone formats
  const phoneRegex = /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const phoneMatch = resumeText.match(phoneRegex);
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
    // Extract information from the resume text
    const extractedInfo = extractResumeInfo(resumeInput);

    // Create resume data structure with extracted information
    resumeData = {
      content: resumeInput,
      metadata: {
        name: extractedInfo.name,
        email: extractedInfo.email,
        phone: extractedInfo.phone,
        generatedDate: new Date().toISOString(),
      },
    };
  } else {
    // Input is already a ResumeData object
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
