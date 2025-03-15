import { ChatGroq } from "@langchain/groq";
import { StructuredOutputParser } from "langchain/output_parsers";
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

// Parser for ATS score analysis
// export const atsScoreParser = StructuredOutputParser.fromZodSchema(
//     z.object({
//         score: z.number().describe('ATS score from 0-100'),
//         strengths: z
//             .array(z.string())
//             .describe('List of strengths in the resume relative to the job description'),
//         weaknesses: z
//             .array(z.string())
//             .describe('List of weaknesses or missing elements in the resume relative to the job description'),
//         keywords: z
//             .array(z.string())
//             .describe('Important keywords from the job description that should be included'),
//         improvement_suggestions: z
//             .array(z.string())
//             .describe('Specific suggestions to improve the resume for this job'),
//     })
// );

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

JOB DESCRIPTION:
{jobDescription}

CURRENT RESUME:
{resume}

CANDIDATE SKILLS:
{skills}

EXTRACTED USER INFORMATION:
Name: {userName}
Email: {userEmail}
Phone: {userPhone}
Education: {userEducation}
Experience Highlights: {userExperience}

Please create an optimized version of the resume that:
1. Incorporates relevant keywords from the job description
2. Highlights the most relevant experience and skills for this specific position
3. Uses industry-standard formatting and organization
4. Quantifies achievements where possible
5. Maintains the same basic work history and education but optimizes the presentation
6. Uses concise, powerful language that will pass through ATS systems
7. ALWAYS includes the user's actual contact information (name, email, phone) at the top of the resume
8. Maintains the user's actual education credentials without fabrication
9. Focuses on the user's most relevant experience that matches the job description

Format the resume professionally, maintaining clear sections for:
- Summary/Objective (tailored to this specific job)
- Skills (prioritizing those most relevant to the job description)
- Experience (emphasizing achievements and responsibilities most relevant to the position)
- Education
- Any other relevant sections from the original resume

The optimized resume should be in a clean, ATS-friendly format.
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
    // Truncate inputs to stay within token limits
    const truncatedResume = truncateText(resume, 4000);
    const truncatedJobDescription = truncateText(jobDescription, 3000);
    const truncatedSkills = truncateText(skills, 500);

    // Set default user info if not provided
    const userName = userInfo?.name || "";
    const userEmail = userInfo?.email || "";
    const userPhone = userInfo?.phone || "";
    const userEducation = userInfo?.education?.join("\n") || "";
    const userExperience = userInfo?.experience?.join("\n") || "";

    const model = getGroqModel();
    const template = createResumeOptimizationTemplate();
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

    const response = await model.invoke(prompt);
    const responseText =
      typeof response.content === "string"
        ? response.content
        : JSON.stringify(response.content);
    const optimizedResume = await outputParser.parse(responseText);

    return optimizedResume;
  } catch (error) {
    console.error("Error generating optimized resume:", error);
    throw error;
  }
}
