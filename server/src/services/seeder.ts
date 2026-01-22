import { User } from '../models/User.js';
import { Company } from '../models/Company.js';

export const seedAdmin = async () => {
    try {
        const adminEmail = 'admin@hr-solution.com';
        const adminPassword = 'admin123'; // Default password as requested

        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
            if (existingAdmin.role !== 'admin') {
                existingAdmin.role = 'admin';
                await existingAdmin.save();
                console.log('✅ Updated existing admin user role to admin');
            }
            return;
        }

        console.log('🌱 Seeding admin user...');

        // Ensure a company exists for the admin
        let company = await Company.findOne({ name: 'HR Solution Admin' });
        if (!company) {
            company = await Company.create({
                name: 'HR Solution Admin',
                industry: 'Technology',
                size: '1-10',
                settings: {
                    culturalDNAEnabled: true,
                    defaultInterviewDuration: 30
                }
            });
        }

        const adminUser = new User({
            email: adminEmail,
            password: adminPassword, // Will be hashed by pre-save hook
            firstName: 'System',
            lastName: 'Admin',
            company: company.name,
            companyId: company._id,
            jobTitle: 'Administrator',
            role: 'admin',
            isActive: true
        });

        await adminUser.save();
        console.log(`✅ Admin user seeded: ${adminEmail} / ${adminPassword}`);
    } catch (error) {
        console.error('❌ Error seeding admin:', error);
    }
};
