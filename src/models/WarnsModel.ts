import { model, Schema, Document } from 'mongoose';

export interface Warns extends Document {
    guildID: string;
    userID: string;
    warns: Array<{
        id: string;
        moderator: string;
        reason: string;
        timestamp: string; // Unix timestamp
    }>;
}

const WarnsSchema = new Schema({
    guildID: { type: String, required: true },
    userID: { type: String, required: true },
    warns: { type: Array, default: [] }
});

export default model<Warns>("Warns", WarnsSchema);