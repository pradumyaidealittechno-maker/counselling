import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Detailed error logging
  console.error('\n' + '🔴'.repeat(30));
  console.error('❌ ERROR OCCURRED');
  console.error('🔴'.repeat(30));
  console.error(`   Time: ${new Date().toISOString()}`);
  console.error(`   Route: ${req.method} ${req.originalUrl}`);
  console.error(`   Error Name: ${err.name}`);
  console.error(`   Error Message: ${err.message}`);
  
  if (err.code) {
    console.error(`   Error Code: ${err.code}`);
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.error(`   Stack Trace:`);
    console.error(err.stack);
  }
  
  console.error('🔴'.repeat(30) + '\n');

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err.details || null
    }),
  });
};
