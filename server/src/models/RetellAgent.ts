import mongoose, { Schema, Document } from 'mongoose';

export interface IRetellAgent extends Document {
    jobId: mongoose.Types.ObjectId;
    Prompt: string;
    agent_id: string;
    llm_id: string;
    status: string;
}

const RetellAgentSchema: Schema = new Schema({
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    Prompt: { type: String },
    agent_id: { type: String, required: true },
    llm_id: { type: String },
    status: { type: String, default: 'active' }
}, {
    collection: 'retell_agents',
    timestamps: true
});

export default mongoose.model<IRetellAgent>('RetellAgent', RetellAgentSchema);
