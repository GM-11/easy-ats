# Easy ATS - Resume Helper Tool

Easy ATS is a powerful tool designed to help job seekers optimize their resumes for Applicant Tracking Systems (ATS). It analyzes your resume against a specific job description, provides an ATS compatibility score, and generates an optimized version of your resume tailored to the job you're applying for.

## Features

- **Resume Analysis**: Get a detailed analysis of how well your resume matches a specific job description
- **ATS Score**: Receive a compatibility score showing how likely your resume is to pass through ATS filters
- **Keyword Identification**: Discover important keywords from the job description that should be included in your resume
- **Strengths & Weaknesses**: Understand what's working well and what needs improvement in your resume
- **Resume Optimization**: Generate an optimized version of your resume tailored to the specific job

## Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- Yarn package manager
- A Groq API key (get one from [Groq Console](https://console.groq.com/))

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/easy-ats.git
   cd easy-ats
   ```

2. Install dependencies:

   ```bash
   yarn install
   ```

3. Create a `.env.local` file in the root directory and add your Groq API key:

   ```
   GROQ_API_KEY=your_groq_api_key_here
   ```

4. Start the development server:

   ```bash
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to use the application.

## How to Use

1. Enter the job description for the position you're applying for
2. (Optional) List your skills to help with the analysis
3. Paste your current resume
4. Click "Analyze Resume" to get your ATS compatibility score and analysis
5. Review the analysis results, including strengths, weaknesses, and important keywords
6. Click "Generate Optimized Resume" to create an ATS-friendly version of your resume
7. Copy the optimized resume and use it for your job application

## Technologies Used

- Next.js with TypeScript
- Tailwind CSS for styling
- LangChain for AI integration
- Groq for large language model capabilities

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Groq](https://groq.com/) and [LangChain](https://js.langchain.com/)
