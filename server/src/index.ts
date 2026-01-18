// Load environment variables FIRST, before any other imports
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(__dirname, '../.env');
console.log('🔍 Loading .env from:', envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('❌ Error loading .env:', result.error);
} else {
  console.log('✅ .env loaded successfully');
  console.log('🔑 OPENAI_API_KEY present:', !!process.env.OPENAI_API_KEY);
  if (process.env.OPENAI_API_KEY) {
    console.log('🔑 OPENAI_API_KEY length:', process.env.OPENAI_API_KEY.length);
    console.log('🔑 OPENAI_API_KEY preview:', process.env.OPENAI_API_KEY.substring(0, 10) + '...' + process.env.OPENAI_API_KEY.substring(process.env.OPENAI_API_KEY.length - 4));
  }
}

// Now import everything else
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import authRoutes from './routes/auth.routes.js';
import candidateRoutes from './routes/candidates.routes.js';
import jobRoutes from './routes/job.routes.js';
import reportRoutes from './routes/reports.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import aiRoutes from './routes/ai.routes.js';
import interviewRoutes from './routes/interviews.routes.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Startup banner
console.log('\n');
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║                                                            ║');
console.log('║   🚀 INTELLIGENS BACKEND SERVER                           ║');
console.log('║                                                            ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('\n');

// Log environment
console.log('📋 CONFIGURATION:');
console.log('─'.repeat(60));
console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`   Port: ${PORT}`);
console.log(`   Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
console.log(`   MongoDB: ${process.env.MONGODB_URI ? '✅ Configured' : '❌ Not configured'}`);
console.log(`   JWT Secret: ${process.env.JWT_SECRET ? '✅ Configured' : '❌ Not configured'}`);
console.log(`   AWS S3: ${process.env.AWS_S3_BUCKET ? '✅ Configured' : '⚠️ Not configured'}`);
console.log(`   Retell AI: ${process.env.RETELL_API_KEY ? '✅ Configured' : '⚠️ Not configured'}`);
console.log(`   OpenAI: ${process.env.OPENAI_API_KEY ? '✅ Configured' : '⚠️ Not configured'}`);
console.log(`   n8n Webhooks: ${process.env.N8N_WEBHOOK_EMAIL ? '✅ Configured' : '⚠️ Not configured'}`);
console.log('─'.repeat(60) + '\n');

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(requestLogger);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
console.log('📡 REGISTERING ROUTES:');
console.log('─'.repeat(60));
app.use('/api/auth', authRoutes);
console.log('   ✅ /api/auth - Authentication routes');
app.use('/api/candidates', candidateRoutes);
console.log('   ✅ /api/candidates - Candidate routes');
app.use('/api/reports', reportRoutes);
console.log('   ✅ /api/reports - Report routes');

app.use('/api/jobs', jobRoutes);
console.log('   ✅ /api/jobs - Job routes');
app.use('/api/upload', uploadRoutes);
console.log('   ✅ /api/upload - Upload routes');
app.use('/api/ai', aiRoutes);
console.log('   ✅ /api/ai - AI Assistant routes');
app.use('/api/interviews', interviewRoutes);
console.log('   ✅ /api/interviews - Interview routes');
console.log('─'.repeat(60) + '\n');

// Error handling
app.use(errorHandler);

// MongoDB Connection
const connectDB = async () => {
  console.log('🔌 CONNECTING TO DATABASE:');
  console.log('─'.repeat(60));

  try {
    const uri = process.env.MONGODB_URI as string;
    console.log(`   URI: ${uri?.replace(/:[^:@]+@/, ':***@')}`);

    await mongoose.connect(uri);

    console.log('   ✅ MongoDB connected successfully');
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   Host: ${mongoose.connection.host}`);
    console.log('─'.repeat(60) + '\n');
  } catch (error: any) {
    console.error('   ❌ MongoDB connection error:', error.message);
    console.error('─'.repeat(60) + '\n');
    console.error('💡 TROUBLESHOOTING:');
    console.error('   1. Check MONGODB_URI in .env file');
    console.error('   2. Verify MongoDB Atlas IP whitelist');
    console.error('   3. Ensure database user has correct permissions');
    console.error('   4. Check if password contains special characters (URL encode them)\n');
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log('═'.repeat(60));
    console.log('🎉 SERVER STARTED SUCCESSFULLY!');
    console.log('═'.repeat(60));
    console.log(`   🌐 Server: http://localhost:${PORT}`);
    console.log(`   📋 Health: http://localhost:${PORT}/health`);
    console.log(`   🔐 Auth: http://localhost:${PORT}/api/auth`);
    console.log('═'.repeat(60));
    console.log('\n📝 READY TO ACCEPT REQUESTS\n');
  });
};

startServer();

export default app;
