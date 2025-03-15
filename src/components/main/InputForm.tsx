import { FormEvent } from "react";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { FileUpload } from "@/components/ui/FileUpload";

interface InputFormProps {
  jobDescription: string;
  setJobDescription: (value: string) => void;
  resume: string;
  setResume: (value: string) => void;
  resumeFile: File | null;
  handleFileChange: (file: File | null) => void;
  skills: string;
  setSkills: (value: string) => void;
  isAnalyzing: boolean;
  handleAnalyzeResume: (e: FormEvent) => Promise<void>;
}

export const InputForm: React.FC<InputFormProps> = ({
  jobDescription,
  setJobDescription,
  resume,
  setResume,
  resumeFile,
  handleFileChange,
  skills,
  setSkills,
  isAnalyzing,
  handleAnalyzeResume,
}) => {
  return (
    <form onSubmit={handleAnalyzeResume} className="space-y-8">
      <Card
        title="Job Description"
        description="Enter the job description you're applying for"
      >
        <Textarea
          label="Job Description"
          placeholder="Paste the job description here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={8}
          required
        />
      </Card>

      <Card title="Your Skills" description="List your skills (optional)">
        <Textarea
          label="Skills"
          placeholder="Enter your skills, separated by commas..."
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          rows={4}
        />
      </Card>

      <Card
        title="Your Resume"
        description="Upload your resume or enter it as text (optional)"
      >
        <div className="space-y-6">
          <FileUpload
            label="Upload Resume"
            accept=".pdf,.doc,.docx"
            helperText="Upload a PDF or Word document (max 5MB)"
            onFileChange={handleFileChange}
          />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-gray-600 text-sm">OR</span>
            </div>
          </div>

          <Textarea
            label="Resume Text"
            placeholder="Paste your resume text here..."
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            rows={12}
            disabled={!!resumeFile}
            helperText={
              resumeFile
                ? "Resume file uploaded. Clear file to use text input."
                : ""
            }
          />
        </div>
      </Card>

      <div className="flex space-x-4">
        <Button
          type="submit"
          isLoading={isAnalyzing}
          size="lg"
          className="font-bold text-lg py-4 px-8 mx-auto mt-6 min-w-48 flex items-center justify-center shadow-lg"
          variant="primary"
        >
          {isAnalyzing ? "Analyzing..." : "Analyze Resume"}
          {!isAnalyzing && (
            <svg
              className="ml-2 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          )}
        </Button>
      </div>
    </form>
  );
};
