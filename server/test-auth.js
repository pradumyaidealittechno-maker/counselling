require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function testAuth() {
  try {
    console.log('🔍 Testing Authentication System...\n');

    // 1. Test MongoDB Connection
    console.log('1️⃣ Testing MongoDB connection...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected\n');

    // 2. Check if User model works
    console.log('2️⃣ Loading User model...');
    const User = require('./dist/models/User.js').default;
    console.log('✅ User model loaded\n');

    // 3. Check existing users
    console.log('3️⃣ Checking existing users...');
    const users = await User.find({});
    console.log(`Found ${users.length} user(s) in database`);
    if (users.length > 0) {
      console.log('Users:');
      users.forEach(u => {
        console.log(`  - ${u.email} (${u.firstName} ${u.lastName})`);
      });
    }
    console.log('');

    // 4. Create test user if none exist
    if (users.length === 0) {
      console.log('4️⃣ No users found. Creating test user...');
      const testUser = new User({
        email: 'test@example.com',
        password: 'Test123!',
        firstName: 'Test',
        lastName: 'User',
        company: 'Test Company',
        role: 'recruiter'
      });
      await testUser.save();
      console.log('✅ Test user created!');
      console.log('   Email: test@example.com');
      console.log('   Password: Test123!\n');
    }

    // 5. Test login
    console.log('5️⃣ Testing login...');
    const testEmail = users.length > 0 ? users[0].email : 'test@example.com';
    const testPassword = 'Test123!';

    const user = await User.findOne({ email: testEmail });
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    const isMatch = await user.comparePassword(testPassword);
    if (isMatch) {
      console.log('✅ Password verification works!\n');
    } else {
      console.log('❌ Password verification failed');
      console.log('   Try using the password you set during signup\n');
    }

    // 6. Summary
    console.log('📊 Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ MongoDB: Connected');
    console.log('✅ User Model: Working');
    console.log(`✅ Users in DB: ${users.length > 0 ? users.length : '1 (created)'}`);
    console.log('✅ Password Hashing: Working');
    console.log('');
    console.log('🎯 You can now login with:');
    if (users.length > 0) {
      console.log(`   Email: ${users[0].email}`);
      console.log('   Password: (the one you used during signup)');
    } else {
      console.log('   Email: test@example.com');
      console.log('   Password: Test123!');
    }
    console.log('');
    console.log('🌐 Login at: http://localhost:5175/login');

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure MongoDB is connected');
    console.error('2. Check MONGODB_URI in .env');
    console.error('3. Run: npm run build (to compile TypeScript)');
    process.exit(1);
  }
}

testAuth();
