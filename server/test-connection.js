require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing MongoDB connection...');
console.log('URI:', process.env.MONGODB_URI?.replace(/:[^:@]+@/, ':****@')); // Hide password

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connection successful!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ MongoDB connection failed:');
    console.error('Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check username and password are correct');
    console.error('2. Verify user exists in MongoDB Atlas → Database Access');
    console.error('3. Check IP whitelist in MongoDB Atlas → Network Access');
    console.error('4. URL encode special characters in password');
    process.exit(1);
  });
