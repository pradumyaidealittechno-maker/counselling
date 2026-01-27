import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Company } from '../models/Company.js';
import { PendingUser } from '../models/PendingUser.js';
import { sendOtpEmail } from '../services/email.service.js';
import { authenticate } from '../middleware/auth.js';
import axios from 'axios';

const router = express.Router();

// Helper to generate JWT token
const generateToken = (user: any) => {
  const payload = {
    id: user._id,
    email: user.email,
    jobTitle: user.jobTitle,
    role: user.role
  };

  const secret = process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod';

  const options: any = {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  };

  return jwt.sign(payload, secret, options);
};

// Initiate Registration (Step 1)
router.post('/register', async (req, res) => {
  console.log('\n🔐 AUTH: Initiate Register');
  console.log(`   Email: ${req.body.email}`);

  try {
    const { email, password, firstName, lastName, company, jobTitle } = req.body;

    // Validate input
    if (!email || !password || !firstName || !lastName || !company || !jobTitle) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // Hash password for temporary storage
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Save to PendingUser (upsert)
    await PendingUser.findOneAndUpdate(
      { email },
      {
        email,
        passwordHash,
        userData: { firstName, lastName, company, jobTitle },
        otp,
        otpExpires
      },
      { upsert: true, new: true }
    );

    // Send Email
    await sendOtpEmail(email, otp);

    console.log('   ✅ OTP sent and pending user created');
    res.json({ message: 'OTP sent successfully' });

  } catch (error: any) {
    console.error('   ❌ Register error:', error.message);
    res.status(500).json({ error: 'Failed to initiate registration' });
  }
});

// Verify OTP (Step 2)
router.post('/verify-otp', async (req, res) => {
  console.log('\n🔐 AUTH: Verify OTP');
  const { email, otp } = req.body;

  try {
    const pendingUser = await PendingUser.findOne({ email });

    if (!pendingUser) {
      return res.status(400).json({ error: 'Verification session expired or invalid' });
    }

    if (pendingUser.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    if (pendingUser.otpExpires < new Date()) {
      return res.status(400).json({ error: 'OTP expired' });
    }

    // Proceed to create real user
    const { firstName, lastName, company, jobTitle } = pendingUser.userData;

    // Find or create company
    let companyDoc = await Company.findOne({ name: company });
    if (!companyDoc) {
      companyDoc = await Company.create({
        name: company,
        industry: 'Technology',
        size: '1-10',
        locations: [],
        settings: {
          culturalDNAEnabled: true,
          defaultInterviewDuration: 30,
        },
      });
    }

    // Create user - NOTE: We bypass the model save hook for password to avoid double hashing
    // by using updateOne after initial save or constructing differently.
    // Actually, simplest is to create without password, then update.

    // HOWEVER, User model requires password.
    // So we set a dummy, then update.
    const user = new User({
      email,
      password: 'temp_password_placeholder',
      firstName,
      lastName,
      company: companyDoc.name,
      companyId: companyDoc._id,
      jobTitle,
      isActive: true,
    });

    await user.save();

    // Now update with the real hashed password
    await User.updateOne(
      { _id: user._id },
      { $set: { password: pendingUser.passwordHash } }
    );

    // Delete pending user
    await PendingUser.deleteOne({ _id: pendingUser._id });

    // Generate token
    const token = generateToken(user);

    // Trigger N8N webhook to notify admin about new user registration
    const adminWebhookUrl = process.env.N8N_WEBHOOK_EMAIL_Register_USER_TO_ADMIN;

    console.log('   ℹ️ Admin webhook URL configured:', adminWebhookUrl || 'NO');

    if (adminWebhookUrl) {
      console.log('   🚀 Sending webhook to:', adminWebhookUrl);
      try {
        await axios.post(adminWebhookUrl, {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          company: user.company,
          jobTitle: user.jobTitle,
          role: user.role,
          registrationDate: new Date().toISOString()
        });
        console.log('   ✅ Admin notification webhook sent successfully');
      } catch (webhookError: any) {
        console.error('   ❌ Failed to send admin notification webhook:', webhookError.message);
        // Continue execution - notification failure shouldn't block registration
      }
    }

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        company: user.company,
        jobTitle: user.jobTitle,
        role: user.role,
      },
    });

  } catch (error: any) {
    console.error('   ❌ Verify OTP error:', error.message);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  const { email } = req.body;

  try {
    const pendingUser = await PendingUser.findOne({ email });
    if (!pendingUser) {
      return res.status(404).json({ error: 'No pending registration found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    pendingUser.otp = otp;
    pendingUser.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await pendingUser.save();

    await sendOtpEmail(email, otp);
    res.json({ message: 'OTP resent successfully' });

  } catch (error: any) {
    res.status(500).json({ error: 'Failed to resend OTP' });
  }
});

// Login
router.post('/login', async (req, res) => {
  console.log('\n🔐 AUTH: Login attempt');
  console.log(`   Email: ${req.body.email}`);

  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log('   ❌ Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    console.log('   Looking up user...');
    const user = await User.findOne({ email });
    if (!user) {
      console.log('   ❌ User not found');
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    console.log(`   ✅ User found: ${user._id}`);

    // Check password
    console.log('   Verifying password...');
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('   ❌ Password mismatch');
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    console.log('   ✅ Password verified');

    // Check if active
    if (!user.isActive) {
      console.log('   ❌ Account inactive');
      return res.status(403).json({ error: 'Account is inactive' });
    }

    // Generate token
    const token = generateToken(user);
    console.log('   ✅ Token generated');

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        company: user.company,
        jobTitle: user.jobTitle,
        role: user.role,
      },
    });
    console.log('   ✅ Login successful\n');
  } catch (error: any) {
    console.error('   ❌ Login error:', error.message);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  console.log('\n🔐 AUTH: Get current user');

  try {
    const user = await User.findById((req as any).user.id).select('-password');
    if (!user) {
      console.log('   ❌ User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`   ✅ User retrieved: ${user.email}\n`);
    res.json(user);
  } catch (error: any) {
    console.error('   ❌ Get user error:', error.message);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user profile  
router.put('/update-profile', authenticate, async (req, res) => {
  console.log('\n🔐 AUTH: Update profile');

  try {
    const { firstName, lastName } = req.body;
    const userId = (req as any).user.id;

    if (!firstName || !lastName) {
      console.log('   ❌ Missing required fields');
      return res.status(400).json({ error: 'First name and last name are required' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName },
      { new: true, select: '-password' }
    );

    if (!user) {
      console.log('   ❌ User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`   ✅ Profile updated: ${user.email}\n`);
    res.json(user);
  } catch (error: any) {
    console.error('   ❌ Update profile error:', error.message);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
