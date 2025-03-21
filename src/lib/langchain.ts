import { ChatGroq } from "@langchain/groq";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

// Initialize the Groq model
export const getGroqModel = () => {
  const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_GROQ_API_KEY environment variable is not set");
  }

  return new ChatGroq({
    apiKey,
    modelName: "llama3-70b-8192",
  });
};

// Helper function to truncate text to stay within token limits
// A rough estimate is that 1 token ≈ 4 characters for English text
const truncateText = (text: string, maxLength: number = 4000): string => {
  if (!text || text.length <= maxLength) return text;

  return (
    text.substring(0, maxLength) +
    "\n\n[Content truncated due to length limits. The analysis is based on the above portion of the text.]"
  );
};

// Prompt template for ATS score analysis
export const createAtsScoreTemplate = () => {
  const templateInstructions = `
You are an expert ATS (Applicant Tracking System) analyzer and resume improvement specialist.
Your task is to analyze a resume against a job description and provide an ATS compatibility score and detailed feedback.

JOB DESCRIPTION:
{jobDescription}

RESUME:
{resume}

CANDIDATE SKILLS:
{skills}

Analyze how well the resume matches the job description, considering the following factors:
1. Presence of relevant keywords from the job description
2. Match between candidate's skills/experience and job requirements
3. Resume clarity, organization, and professional presentation
4. Quantifiable achievements relevant to the position
5. Proper use of industry-specific terminology

Your response must be a valid JSON object with exactly these fields:
- score: a number between 0-100 representing ATS compatibility
- strengths: an array of strings listing resume strengths
- weaknesses: an array of strings listing resume weaknesses
- keywords: an array of strings with important keywords from the job description
- improvement_suggestions: an array of strings with specific improvement suggestions

Example format (replace with actual content):
{{"score": 75, "strengths": ["Good match for technical skills", "Relevant experience"], "weaknesses": ["Missing key keywords", "No quantifiable achievements"], "keywords": ["JavaScript", "React", "Node.js"], "improvement_suggestions": ["Add more industry keywords", "Quantify achievements"]}}
`;

  return PromptTemplate.fromTemplate(templateInstructions);
};

// Modify the prompt template to include extracted user data
export const createResumeOptimizationTemplate = () => {
  const templateInstructions = `
You are an expert resume writer specializing in optimizing resumes for ATS systems while maintaining integrity and professionalism.
Your task is to rewrite and optimize the provided resume to better match the job description without fabricating experience or qualifications.

=========== JOB DESCRIPTION ===========
{jobDescription}
=======================================

=========== CURRENT RESUME ===========
{resume}
======================================

=========== CANDIDATE SKILLS ===========
{skills}
========================================

=========== EXTRACTED USER INFORMATION ===========
Name: {userName}
Email: {userEmail}
Phone: {userPhone}

Education:
{userEducation}

Experience Highlights:
{userExperience}
==================================================

IMPORTANT: Carefully analyze the above information to create an ATS-optimized resume.

Please create an optimized version of the resume that:
1. Incorporates relevant keywords from the job description
2. Highlights the most relevant experience and skills for this specific position
3. Uses industry-standard formatting and organization
4. Quantifies achievements where possible
5. Maintains the same basic work history and education but optimizes the presentation
6. Uses concise, powerful action verbs and language that will pass through ATS systems
7. IMPORTANT: ALWAYS includes the user's actual contact information (name, email, phone) at the top of the resume
8. IMPORTANT: Maintains the user's actual education credentials and work experience without fabrication
9. IMPORTANT: Focuses on the user's most relevant experience that matches the job description

DO NOT make up accomplishments, previous job positions, or educational credentials.
DO NOT change job titles, company names, dates, or other factual information.
DO USE keywords from the job description and optimize the language of real experiences.

Format the resume professionally, maintaining clear sections for:
- Header (Name and Contact Information)
- Summary/Professional Profile (tailored to this specific job)
- Skills (prioritizing those most relevant to the job description)
- Experience (emphasizing achievements and responsibilities most relevant to the position)
- Education
- Any certifications or other relevant sections from the original resume

The optimized resume should be in a clean, ATS-friendly format.
Do not use tables, columns, images, or other formatting that could confuse ATS systems.
Use bullet points for better readability.

Your optimized resume output should be properly formatted and ready for the user to copy and use immediately. Please do not give any other text other than the resume text, not even text like "here is your resume" or anything like that.
`;

  return PromptTemplate.fromTemplate(templateInstructions);
};

// Function to analyze resume and generate ATS score
export async function analyzeResume(
  jobDescription: string,
  resume: string,
  skills: string
) {
  try {
    // Truncate inputs to stay within token limits
    // Prioritize the resume over the job description
    const truncatedResume = truncateText(resume, 4000);
    const truncatedJobDescription = truncateText(jobDescription, 3000);
    const truncatedSkills = truncateText(skills, 500);

    const model = getGroqModel();
    const template = createAtsScoreTemplate();

    const prompt = await template.format({
      jobDescription: truncatedJobDescription,
      resume: truncatedResume,
      skills: truncatedSkills,
    });

    const response = await model.invoke(prompt);
    const responseText =
      typeof response.content === "string"
        ? response.content
        : JSON.stringify(response.content);

    // Try to parse the JSON response
    try {
      // Look for JSON in the response - it might be in a code block or mixed with text
      const jsonMatch =
        responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) ||
        responseText.match(/({[\s\S]*})/);

      let jsonText = responseText;
      if (jsonMatch && jsonMatch[1]) {
        jsonText = jsonMatch[1].trim();
      }

      const parsedOutput = JSON.parse(jsonText);

      // Validate that the parsed output has the expected structure
      const requiredFields = [
        "score",
        "strengths",
        "weaknesses",
        "keywords",
        "improvement_suggestions",
      ];
      for (const field of requiredFields) {
        if (!(field in parsedOutput)) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      return parsedOutput;
    } catch (parseError: unknown) {
      console.error("Error parsing JSON response:", parseError);
      const errorMessage =
        parseError instanceof Error ? parseError.message : "Unknown error";
      throw new Error(
        "Failed to parse response from language model: " + errorMessage
      );
    }
  } catch (error) {
    console.error("Error analyzing resume:", error);
    throw error;
  }
}

// Modify the function to generate an optimized resume to accept user info
export async function generateOptimizedResume(
  jobDescription: string,
  resume: string,
  skills: string,
  userInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    education?: string[];
    experience?: string[];
  }
) {
  try {
    // Log inputs for debugging
    console.log("Starting resume optimization process");
    console.log("Job Description Length:", jobDescription.length);
    console.log("Resume Length:", resume.length);
    console.log("Skills Length:", skills.length);

    // Truncate inputs to stay within token limits
    const truncatedResume = truncateText(resume, 4000);
    const truncatedJobDescription = truncateText(jobDescription, 3000);
    const truncatedSkills = truncateText(skills, 500);

    // Set default user info if not provided
    const userName = userInfo?.name || "Not provided";
    const userEmail = userInfo?.email || "Not provided";
    const userPhone = userInfo?.phone || "Not provided";
    const userEducation = userInfo?.education?.join("\n") || "Not provided";
    const userExperience = userInfo?.experience?.join("\n") || "Not provided";

    console.log("Processed user info:", {
      nameAvailable: !!userInfo?.name,
      emailAvailable: !!userInfo?.email,
      phoneAvailable: !!userInfo?.phone,
      educationEntries: userInfo?.education?.length || 0,
      experienceEntries: userInfo?.experience?.length || 0,
    });

    const model = getGroqModel();
    console.log("Model initialized");

    const template = createResumeOptimizationTemplate();
    console.log("Template created");

    const outputParser = new StringOutputParser();

    const prompt = await template.format({
      jobDescription: truncatedJobDescription,
      resume: truncatedResume,
      skills: truncatedSkills,
      userName,
      userEmail,
      userPhone,
      userEducation,
      userExperience,
    });

    console.log("Prompt formatted, sending to model");
    console.log("Prompt first 100 chars:", prompt.substring(0, 100) + "...");
    console.log(
      "Prompt last 100 chars:",
      prompt.substring(prompt.length - 100) + "..."
    );

    const response = await model.invoke(prompt);
    console.log("Received response from model");

    const responseText =
      typeof response.content === "string"
        ? response.content
        : JSON.stringify(response.content);

    console.log("Response length:", responseText.length);
    console.log(
      "Response first 100 chars:",
      responseText.substring(0, 100) + "..."
    );

    const optimizedResume = await outputParser.parse(responseText);

    return optimizedResume;
  } catch (error) {
    console.error("Error generating optimized resume:", error);
    throw error;
  }
}
