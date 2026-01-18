
const mongoose = require('mongoose');

const uri = 'mongodb+srv://hrtool:ExWygBSZOGv8u7oo@cluster0.hzhg544.mongodb.net/hrtool?authSource=admin';

const candidateSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    status: String,
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    createdAt: Date
});

const Candidate = mongoose.model('Candidate', candidateSchema);

async function run() {
    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const candidates = await Candidate.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        console.log('Latest 5 Candidates:');
        console.log(JSON.stringify(candidates, null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.connection.close();
    }
}

run();
