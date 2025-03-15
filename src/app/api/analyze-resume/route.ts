import { NextRequest, NextResponse } from 'next/server';
import { analyzeResume } from '@/lib/langchain';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const jobDescription = formData.get('jobDescription') as string;
        const skills = formData.get('skills') as string || '';

        let resume = '';

        // Check if resume is provided as text
        const resumeText = formData.get('resume');
        if (resumeText && typeof resumeText === 'string') {
            resume = resumeText;
        }

        // Check if resume is provided as file
        const resumeFile = formData.get('resumeFile') as File | null;
        if (resumeFile) {
            // Read the file content as text
            resume = await resumeFile.text();
        }

        if (!jobDescription) {
            return NextResponse.json(
                { error: 'Job description is required' },
                { status: 400 }
            );
        }

        // Analyze the resume using LangChain and Groq
        const analysisResult = await analyzeResume(
            jobDescription,
            resume,
            skills
        );

        console.log(analysisResult)

        return NextResponse.json(analysisResult);
    } catch (error) {
        console.error('Error in analyze-resume API:', error);
        return NextResponse.json(
            { error: 'Failed to analyze resume' },
            { status: 500 }
        );
    }
} 