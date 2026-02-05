import { Request, Response, NextFunction } from 'express';

// Endpoints to exclude from verbose logging (polling endpoints that create noise)
const SILENT_ENDPOINTS = [
  '/api/interviews/active-sessions',
  '/api/notifications/unread-count',
  '/health'
];

// Check if endpoint should be logged silently
const isSilentEndpoint = (url: string): boolean => {
  return SILENT_ENDPOINTS.some(endpoint => url.includes(endpoint));
};

// Format timestamp with IST and UTC
const formatTimestamp = (): string => {
  const now = new Date();
  
  // IST (India Standard Time) - UTC+5:30
  const istTime = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(now);
  
  // UTC time
  const utcTime = now.toISOString();
  
  return `${istTime} IST (${utcTime} UTC)`;
};

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const timestamp = formatTimestamp();
  const silent = isSilentEndpoint(req.originalUrl);
  
  // Log incoming request (skip verbose logging for polling endpoints)
  if (!silent) {
    console.log('\n' + '═'.repeat(60));
    console.log(`📥 INCOMING REQUEST - ${timestamp}`);
    console.log('═'.repeat(60));
    console.log(`   Method: ${req.method}`);
    console.log(`   URL: ${req.originalUrl}`);
    console.log(`   IP: ${req.ip}`);
    console.log(`   User-Agent: ${req.get('User-Agent')?.substring(0, 50)}...`);
    
    if (Object.keys(req.query).length > 0) {
      console.log(`   Query: ${JSON.stringify(req.query)}`);
    }
    
    if (req.body && Object.keys(req.body).length > 0) {
      // Hide sensitive data
      const sanitizedBody = { ...req.body };
      if (sanitizedBody.password) sanitizedBody.password = '***HIDDEN***';
      if (sanitizedBody.token) sanitizedBody.token = '***HIDDEN***';
      console.log(`   Body: ${JSON.stringify(sanitizedBody)}`);
    }
    
    if (req.headers.authorization) {
      console.log(`   Auth: Bearer ***TOKEN***`);
    }
  }
  
  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusEmoji = res.statusCode >= 400 ? '❌' : '✅';
    
    if (!silent) {
      console.log('─'.repeat(60));
      console.log(`📤 RESPONSE - ${statusEmoji} ${res.statusCode} - ${duration}ms`);
      console.log('═'.repeat(60) + '\n');
    } else {
      // For silent endpoints, only log if there's an error or it's slow
      if (res.statusCode >= 400 || duration > 1000) {
        console.log(`⚠️ [${req.method}] ${req.originalUrl} - ${statusEmoji} ${res.statusCode} - ${duration}ms`);
      }
    }
  });
  
  next();
};
