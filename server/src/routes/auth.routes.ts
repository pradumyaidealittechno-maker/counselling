import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Company } from '../models/Company.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  console.log('\n🔐 AUTH: Register attempt');
  console.log(`   Email: ${req.body.email}`);

  try {
    const { email, password, firstName, lastName, company, jobTitle, role } = req.body;

    // Validate input
    if (!email || !password || !firstName || !lastName || !company) {
      console.log('   ❌ Missing required fields');
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user exists
    console.log('   Checking if user exists...');
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('   ❌ Email already registered');
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Find or create company
    console.log('   Finding or creating company...');
    let companyDoc = await Company.findOne({ name: company });
    if (!companyDoc) {
      companyDoc = await Company.create({
        name: company,
        industry: 'Technology', // Default, can be updated later
        size: '1-10', // Default, can be updated later
        locations: [],
        settings: {
          culturalDNAEnabled: true,
          defaultInterviewDuration: 30,
        },
      });
      console.log(`   ✅ Company created: ${companyDoc._id}`);
    } else {
      console.log(`   ✅ Company found: ${companyDoc._id}`);
    }

    // Create user
    console.log('   Creating new user...');
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      company: companyDoc.name,
      companyId: companyDoc._id,
      jobTitle: jobTitle || undefined, // Optional field
      role: role || 'recruiter',
    });

    await user.save();
    console.log(`   ✅ User created: ${user._id}`);

    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    console.log('   ✅ Token generated');

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        company: user.company,
        role: user.role,
      },
    });
    console.log('   ✅ Registration successful\n');
  } catch (error: any) {
    console.error('   ❌ Register error:', error.message);
    res.status(500).json({ error: 'Failed to register user' });
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
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    console.log('   ✅ Token generated');

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        company: user.company,
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

export default router;

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

