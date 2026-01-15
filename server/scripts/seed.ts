import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { User } from '../src/models/User.js';
import { Company } from '../src/models/Company.js';
import Job from '../src/models/Job.js';

// Load .env from the server root directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Job.deleteMany({});
    await Company.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create company
    const company = await Company.create({
      name: 'Intelligens',
      industry: 'Technology',
      size: '11-50',
      locations: ['Remote', 'New York, NY'],
      settings: {
        culturalDNAEnabled: true,
        defaultInterviewDuration: 30,
      },
    });
    console.log('✅ Created company');

    // Create admin user
    const admin = await User.create({
      email: 'admin@intelligens.app',
      password: 'Admin123!',
      firstName: 'Admin',
      lastName: 'User',
      company: company.name,
      companyId: company._id,
      role: 'admin',
    });
    console.log('✅ Created admin user');

    // Create sample jobs
    const jobs = await Job.create([
      {
        title: 'Senior Full Stack Developer',
        description: 'We are looking for an experienced full stack developer with strong JavaScript skills.',
        company: 'Intelligens',
        location: 'Remote',
        employmentType: 'full-time',
        experienceLevel: 'senior',
        requiredSkills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
        optionalSkills: ['AWS', 'Docker', 'MongoDB'],
        status: 'active',
        createdBy: admin._id,
        jobDNA: {
          skillDNA: [
            {
              id: 'javascript-expert',
              name: 'JavaScript Expertise',
              description: 'Deep understanding of JavaScript fundamentals and modern ES6+ features',
              importance: 'critical',
              signals: ['Can explain closures and prototypes', 'Uses async/await effectively', 'Understands event loop'],
            },
            {
              id: 'react-proficiency',
              name: 'React Proficiency',
              description: 'Strong experience with React and its ecosystem',
              importance: 'critical',
              signals: ['Builds reusable components', 'Manages state effectively', 'Understands hooks'],
            },
          ],
          experienceDNA: [
            {
              id: 'senior-level',
              name: 'Senior-Level Experience',
              description: '5+ years of professional software development',
              importance: 'high',
              signals: ['Led technical projects', 'Mentored junior developers', 'Made architectural decisions'],
            },
          ],
          behavioralDNA: [
            {
              id: 'problem-solver',
              name: 'Problem Solver',
              description: 'Approaches challenges systematically and creatively',
              importance: 'high',
              signals: ['Breaks down complex problems', 'Considers multiple solutions', 'Learns from failures'],
            },
          ],
          communicationDNA: [
            {
              id: 'clear-communicator',
              name: 'Clear Communicator',
              description: 'Explains technical concepts clearly to various audiences',
              importance: 'high',
              signals: ['Writes clear documentation', 'Effective in code reviews', 'Good presentation skills'],
            },
          ],
          culturalDNA: [
            {
              id: 'collaborative',
              name: 'Collaborative',
              description: 'Works well in team environments',
              importance: 'medium',
              signals: ['Shares knowledge', 'Helps teammates', 'Open to feedback'],
            },
          ],
        },
      },
      {
        title: 'Frontend Developer',
        description: 'Join our team as a frontend developer specializing in React.',
        company: 'Intelligens',
        location: 'New York, NY',
        employmentType: 'full-time',
        experienceLevel: 'mid',
        requiredSkills: ['React', 'JavaScript', 'CSS', 'HTML'],
        optionalSkills: ['TypeScript', 'Next.js', 'Tailwind CSS'],
        status: 'active',
        createdBy: admin._id,
      },
    ]);
    console.log('✅ Created sample jobs');

    console.log('\n📊 Seed Summary:');
    console.log('================');
    console.log(`Admin Email: admin@intelligens.app`);
    console.log(`Admin Password: Admin123!`);
    console.log(`Jobs Created: ${jobs.length}`);
    console.log('\n✅ Database seeded successfully!');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
