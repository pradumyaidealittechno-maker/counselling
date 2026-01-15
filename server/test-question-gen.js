// Test question generation
const axios = require('axios');

const jobData = {
  jobTitle: "Python Developer",
  jobDescription: "We are hiring a Python Developer with strong experience in FastAPI and AI-powered backend systems.",
  requiredSkills: ["Python", "FastAPI", "AI/ML"],
  experienceLevel: "mid",
  jobDNA: {
    skillDNA: [
      {
        id: "python-development",
        name: "Python Development",
        description: "Ability to write and maintain Python code",
        importance: "critical",
        signals: ["Experience with Python backend development"]
      }
    ],
    experienceDNA: [],
    behavioralDNA: [],
    communicationDNA: [],
    culturalDNA: []
  }
};

async function testQuestionGeneration() {
  try {
    console.log('Testing question generation...');
    console.log('Job Title:', jobData.jobTitle);
    console.log('Has DNA:', !!jobData.jobDNA);
    
    // Make request to test endpoint
    const response = await axios.post(
      'http://localhost:3001/api/jobs/696796966b55d8a074bc0a7f/test-questions',
      {},
      {
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5Njc4OTI2N2FjZDU5OTAyOWEzZTgwNyIsImVtYWlsIjoiYWRtaW5AaW50ZWxsaWdlbnMuYXBwIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzM2ODU5NjU0LCJleHAiOjE3Mzc0NjQ0NTR9.xyz' // Replace with real token
        }
      }
    );
    
    console.log('\n✅ Response:', response.data);
    console.log('Questions generated:', response.data.questionsGenerated);
    
  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
  }
}

testQuestionGeneration();
