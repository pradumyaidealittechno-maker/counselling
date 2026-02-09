import axios from 'axios';
import Candidate from '../models/Candidate.js';
import Job from '../models/Job.js';
import User from '../models/User.js';

export interface TranscriptEntry {
  speaker: string;
  text: string;
  timestamp: string;
}

export interface InterviewAnalysis {
  overallScore: number;
  technicalSkills: {
    score: number;
    strengths: string[];
    weaknesses: string[];
  };
  communication: {
    score: number;
    clarity: number;
    articulation: number;
  };
  problemSolving: {
    score: number;
    analyticalThinking: number;
    creativity: number;
  };
  culturalFit: {
    score: number;
    alignment: string[];
  };
  recommendation: 'strong_hire' | 'hire' | 'maybe' | 'no_hire';
  summary: string;
  keyInsights: string[];
  redFlags: string[];
}

export class AIService {
  private baseUrl: string = 'https://api.openai.com/v1';

  private getApiKey(): string {
    return process.env.OPENAI_API_KEY || '';
  }

  private shouldUseMock(): boolean {
    const apiKey = this.getApiKey();
    return !apiKey || apiKey === 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
  }

  async analyzeInterview(
    transcript: TranscriptEntry[],
    jobDescription: string,
    requiredSkills: string[]
  ): Promise<InterviewAnalysis> {
    const apiKey = this.getApiKey();

    if (this.shouldUseMock()) {
      throw new Error('OpenAI API key not configured. Cannot analyze interview.');
    }

    try {
      const transcriptText = transcript
        .map((entry) => `${entry.speaker}: ${entry.text}`)
        .join('\n');

      const prompt = `You are an expert HR analyst. Analyze the following interview transcript and provide a comprehensive evaluation.

Job Description: ${jobDescription}
Required Skills: ${requiredSkills.join(', ')}

Interview Transcript:
${transcriptText}

Provide a detailed analysis in the following JSON format:
{
  "overallScore": <number 0-100>,
  "technicalSkills": {
    "score": <number 0-100>,
    "strengths": [<array of strings>],
    "weaknesses": [<array of strings>]
  },
  "communication": {
    "score": <number 0-100>,
    "clarity": <number 0-100>,
    "articulation": <number 0-100>
  },
  "problemSolving": {
    "score": <number 0-100>,
    "analyticalThinking": <number 0-100>,
    "creativity": <number 0-100>
  },
  "culturalFit": {
    "score": <number 0-100>,
    "alignment": [<array of strings>]
  },
  "recommendation": "<strong_hire|hire|maybe|no_hire>",
  "summary": "<detailed summary>",
  "keyInsights": [<array of key insights>],
  "redFlags": [<array of concerns or red flags>]
}`;

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: 'You are an expert HR analyst specializing in interview evaluation.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000, // 60s timeout
        }
      );

      const analysis = JSON.parse(response.data.choices[0].message.content);
      return analysis;
    } catch (error: any) {
      console.error('❌ Failed to analyze interview:', error.response?.data || error.message);
      throw new Error('Failed to analyze interview with AI');
    }
  }

  async generateJobDNA(jobDescription: string): Promise<any> {
    const apiKey = this.getApiKey();

    // Use mock response if API key is not configured
    if (this.shouldUseMock()) {
      console.log('🎭 Using mock Job DNA generation (OpenAI API key not configured)');
      return this.generateMockJobDNA(jobDescription);
    }

    console.log('🤖 Using OpenAI API for Job DNA generation');

    try {
      const prompt = `Analyze the following job description and extract key DNA elements organized by category:

${jobDescription}

For each trait, provide:
- id: unique identifier (use lowercase with hyphens)
- name: trait name
- description: brief description
- importance: critical, high, medium, or low
- signals: array of observable signals/indicators

Provide a structured JSON response with:
{
  "skillDNA": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "importance": "critical|high|medium|low",
      "signals": ["string"]
    }
  ],
  "experienceDNA": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "importance": "critical|high|medium|low",
      "signals": ["string"]
    }
  ],
  "behavioralDNA": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "importance": "critical|high|medium|low",
      "signals": ["string"]
    }
  ],
  "communicationDNA": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "importance": "critical|high|medium|low",
      "signals": ["string"]
    }
  ],
  "culturalDNA": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "importance": "critical|high|medium|low",
      "signals": ["string"]
    }
  ]
}

Guidelines:
- skillDNA: Technical and hard skills required
- experienceDNA: Years of experience, industry background, specific role experience
- behavioralDNA: Work style, problem-solving approach, leadership traits
- communicationDNA: Communication style, collaboration, presentation skills
- culturalDNA: Company culture fit, values alignment, team dynamics`;

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: 'You are an expert job analyst specializing in extracting structured DNA profiles from job descriptions.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 120000, // 120s timeout
        }
      );

      return JSON.parse(response.data.choices[0].message.content);
    } catch (error: any) {
      console.error('❌ Failed to generate Job DNA:', error.response?.data || error.message);

      // If API key is invalid, switch to mock mode
      if (error.response?.data?.error?.type === 'invalid_request_error') {
        console.warn('⚠️  OpenAI API key appears to be invalid. Using mock response.');
        return this.generateMockJobDNA(jobDescription);
      }

      throw new Error('Failed to generate Job DNA');
    }
  }

  private generateMockJobDNA(jobDescription: string): any {
    // Extract some keywords from the description for more realistic mock data
    const desc = jobDescription.toLowerCase();
    const hasReact = desc.includes('react');
    const hasNode = desc.includes('node');
    const hasPython = desc.includes('python');
    const hasJava = desc.includes('java');
    const isSenior = desc.includes('senior') || desc.includes('lead');

    return {
      skillDNA: [
        {
          id: 'primary-tech-stack',
          name: hasReact ? 'React Development' : hasPython ? 'Python Development' : hasJava ? 'Java Development' : 'Software Development',
          description: 'Strong proficiency in the primary technology stack',
          importance: 'critical',
          signals: ['Demonstrates deep understanding', 'Can explain advanced concepts', 'Builds production-ready code'],
        },
        {
          id: 'backend-skills',
          name: hasNode ? 'Node.js Backend' : 'Backend Development',
          description: 'Experience with server-side development',
          importance: 'high',
          signals: ['API design', 'Database management', 'Performance optimization'],
        },
        {
          id: 'problem-solving',
          name: 'Problem Solving',
          description: 'Ability to analyze and solve complex technical challenges',
          importance: 'critical',
          signals: ['Breaks down problems systematically', 'Considers edge cases', 'Optimizes solutions'],
        },
      ],
      experienceDNA: [
        {
          id: 'years-experience',
          name: isSenior ? 'Senior-Level Experience' : 'Professional Experience',
          description: isSenior ? '5+ years of professional development' : '2+ years of professional development',
          importance: 'high',
          signals: isSenior ? ['Led projects', 'Mentored others', 'Made architectural decisions'] : ['Worked on production systems', 'Collaborated with teams', 'Delivered features'],
        },
        {
          id: 'industry-knowledge',
          name: 'Industry Knowledge',
          description: 'Understanding of industry best practices and standards',
          importance: 'medium',
          signals: ['Follows industry trends', 'Applies best practices', 'Continuous learning'],
        },
      ],
      behavioralDNA: [
        {
          id: 'ownership',
          name: 'Ownership',
          description: 'Takes responsibility for work and sees tasks through to completion',
          importance: 'high',
          signals: ['Proactive problem solving', 'Follows through on commitments', 'Takes initiative'],
        },
        {
          id: 'adaptability',
          name: 'Adaptability',
          description: 'Adjusts to changing requirements and new technologies',
          importance: 'medium',
          signals: ['Learns quickly', 'Embraces change', 'Flexible approach'],
        },
      ],
      communicationDNA: [
        {
          id: 'technical-communication',
          name: 'Technical Communication',
          description: 'Explains technical concepts clearly to various audiences',
          importance: 'high',
          signals: ['Clear documentation', 'Effective in code reviews', 'Good presentation skills'],
        },
        {
          id: 'collaboration',
          name: 'Collaboration',
          description: 'Works effectively with team members',
          importance: 'high',
          signals: ['Active listener', 'Shares knowledge', 'Constructive feedback'],
        },
      ],
      culturalDNA: [
        {
          id: 'team-player',
          name: 'Team Player',
          description: 'Contributes positively to team dynamics',
          importance: 'medium',
          signals: ['Helps teammates', 'Shares credit', 'Supportive attitude'],
        },
        {
          id: 'growth-mindset',
          name: 'Growth Mindset',
          description: 'Committed to continuous learning and improvement',
          importance: 'medium',
          signals: ['Seeks feedback', 'Learns from mistakes', 'Stays current with technology'],
        },
      ],
    };
  }

  async generateInterviewQuestions(jobData: {
    jobTitle: string;
    jobDescription: string;
    requiredSkills?: string[];
    experienceLevel?: string;
    jobDNA?: any;
    count?: number;
    customPrompt?: string;
  }): Promise<any[]> {
    const apiKey = this.getApiKey();

    // Use mock response if API key is not configured
    if (this.shouldUseMock()) {
      console.log('🎭 Using mock interview questions generation (OpenAI API key not configured)');
      return this.generateMockQuestions(jobData);
    }

    console.log('🤖 Using OpenAI API for interview questions generation');
    console.log('📋 Job Data:', {
      title: jobData.jobTitle,
      hasDescription: !!jobData.jobDescription,
      hasDNA: !!jobData.jobDNA,
      dnaKeys: jobData.jobDNA ? Object.keys(jobData.jobDNA) : [],
      skillsCount: jobData.requiredSkills?.length || 0
    });

    try {
      console.log('DEBUG: Received count from request:', jobData.count);
      // Ensure count is a number
      const requestedCount = Number(jobData.count) || 100;
      const BATCH_SIZE = 10; // Reduced to 10 to prevent JSON truncation (Unterminated string errors)
      const batches = Math.ceil(requestedCount / BATCH_SIZE);
      let allQuestions: any[] = [];

      console.log(`🚀 Starting generation of ${requestedCount} questions in ${batches} batches (Batch Size: ${BATCH_SIZE})...`);

      for (let i = 0; i < batches; i++) {
        // Add small delay between batches to respect rate limits
        if (i > 0) {
          console.log(`⏳ Pausing 3s before Batch ${i + 1}...`);
          await new Promise(resolve => setTimeout(resolve, 3000));
        }

        try {
          const currentBatchCount = (i === batches - 1) ? (requestedCount % BATCH_SIZE) || BATCH_SIZE : BATCH_SIZE;
          const countStr = currentBatchCount.toString();

          console.log(`🔹 [Batch ${i + 1}/${batches}] Requesting ${countStr} questions...`);

          const prompt = `You are an expert technical interviewer creating a comprehensive interview script.

Job Context:
Title: ${jobData.jobTitle}
Description: ${jobData.jobDescription}
Required Skills: ${jobData.requiredSkills?.join(', ') || 'Not specified'}
Experience Level: ${jobData.experienceLevel || 'Not specified'}

${jobData.jobDNA ? `Job DNA Framework (Map questions to these traits):
- Skill DNA: ${jobData.jobDNA.skillDNA?.map((t: any) => t?.name || '').join(', ')}
- Experience DNA: ${jobData.jobDNA.experienceDNA?.map((t: any) => t?.name || '').join(', ')}
- Behavioral DNA: ${jobData.jobDNA.behavioralDNA?.map((t: any) => t?.name || '').join(', ')}
- Communication DNA: ${jobData.jobDNA.communicationDNA?.map((t: any) => t?.name || '').join(', ')}
` : ''}

${jobData.customPrompt ? `Custom User Instructions:
${jobData.customPrompt}
` : ''}

TASK Checklist:
1. Generate EXACTLY ${countStr} distinct interview questions.
2. Ensure strict sequential numbering in IDs (e.g., "q-1", "q-2", ... "q-${countStr}").
3. Cover diversified categories: technical, behavioral, situational, and communication.
4. Directly assess the specific Skills and Job DNA traits provided above.
5. Provide clear evaluation criteria for each question.

Output JSON Format:
{
  "questions": [
    {
      "id": "q-1",
      "text": "Question text...",
      "category": "technical|behavioral|situational|communication",
      "estimatedDuration": 5,
      "dnaMapping": [
        {
          "dimension": "skillDNA|experienceDNA|behavioralDNA|communicationDNA",
          "trait": "Mapped Trait Name",
          "importance": "critical|high|medium|low",
          "signalsToEvaluate": ["signal1", "signal2"]
        }
      ],
      "evaluationCriteria": {
        "excellent": "...",
        "good": "...",
        "average": "...",
        "poor": "..."
      },
      "followUpQuestions": ["follow-up 1", "follow-up 2"]
    }
  ]
}`; // Prompt End

          const response = await axios.post(
            `${this.baseUrl}/chat/completions`,
            {
              model: 'gpt-4-turbo-preview',
              messages: [
                {
                  role: 'system',
                  content: 'You are an expert interview designer specializing in creating structured, DNA-mapped interview questions.',
                },
                {
                  role: 'user',
                  content: prompt,
                },
              ],
              response_format: { type: 'json_object' },
              temperature: 0.7,
            },
            {
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
              },
              timeout: 300000,
            }
          );

          const result = JSON.parse(response.data.choices[0].message.content);

          let batchQs: any[] = [];
          if (Array.isArray(result)) {
            batchQs = result;
          } else if (result.questions && Array.isArray(result.questions)) {
            batchQs = result.questions;
          } else {
            console.warn(`⚠️ Batch ${i + 1} returned unexpected format.`);
          }

          if (batchQs.length > 0) {
            allQuestions = [...allQuestions, ...batchQs];
          }

        } catch (batchErr: any) {
          console.error(`❌ Batch ${i + 1} failed:`, batchErr.message);
          // Continue to next batch to get partial results
        }
      } // End of batch loop

      console.log(`✅ Total Generated across batches: ${allQuestions.length}`);

      if (allQuestions.length === 0) {
        return this.generateMockQuestions(jobData);
      }

      // Enforce sequential numbering on TOTAL set
      return allQuestions.map((q, index) => ({
        ...q,
        id: `q-${index + 1}`
      }));
    } catch (error: any) {
      console.error('❌ Failed to generate interview questions:', error.response?.data || error.message);

      // If API key is invalid, use mock response
      if (error.response?.data?.error?.type === 'invalid_request_error') {
        console.warn('⚠️  OpenAI API key appears to be invalid. Using mock response.');
        return this.generateMockQuestions(jobData);
      }

      throw new Error('Failed to generate interview questions');
    }
  }

  private generateMockQuestions(jobData: {
    jobTitle: string;
    jobDescription: string;
    requiredSkills?: string[];
    experienceLevel?: string;
    jobDNA?: any;
  }): any[] {
    const desc = jobData.jobDescription.toLowerCase();
    const hasReact = desc.includes('react');
    const hasNode = desc.includes('node');
    const hasPython = desc.includes('python');
    const isSenior = jobData.experienceLevel === 'senior' || jobData.experienceLevel === 'lead';

    return [
      {
        id: 'q1-technical',
        text: hasReact
          ? 'Explain the difference between controlled and uncontrolled components in React. When would you use each?'
          : hasPython
            ? 'Explain the difference between lists and tuples in Python. When would you use each?'
            : 'Describe your approach to designing a scalable system architecture.',
        category: 'technical',
        estimatedDuration: 5,
        dnaMapping: [
          {
            dimension: 'skillDNA',
            trait: hasReact ? 'React Proficiency' : 'Technical Expertise',
            importance: 'critical',
            signalsToEvaluate: [
              'Demonstrates deep understanding',
              'Provides practical examples',
              'Explains trade-offs'
            ]
          }
        ],
        evaluationCriteria: {
          excellent: 'Provides comprehensive explanation with real-world examples and discusses trade-offs',
          good: 'Explains concepts clearly with some examples',
          average: 'Basic understanding but lacks depth or examples',
          poor: 'Incorrect or incomplete explanation'
        },
        followUpQuestions: [
          'Can you provide an example from your experience?',
          'What challenges have you faced with this approach?'
        ]
      },
      {
        id: 'q2-technical',
        text: hasNode
          ? 'How would you handle error handling and logging in a Node.js application?'
          : 'Describe your approach to debugging complex issues in production.',
        category: 'technical',
        estimatedDuration: 5,
        dnaMapping: [
          {
            dimension: 'skillDNA',
            trait: 'Problem Solving',
            importance: 'critical',
            signalsToEvaluate: [
              'Systematic approach',
              'Considers edge cases',
              'Mentions monitoring tools'
            ]
          }
        ],
        evaluationCriteria: {
          excellent: 'Comprehensive strategy including monitoring, logging, and error recovery',
          good: 'Solid approach with some best practices',
          average: 'Basic error handling knowledge',
          poor: 'Lacks understanding of production concerns'
        },
        followUpQuestions: [
          'What tools do you use for monitoring?',
          'How do you handle errors in async operations?'
        ]
      },
      {
        id: 'q3-behavioral',
        text: 'Tell me about a time when you had to make a difficult technical decision with limited information.',
        category: 'behavioral',
        estimatedDuration: 7,
        dnaMapping: [
          {
            dimension: 'behavioralDNA',
            trait: 'Decision Making',
            importance: 'high',
            signalsToEvaluate: [
              'Gathers available information',
              'Considers risks',
              'Takes ownership of decision'
            ]
          }
        ],
        evaluationCriteria: {
          excellent: 'Clear STAR format, shows analytical thinking and ownership',
          good: 'Good example with some structure',
          average: 'Vague example or lacks detail',
          poor: 'No clear example or avoids responsibility'
        },
        followUpQuestions: [
          'What would you do differently now?',
          'How did you communicate this decision to stakeholders?'
        ]
      },
      {
        id: 'q4-behavioral',
        text: isSenior
          ? 'Describe a situation where you mentored a junior developer. What was your approach?'
          : 'Tell me about a time when you learned a new technology quickly to solve a problem.',
        category: 'behavioral',
        estimatedDuration: 6,
        dnaMapping: [
          {
            dimension: 'behavioralDNA',
            trait: isSenior ? 'Leadership' : 'Adaptability',
            importance: 'high',
            signalsToEvaluate: isSenior
              ? ['Structured mentoring approach', 'Patience', 'Knowledge sharing']
              : ['Quick learner', 'Self-motivated', 'Problem-focused']
          }
        ],
        evaluationCriteria: {
          excellent: 'Detailed example showing impact and methodology',
          good: 'Clear example with positive outcome',
          average: 'Basic example lacking detail',
          poor: 'No concrete example'
        },
        followUpQuestions: [
          'What was the outcome?',
          'What did you learn from this experience?'
        ]
      },
      {
        id: 'q5-situational',
        text: 'If you discovered a critical bug in production that affects users, how would you handle it?',
        category: 'situational',
        estimatedDuration: 5,
        dnaMapping: [
          {
            dimension: 'behavioralDNA',
            trait: 'Crisis Management',
            importance: 'high',
            signalsToEvaluate: [
              'Prioritizes user impact',
              'Communicates clearly',
              'Has systematic approach'
            ]
          }
        ],
        evaluationCriteria: {
          excellent: 'Comprehensive plan including communication, fix, and prevention',
          good: 'Solid approach covering main points',
          average: 'Basic response lacking detail',
          poor: 'Unclear or incomplete approach'
        },
        followUpQuestions: [
          'How would you communicate with stakeholders?',
          'What steps would you take to prevent this in the future?'
        ]
      },
      {
        id: 'q6-communication',
        text: 'How do you explain complex technical concepts to non-technical stakeholders?',
        category: 'communication',
        estimatedDuration: 5,
        dnaMapping: [
          {
            dimension: 'communicationDNA',
            trait: 'Technical Communication',
            importance: 'high',
            signalsToEvaluate: [
              'Uses analogies',
              'Adapts to audience',
              'Checks understanding'
            ]
          }
        ],
        evaluationCriteria: {
          excellent: 'Provides specific strategies and examples',
          good: 'Shows awareness of audience needs',
          average: 'Generic response',
          poor: 'Doesn\'t consider audience perspective'
        },
        followUpQuestions: [
          'Can you give me an example?',
          'How do you handle pushback or questions?'
        ]
      },
      {
        id: 'q7-communication',
        text: 'Describe your approach to code reviews. How do you provide constructive feedback?',
        category: 'communication',
        estimatedDuration: 5,
        dnaMapping: [
          {
            dimension: 'communicationDNA',
            trait: 'Collaboration',
            importance: 'medium',
            signalsToEvaluate: [
              'Constructive approach',
              'Focuses on code not person',
              'Encourages learning'
            ]
          }
        ],
        evaluationCriteria: {
          excellent: 'Thoughtful approach balancing quality and team dynamics',
          good: 'Shows consideration for team members',
          average: 'Basic understanding of code reviews',
          poor: 'Overly critical or dismissive'
        },
        followUpQuestions: [
          'How do you handle disagreements in code reviews?',
          'What do you look for in a code review?'
        ]
      },
      {
        id: 'q8-technical',
        text: 'Walk me through how you would optimize the performance of a slow application.',
        category: 'technical',
        estimatedDuration: 7,
        dnaMapping: [
          {
            dimension: 'skillDNA',
            trait: 'Performance Optimization',
            importance: 'high',
            signalsToEvaluate: [
              'Systematic debugging approach',
              'Uses profiling tools',
              'Considers multiple factors'
            ]
          }
        ],
        evaluationCriteria: {
          excellent: 'Comprehensive methodology with specific tools and techniques',
          good: 'Structured approach with some specifics',
          average: 'Generic optimization suggestions',
          poor: 'Lacks systematic approach'
        },
        followUpQuestions: [
          'What tools do you use for profiling?',
          'How do you measure improvement?'
        ]
      }
    ];
  }

  async generateEvaluationCriteria(question: string): Promise<{
    excellent: string;
    good: string;
    average: string;
    poor: string;
  }> {
    const apiKey = this.getApiKey();

    if (this.shouldUseMock()) {
      return {
        excellent: "Demonstrates deep understanding with comprehensive examples and covers edge cases.",
        good: "Shows solid understanding and provides a clear explanation.",
        average: "Basic understanding but lacks depth or specific examples.",
        poor: "Incorrect, vague, or irrelevant answer."
      };
    }

    try {
      const prompt = `You are an expert technical interviewer. Create evaluation criteria for the following interview question:
      
      Question: "${question}"
      
      Provide criteria for 4 levels: Excellent, Good, Average, Poor.
      
      Output JSON format:
      {
        "excellent": "...",
        "good": "...",
        "average": "...",
        "poor": "..."
      }`;

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: 'You are an expert interviewer creating structured evaluation criteria.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      return JSON.parse(response.data.choices[0].message.content);
    } catch (error: any) {
      console.error('❌ Failed to generate evaluation criteria:', error.response?.data || error.message);

      if (error.response?.data?.error?.type === 'invalid_request_error') {
        return {
          excellent: "Demonstrates deep understanding with comprehensive examples and covers edge cases.",
          good: "Shows solid understanding and provides a clear explanation.",
          average: "Basic understanding but lacks depth or specific examples.",
          poor: "Incorrect, vague, or irrelevant answer."
        };
      }

      throw new Error('Failed to generate evaluation criteria');
    }
  }

  async generateDnaMapping(question: string, jobDNA?: any): Promise<any[]> {
    const apiKey = this.getApiKey();

    if (this.shouldUseMock()) {
      return [
        {
          dimension: "Skill",
          trait: "Technical Proficiency",
          importance: "high",
          signalsToEvaluate: ["Technical accuracy", "Depth of knowledge"]
        }
      ];
    }

    try {
      const prompt = `You are an expert technical interviewer. Map the following interview question to the most relevant Job DNA trait.
      
      Question: "${question}"
      
      ${jobDNA ? `Available Job DNA Traits:
      - Skill: ${jobDNA.skillDNA?.map((t: any) => t.name).join(', ')}
      - Experience: ${jobDNA.experienceDNA?.map((t: any) => t.name).join(', ')}
      - Behavioral: ${jobDNA.behavioralDNA?.map((t: any) => t.name).join(', ')}
      - Communication: ${jobDNA.communicationDNA?.map((t: any) => t.name).join(', ')}
      ` : ''}
      
      Output JSON format:
      {
        "mappings": [
          {
            "dimension": "Skill|Experience|Behavioral|Communication|Cultural",
            "trait": "Name of the trait (use one from available list if possible)",
            "importance": "critical|high|medium|low",
            "signalsToEvaluate": ["signal1", "signal2"]
          }
        ]
      }`;

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'gpt-4-turbo-preview',
          messages: [
            { role: 'system', content: 'You are an expert interviewer.' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const result = JSON.parse(response.data.choices[0].message.content);
      return result.mappings || [];
    } catch (error: any) {
      console.error('❌ Failed to generate DNA mapping:', error.response?.data || error.message);
      if (error.response?.data?.error?.type === 'invalid_request_error') {
        return [
          {
            dimension: "Skill",
            trait: "Technical Proficiency",
            importance: "high",
            signalsToEvaluate: ["Technical accuracy", "Depth of knowledge"]
          }
        ];
      }
      throw new Error('Failed to generate DNA mapping');
    }
  }

  async generateFollowUpQuestions(question: string): Promise<string[]> {
    const apiKey = this.getApiKey();

    if (this.shouldUseMock()) {
      return [
        "Can you provide more specific examples?",
        "How would you handle edge cases in this scenario?"
      ];
    }

    try {
      const prompt = `Generate 2 follow-up interview questions for the following question:
      "${question}"
      
      Output JSON format:
      {
        "questions": ["Follow-up question 1", "Follow-up question 2"]
      }`;

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'gpt-4-turbo-preview',
          messages: [
            { role: 'system', content: 'You are an expert interviewer.' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const result = JSON.parse(response.data.choices[0].message.content);
      return result.questions || [];
    } catch (error: any) {
      console.error('❌ Failed to generate follow-up questions:', error.response?.data || error.message);
      if (error.response?.data?.error?.type === 'invalid_request_error') {
        return [
          "Can you provide more specific examples?",
          "How would you handle edge cases in this scenario?"
        ];
      }
      throw new Error('Failed to generate follow-up questions');
    }
  }

  /**
   * AI Chat Assistant for DNA/Hiring/Candidate questions
   */
  async chatAssistant(
    message: string,
    userId: string,
    context?: {
      candidateName?: string;
      jobTitle?: string;
      jobDNA?: any;
      candidateScore?: number;
      recommendation?: string;
      conversationHistory?: Array<{ role: string; content: string }>;
    }
  ): Promise<string> {
    const apiKey = this.getApiKey();

    if (this.shouldUseMock()) {
      return `This is a mock AI response. To use real AI assistant, please configure your OpenAI API key.
      
Question: ${message}

Based on your question about ${context?.candidateName || 'the candidate'} for the ${context?.jobTitle || 'position'}, I would provide detailed insights about DNA matching, hiring recommendations, and candidate evaluation.`;
    }

    try {
      // 1. Fetch relevant database context scoped to the USER
      const candidates = await Candidate.find({ createdBy: userId }, 'firstName lastName status experience resumeMatchScore analysis resumeMatchAnalysis job jobId')
        .populate('jobId', 'title department')
        .lean();

      const jobs = await Job.find({ createdBy: userId }, 'title company status requiredSkills location experienceLevel').lean();

      // Also fetch user info
      const user = await User.findById(userId, 'firstName lastName email company').lean() as any;

      // Calculate derived stats
      const totalCandidates = candidates.length;
      const hiredCount = candidates.filter(c =>
        c.status === 'hired' ||
        c.analysis?.recommendation?.toLowerCase() === 'hire' ||
        c.analysis?.recommendation?.toLowerCase() === 'recommended' ||
        c.analysis?.recommendation?.toLowerCase() === 'match'
      ).length;

      const interviewsCompleted = candidates.filter(c => c.status === 'interview_complete' || c.analysis).length;

      // Prepare context object for the AI
      const dbContext = {
        userConfig: {
          name: user ? `${user.firstName} ${user.lastName}` : 'User',
          company: user?.company || 'My Company'
        },
        stats: {
          totalCandidates,
          hiredCandidates: hiredCount,
          interviewsCompleted,
          activeJobs: jobs.filter(j => j.status === 'active').length
        },
        candidates: candidates.map(c => ({
          name: `${c.firstName} ${c.lastName}`,
          status: c.status,
          role: (c.jobId as any)?.title || 'Unassigned',
          matchScore: c.resumeMatchScore || c.analysis?.overallScore || 0,
          experience: c.experience,
          recommendation: c.analysis?.recommendation || c.resumeMatchAnalysis?.recommendation || 'Pending'
        })),
        jobs: jobs.map(j => ({
          title: j.title,
          company: j.company,
          status: j.status,
          location: j.location,
          requiredSkills: j.requiredSkills,
          experienceLevel: j.experienceLevel
        }))
      };

      const systemPrompt = `You are an AI hiring assistant for Intelligens, an AI-powered recruitment platform. 
You are assisting ${user ? user.firstName : 'the user'}.
You have access to the current live database of candidates, jobs, and recruitment stats SPECIFIC to this user.

**DATABASE CONTEXT:**
${JSON.stringify(dbContext, null, 2)}

**IMPORTANT INSTRUCTIONS:**
1. **Use the Database Context:** When the user asks about "how many candidates", "available candidates", "candidates for role X", "match scores", etc., YOU MUST USE the data provided above to answer accurately. 
   - Example: If asked "How many candidates for Full-stack Developer?", look at the 'candidates' array in context and count those where role matches.
   - Example: If asked "Who has >85 match?", filter the candidates by 'matchScore'.
   - Example: If asked "Show me candidates with experience...", check the 'experience' field.

2. **Scope of Assistance:**
   - Answer questions about available candidates, their status, scores, and roles.
   - Provide insights on jobs, required skills, and stats.
   - Explain DNA matching and hiring recommendations.
   - Discuss interview management and analysis reports.
   - Answer questions about user info if available in context.

3. **Response Style:**
   - Be direct and data-driven.
   - If the answer is 0 or none, state that clearly.
   - Format lists nicely (e.g., using bullet points).

**STRICTLY FORBIDDEN:**
- Do NOT answer questions about general world knowledge unconnected to this hiring data or HR best practices.
- Do NOT invent data that is not in the context (unless providing general HR best practices).

${context?.candidateName ? `Current Page Context - Candidate: ${context.candidateName}` : ''}
${context?.jobTitle ? `Current Page Context - Position: ${context.jobTitle}` : ''}
${context?.candidateScore ? `Current Page Context - Score: ${context.candidateScore}/100` : ''}

User Question: "${message}"`;

      const messages = [
        { role: 'system', content: systemPrompt },
        ...(context?.conversationHistory || []),
        { role: 'user', content: message }
      ];

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'gpt-4',
          messages,
          temperature: 0.7,
          max_tokens: 500,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30s timeout
        }
      );

      return response.data.choices[0].message.content;
    } catch (error: any) {
      console.error('AI Chat error:', error.response?.data || error.message);
      throw new Error('Failed to get AI response. Please try again.');
    }
  }

  /**
   * Parse resume text and extract candidate information
   */
  async parseResume(resumeText: string): Promise<{
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    experience?: string;
    linkedIn?: string;
  }> {
    const apiKey = this.getApiKey();

    if (this.shouldUseMock()) {
      throw new Error('OpenAI API key not configured. Cannot parse resume.');
    }

    try {
      const prompt = `Extract candidate information from the following resume text.

Resume Text:
${resumeText}

Return a JSON object with the following fields:
{
  "firstName": "First name",
  "lastName": "Last name",
  "email": "Email address",
  "phone": "Phone number",
  "experience": "Total years of experience found (e.g. '5 years'). If not found, estimating from work history is okay.",
  "linkedIn": "LinkedIn profile URL"
}

CRITICAL RULES:
1. **NAME EXTRACTION**: The candidate's name is usually at the very top. However, DO NOT mistake University names (e.g. "IES IPS Academy"), Company names, or Headers ("Curriculum Vitae") for the candidate's name. Look for a name that looks like a person's name.
2. **MISSING DATA**: If a field is not found, return an empty string "".
3. **FORMAT**: Return strictly valid JSON.
`;

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are an expert resume parser. You are extremely accurate at identifying a person\'s name, distinguishing it from headers, titles, or institution names.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const parsed = JSON.parse(response.data.choices[0].message.content);
      console.log('✅ Parsed candidate data:', parsed);
      return parsed;
    } catch (error: any) {
      console.error('❌ Failed to parse resume:', error.response?.data || error.message);
      throw new Error('Failed to parse resume with AI');
    }
  }

  /**
   * Calculate exact match between Resume and Job DNA
   */
  async calculateResumeMatch(
    resumeText: string,
    jobDescription: string,
    jobDNA?: any
  ): Promise<{
    score: number;
    matchExplanation: string;
    missingSkills: string[];
    matchingSkills: string[];
    recommendation: 'strong_match' | 'match' | 'potential_match' | 'no_match';
  }> {
    const apiKey = this.getApiKey();

    if (this.shouldUseMock()) {
      // Mock logic for development without API key
      return {
        score: 75,
        matchExplanation: 'Mock analysis: Candidate matches most requirements.',
        missingSkills: ['Advanced Pattern Matching'],
        matchingSkills: ['Communication', 'Development'],
        recommendation: 'match'
      };
    }

    try {
      const prompt = `Compare the following Resume against the Job Description and Job DNA.

JOB DESCRIPTION:
${jobDescription.substring(0, 2000)}

${jobDNA ? `JOB DNA (Critical Attributes):
${JSON.stringify(jobDNA, null, 2)}` : ''}

RESUME:
${resumeText.substring(0, 5000)}

Analyze the match and return a JSON object with:
{
  "score": <number 0-100 based on fit>,
  "matchExplanation": "<single sentence summary>",
  "missingSkills": ["<skill 1>", "<skill 2>"],
  "matchingSkills": ["<skill 1>", "<skill 2>"],
  "recommendation": "strong_match|match|potential_match|no_match"
}

SCORING CRITERIA:
- 90-100: Exceptional match, has all critical and nice-to-have skills.
- 75-89: Good match, has all critical skills.
- 60-74: Potential match, has most critical skills but some gaps.
- <60: Poor match, missing critical skills.
`;

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are an expert recruitment AI. You accurately match candidates to job requirements based on deep semantic analysis.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2, // Low temp for consistent scoring
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 45000,
        }
      );

      const result = JSON.parse(response.data.choices[0].message.content);
      console.log('🧬 Resume Job Dictionary Match:', result);
      return result;

    } catch (error: any) {
      console.error('❌ Failed to calculate resume match:', error.response?.data || error.message);
      // Fallback
      return {
        score: 0,
        matchExplanation: 'Failed to analyze resume.',
        missingSkills: [],
        matchingSkills: [],
        recommendation: 'no_match'
      };
    }
  }
}

export default new AIService();


