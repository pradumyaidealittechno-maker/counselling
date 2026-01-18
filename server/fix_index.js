
const mongoose = require('mongoose');

const uri = 'mongodb+srv://hrtool:ExWygBSZOGv8u7oo@cluster0.hzhg544.mongodb.net/hrtool?authSource=admin';

async function run() {
    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        try {
            await mongoose.connection.collection('candidates').dropIndex('interviewCode_1');
            console.log('✅ Index `interviewCode_1` dropped successfully.');
        } catch (e) {
            console.log('⚠️ Index drop failed (might not exist):', e.message);
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.connection.close();
    }
}

run();
