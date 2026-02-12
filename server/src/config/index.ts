// Note: dotenv is loaded in index.ts before this module is imported

export const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5175',

  // MongoDB
  mongodbUri: process.env.MONGODB_URI || '',

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  // AWS S3
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'us-east-1',
    s3Bucket: process.env.AWS_S3_BUCKET || '',
    s3Folders: {
      recordings: process.env.AWS_S3_RECORDINGS_FOLDER || 'recordings',
      resumes: process.env.AWS_S3_RESUMES_FOLDER || 'resumes',
      jobDescriptions: process.env.AWS_S3_JD_FOLDER || 'job-descriptions',
    },
  },

  // n8n Webhooks
  n8n: {
    emailWebhook: process.env.N8N_WEBHOOK_EMAIL || '',
    interviewQuestionsWebhook: process.env.N8N_WEBHOOK_INTERVIEW_QUESTIONS || '',
    interviewResultWebhook: process.env.N8N_WEBHOOK_INTERVIEW_RESULT || '',
  },

  // Retell AI
  retell: {
    apiKey: process.env.RETELL_API_KEY || '',
    agentId: process.env.RETELL_AGENT_ID || '',
  },

  // OpenAI
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
  },

  // Interview Settings
  interview: {
    codeExpiryHours: parseInt(process.env.INTERVIEW_CODE_EXPIRY_HOURS || '168', 10),
    maxDurationMinutes: parseInt(process.env.INTERVIEW_MAX_DURATION_MINUTES || '60', 10),
    sessionTimeoutMinutes: parseInt(process.env.INTERVIEW_SESSION_TIMEOUT_MINUTES || '45', 10),
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
};

// Validate required config
export function validateConfig(): void {
  const required = [
    { key: 'MONGODB_URI', value: config.mongodbUri },
    { key: 'JWT_SECRET', value: config.jwt.secret },
  ];

  const missing = required.filter(({ value }) => !value || value === 'default-secret-change-me');

  if (missing.length > 0 && config.nodeEnv === 'production') {
    throw new Error(`Missing required environment variables: ${missing.map(m => m.key).join(', ')}`);
  }
}
