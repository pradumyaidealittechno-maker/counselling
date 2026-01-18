const mongoose = require('mongoose');

// Read MongoDB URI from environment or use default
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hr_solution_db';

async function checkExperienceField() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const candidateSchema = new mongoose.Schema({}, { strict: false });
    const Candidate = mongoose.model('Candidate', candidateSchema, 'candidates');

    // Find the most recent candidate
    const recentCandidate = await Candidate.findOne().sort({ createdAt: -1 });
    
    if (recentCandidate) {
      console.log('\n📋 Most Recent Candidate:');
      console.log('Name:', recentCandidate.firstName, recentCandidate.lastName);
      console.log('Email:', recentCandidate.email);
      console.log('Experience Field Present:', 'experience' in recentCandidate);
      console.log('Experience Value:', recentCandidate.experience);
      console.log('\n📄 Full Document:');
      console.log(JSON.stringify(recentCandidate.toObject(), null, 2));
    } else {
      console.log('❌ No candidates found in database');
    }

    // Find candidate with experience field
    const withExperience = await Candidate.findOne({ experience: { $exists: true, $ne: null } });
    if (withExperience) {
      console.log('\n✅ Found candidate with experience field:');
      console.log('Name:', withExperience.firstName, withExperience.lastName);
      console.log('Experience:', withExperience.experience);
    } else {
      console.log('\n❌ No candidates with experience field found');
    }

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkExperienceField();
