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
      <div className="space-y-6">
        <div className="space-y-2">
          <label
            htmlFor="jobDescription"
            className="block text-sm font-medium text-gray-700"
          >
            Job Description <span className="text-red-500">*</span>
          </label>
          <Textarea
            id="jobDescription"
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={6}
            required
            className="transition-shadow focus:shadow-highlight"
          />
          <p className="text-xs text-gray-500">
            Copy and paste the complete job description from the posting.
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="skills"
            className="block text-sm font-medium text-gray-700"
          >
            Your Skills <span className="text-gray-400">(optional)</span>
          </label>
          <Textarea
            id="skills"
            placeholder="Enter your skills, separated by commas..."
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            rows={3}
            className="transition-shadow focus:shadow-highlight"
          />
          <p className="text-xs text-gray-500">
            List skills that you believe are relevant to this position.
          </p>
        </div>

        <div className="pt-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Resume <span className="text-gray-400">(optional)</span>
          </label>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-6">
            <FileUpload
              accept=".pdf,.doc,.docx"
              helperText="Upload a PDF or Word document (max 5MB)"
              onFileChange={handleFileChange}
              className="bg-white"
            />

            {!resumeFile && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-gray-50 px-3 text-sm text-gray-500">
                      OR
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Textarea
                    placeholder="Paste your resume text here..."
                    value={resume}
                    onChange={(e) => setResume(e.target.value)}
                    rows={8}
                    className="bg-white transition-shadow focus:shadow-highlight"
                  />
                  <p className="text-xs text-gray-500">
                    Plain text format works best for ATS systems.
                  </p>
                </div>
              </>
            )}

            {resumeFile && (
              <div className="mt-2 flex items-center justify-between bg-blue-50 p-2 rounded-lg border border-blue-100">
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 text-blue-600 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-blue-700">
                    {resumeFile.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleFileChange(null)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex">
        <Button
          type="submit"
          isLoading={isAnalyzing}
          size="xl"
          className="w-full sm:w-auto mx-auto font-bold shadow-lg"
          rightIcon={
            !isAnalyzing ? (
              <svg
                className="h-5 w-5"
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
            ) : undefined
          }
        >
          {isAnalyzing ? "Analyzing..." : "Analyze My Resume"}
        </Button>
      </div>
    </form>
  );
};
