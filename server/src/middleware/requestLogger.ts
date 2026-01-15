import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  
  // Log incoming request
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
  
  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusEmoji = res.statusCode >= 400 ? '❌' : '✅';
    
    console.log('─'.repeat(60));
    console.log(`📤 RESPONSE - ${statusEmoji} ${res.statusCode} - ${duration}ms`);
    console.log('═'.repeat(60) + '\n');
  });
  
  next();
};
