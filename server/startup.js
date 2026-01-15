#!/usr/bin/env node

require('dotenv').config();
const { spawn } = require('child_process');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

async function setupDatabase() {
  try {
    log(colors.cyan, '\n🔧 Setting up database...\n');

    // Connect to MongoDB
    log(colors.blue, '📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    log(colors.green, '✅ MongoDB connected successfully\n');

    // Define User schema inline
    const userSchema = new mongoose.Schema({
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      company: { type: String, required: true },
      role: { type: String, default: 'recruiter' },
      isActive: { type: Boolean, default: true }
    }, { timestamps: true });

    userSchema.pre('save', async function(next) {
      if (!this.isModified('password')) return next();
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    });

    const User = mongoose.models.User || mongoose.model('User', userSchema);

    // Check for existing users
    log(colors.blue, '👥 Checking for existing users...');
    const userCount = await User.countDocuments();
    
    if (userCount === 0) {
      log(colors.yellow, '⚠️  No users found. Creating default admin user...\n');
      
      const adminUser = new User({
        email: 'admin@intelligens.app',
        password: 'Admin123!',
        firstName: 'Admin',
        lastName: 'User',
        company: 'Intelligens',
        role: 'admin'
      });

      await adminUser.save();
      
      log(colors.green, '✅ Default admin user created!\n');
      log(colors.cyan, '📝 Login Credentials:');
      log(colors.cyan, '   Email: admin@intelligens.app');
      log(colors.cyan, '   Password: Admin123!\n');
    } else {
      log(colors.green, `✅ Found ${userCount} existing user(s)\n`);
    }

    await mongoose.connection.close();
    log(colors.green, '✅ Database setup complete!\n');
    
    return true;
  } catch (error) {
    log(colors.red, `❌ Database setup failed: ${error.message}\n`);
    return false;
  }
}

async function startServer() {
  log(colors.cyan, '🚀 Starting server...\n');
  
  const server = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true
  });

  server.on('error', (error) => {
    log(colors.red, `❌ Failed to start server: ${error.message}`);
    process.exit(1);
  });

  server.on('close', (code) => {
    if (code !== 0) {
      log(colors.red, `❌ Server exited with code ${code}`);
      process.exit(code);
    }
  });
}

async function main() {
  log(colors.cyan, '\n╔════════════════════════════════════════╗');
  log(colors.cyan, '║   Intelligens Backend Startup          ║');
  log(colors.cyan, '╚════════════════════════════════════════╝\n');

  const dbReady = await setupDatabase();
  
  if (!dbReady) {
    log(colors.red, '❌ Cannot start server without database connection');
    log(colors.yellow, '\n💡 Troubleshooting:');
    log(colors.yellow, '   1. Check MONGODB_URI in .env file');
    log(colors.yellow, '   2. Verify MongoDB Atlas IP whitelist');
    log(colors.yellow, '   3. Ensure database user has correct permissions\n');
    process.exit(1);
  }

  await startServer();
}

main().catch(error => {
  log(colors.red, `❌ Startup failed: ${error.message}`);
  process.exit(1);
});
