import axios from 'axios';

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
      const prompt = `Generate interview questions for the following job:

Job Title: ${jobData.jobTitle}
Job Description: ${jobData.jobDescription}
Required Skills: ${jobData.requiredSkills?.join(', ') || 'Not specified'}
Experience Level: ${jobData.experienceLevel || 'Not specified'}

${jobData.jobDNA ? `Job DNA Traits:
- Skill DNA: ${jobData.jobDNA.skillDNA?.map((t: any) => t.name).join(', ')}
- Experience DNA: ${jobData.jobDNA.experienceDNA?.map((t: any) => t.name).join(', ')}
- Behavioral DNA: ${jobData.jobDNA.behavioralDNA?.map((t: any) => t.name).join(', ')}
- Communication DNA: ${jobData.jobDNA.communicationDNA?.map((t: any) => t.name).join(', ')}
` : ''}

${jobData.customPrompt ? `Configuration Prompt:
${jobData.customPrompt}
` : ''}

Generate EXACTLY ${jobData.count || '8'} interview questions that:
1. Map to the Job DNA traits (if provided)
2. Cover technical, behavioral, situational, and communication aspects
3. Include evaluation criteria for each question
4. Provide follow-up questions

Return a JSON object with a "questions" array:
{
  "questions": [
    {
      "id": "unique-id",
      "text": "Question text",
      "category": "technical|behavioral|situational|communication",
      "estimatedDuration": 5,
      "dnaMapping": [
        {
          "dimension": "skillDNA|experienceDNA|behavioralDNA|communicationDNA",
          "trait": "trait name from Job DNA",
          "importance": "critical|high|medium|low",
          "signalsToEvaluate": ["signal 1", "signal 2"]
        }
      ],
      "evaluationCriteria": {
        "excellent": "What makes an excellent answer",
        "good": "What makes a good answer",
        "average": "What makes an average answer",
        "poor": "What makes a poor answer"
      },
      "followUpQuestions": ["Follow-up question 1", "Follow-up question 2"]
    }
  ]
}`;

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
          timeout: 90000, // 90s timeout for question generation
        }
      );

      const result = JSON.parse(response.data.choices[0].message.content);
      console.log('📦 OpenAI Response:', JSON.stringify(result).substring(0, 200));
      console.log('✅ Generated questions:', result.questions?.length || 0);
      console.log('🔍 Result type:', Array.isArray(result) ? 'array' : typeof result);
      console.log('🔍 Result keys:', Object.keys(result));

      // Handle different response formats
      if (Array.isArray(result)) {
        console.log('✅ Returning array directly');
        return result;
      } else if (result.questions && Array.isArray(result.questions)) {
        console.log('✅ Returning result.questions');
        return result.questions;
      } else {
        console.warn('⚠️  Unexpected response format, using mock questions');
        console.warn('Response structure:', JSON.stringify(result, null, 2).substring(0, 500));
        return this.generateMockQuestions(jobData);
      }
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

  /**
   * AI Chat Assistant for DNA/Hiring/Candidate questions
   */
  async chatAssistant(
    message: string,
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
      const systemPrompt = `You are an AI hiring assistant for Intelligens, an AI-powered recruitment platform. 

**IMPORTANT RESTRICTIONS:**
You MUST ONLY answer questions related to:
- DNA Matching (how candidates match against Job DNA)
- Hiring decisions and recommendations
- Candidate evaluation and scoring
- Interview analysis and insights
- Job requirements and skills assessment
- Recruitment best practices
- HR processes within this platform

**STRICTLY FORBIDDEN:**
You MUST NOT answer questions about:
- General knowledge topics
- News, current events, or entertainment
- Personal advice unrelated to hiring
- Technical support for other software
- Any topic outside of HR and recruitment

**RESPONSE PROTOCOL:**
If a user asks an off-topic question, respond ONLY with:
"I'm specialized in helping with hiring and recruitment decisions. I can only assist with questions about candidate evaluation, DNA matching, interview analysis, and hiring recommendations. Please ask me something related to your hiring process."

Do NOT provide any information beyond this polite redirect for off-topic questions.

${context?.candidateName ? `Current Candidate: ${context.candidateName}` : ''}
${context?.jobTitle ? `Position: ${context.jobTitle}` : ''}
${context?.candidateScore ? `Overall Score: ${context.candidateScore}/100` : ''}
${context?.recommendation ? `AI Recommendation: ${context.recommendation}` : ''}
${context?.jobDNA ? `\nJob DNA Traits: ${JSON.stringify(context.jobDNA, null, 2).substring(0, 500)}...` : ''}

For valid hiring/recruitment questions: Provide concise, actionable insights. Be professional and data-driven.`;

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
    skills?: string[];
    currentRole?: string;
    summary?: string;
    location?: string;
  }> {
    const apiKey = this.getApiKey();

    if (this.shouldUseMock()) {
      console.log('🎭 Using mock resume parsing (OpenAI API key not configured)');
      return {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        experience: '5 years',
        skills: ['JavaScript', 'React', 'Node.js']
      };
    }

    console.log('🤖 Using OpenAI API for resume parsing');
    console.log('📝 Resume text length:', resumeText.length);

    try {
      const prompt = `You are an expert resume parser. Extract candidate information from the following resume text.

RESUME TEXT:
${resumeText}

INSTRUCTIONS:
1. **Analyze Structure**: Reconstruct logical sections (Work History, Skills) even if text is interleaved from columns.
2. Extract the candidate's **FIRST NAME** and **LAST NAME**.
3. Find the **EMAIL ADDRESS**.
4. Find the **PHONE NUMBER**.
5. Determine **YEARS OF EXPERIENCE**:
   - Calculate total duration from work history dates (e.g., "Jan 2018 - Present").
   - If explicit dates are missing, infer from "Senior", "Lead", "Junior".
   - Format: "X years" (e.g., "5 years").
6. Extract **TOP SKILLS** (limit to 10 most relevant technical/professional skills).
7. Extract **CURRENT ROLE** (e.g., "Senior Accountant", "Dental Assistant"). Look at the most recent job or the headline.
8. Extract **SUMMARY** (a brief 1-2 sentence professional summary).
9. Extract **LOCATION** (City, Country).

IMPORTANT RULES:
- Use defaults if fields are missing (firstName="Unknown", experience="Not specified").
- Be robust against "messy" text from optical character recognition or column mergers.

Return ONLY valid JSON in this exact format:
{
  "firstName": "string",
  "lastName": "string", 
  "email": "string",
  "phone": "string",
  "experience": "string",
  "skills": ["string"],
  "currentRole": "string",
  "summary": "string",
  "location": "string"
}`;

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: 'You are an expert resume parser. You must extract structured candidate information accurately from any resume format. Always return valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const parsed = JSON.parse(response.data.choices[0].message.content);

      // Validate and clean the parsed data
      const result = {
        firstName: parsed.firstName || 'Unknown',
        lastName: parsed.lastName || 'Candidate',
        email: parsed.email || '',
        phone: parsed.phone,
        experience: parsed.experience || 'Not specified',
        skills: Array.isArray(parsed.skills) ? parsed.skills : [],
        currentRole: parsed.currentRole,
        summary: parsed.summary,
        location: parsed.location
      };

      console.log('✅ Resume parsed successfully:', result);
      return result;
    } catch (error: any) {
      console.error('❌ Failed to parse resume:', error.response?.data || error.message);

      // Fallback: Try to extract basic info using regex
      console.log('🔄 Attempting fallback extraction...');
      return this.fallbackResumeExtraction(resumeText);
    }
  }

  /**
   * Parse job description text and extract job details
   */
  async parseJobDescription(text: string): Promise<{
    title: string;
    department: string;
    location: string;
    employmentType: 'full-time' | 'part-time' | 'contract' | 'internship';
    experienceLevel: 'entry' | 'mid' | 'senior' | 'lead';
    description: string;
    requiredSkills: string[];
    optionalSkills: string[];
  }> {
    const apiKey = this.getApiKey();

    if (this.shouldUseMock()) {
      console.log('🎭 Using mock JD parsing (OpenAI API key not configured)');
      return {
        title: 'Software Engineer',
        department: 'Engineering',
        location: 'Remote',
        employmentType: 'full-time',
        experienceLevel: 'mid',
        description: text || 'Mock job description...',
        requiredSkills: ['JavaScript', 'React', 'Node.js'],
        optionalSkills: ['AWS', 'Docker']
      };
    }

    console.log('🤖 Using OpenAI API for JD parsing');

    try {
      const prompt = `You are an expert HR assistant. Extract structured job details from the following job description text.

JOB DESCRIPTION TEXT:
${text.substring(0, 10000)}

INSTRUCTIONS:
1. Extract **Job Title**.
2. Extract **Department** (e.g., Engineering, Sales, Marketing). Infer if not explicit.
3. Extract **Location**.
4. Determine **Employment Type** (full-time, part-time, contract, internship). Default to "full-time".
5. Determine **Experience Level** (entry, mid, senior, lead). Infer from years of experience or title.
6. Clean and format the **Description**. Remove metadata headers/footers. Keep the core responsibilities and requirements.
7. Extract **Required Skills** (Must-haves).
8. Extract **Optional Skills** (Nice-to-haves).

Return ONLY valid JSON in this exact format:
{
  "title": "string",
  "department": "string",
  "location": "string",
  "employmentType": "full-time|part-time|contract|internship",
  "experienceLevel": "entry|mid|senior|lead",
  "description": "string",
  "requiredSkills": ["string"],
  "optionalSkills": ["string"]
}`;

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: 'You are an exert job description parser. Return valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 45000
        }
      );

      const parsed = JSON.parse(response.data.choices[0].message.content);

      // Validate enums
      const validEmploymentTypes = ['full-time', 'part-time', 'contract', 'internship'];
      const validExperienceLevels = ['entry', 'mid', 'senior', 'lead'];

      return {
        title: parsed.title || 'Unknown Role',
        department: parsed.department || 'Engineering',
        location: parsed.location || 'Remote',
        employmentType: validEmploymentTypes.includes(parsed.employmentType) ? parsed.employmentType : 'full-time',
        experienceLevel: validExperienceLevels.includes(parsed.experienceLevel) ? parsed.experienceLevel : 'mid',
        description: parsed.description || text,
        requiredSkills: Array.isArray(parsed.requiredSkills) ? parsed.requiredSkills : [],
        optionalSkills: Array.isArray(parsed.optionalSkills) ? parsed.optionalSkills : []
      };

    } catch (error: any) {
      console.error('❌ Failed to parse JD:', error.response?.data || error.message);
      // Fallback
      return {
        title: 'Uploaded Job',
        department: 'General',
        location: 'Remote',
        employmentType: 'full-time',
        experienceLevel: 'mid',
        description: text,
        requiredSkills: [],
        optionalSkills: []
      };
    }
  }

  /**
   * Fallback resume extraction using regex patterns
   */
  private fallbackResumeExtraction(text: string): {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    experience?: string;
    skills?: string[];
  } {
    // Extract email
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    const email = emailMatch ? emailMatch[0] : '';

    // Extract phone
    const phoneMatch = text.match(/[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}/);
    const phone = phoneMatch ? phoneMatch[0] : undefined;

    // Try to extract name from first few lines
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const firstLine = lines[0] || '';
    const nameParts = firstLine.trim().split(/\s+/);
    const firstName = nameParts[0] || 'Unknown';
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : 'Candidate';

    // Try to extract experience
    const experienceMatch = text.match(/(\d+)\+?\s*(years?|yrs?)/i);
    const experience = experienceMatch ? `${experienceMatch[1]} years` : 'Not specified';

    // Extract common skills
    const commonSkills = ['JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'AWS', 'Docker', 'Git'];
    const skills = commonSkills.filter(skill =>
      text.toLowerCase().includes(skill.toLowerCase())
    );

    console.log('✅ Fallback extraction completed:', { firstName, lastName, email, phone, experience, skills });

    return {
      firstName,
      lastName,
      email,
      phone,
      experience,
      skills
    };
  }
}

export default new AIService();


