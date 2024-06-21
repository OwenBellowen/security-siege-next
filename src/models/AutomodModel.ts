import { model, Schema, Document } from 'mongoose';

export interface Automod extends Document {
    guildID: string;

    // By default, automod is disabled
    enabled: boolean;
    modules: {
        // Automod to check for gifs
        gifs: {
            // By default, gifs module is disabled
            status: boolean;

            // Ignore channelIDs
            ignoredChannels: Array<string>;
        };

        // Automod to check for links
        links: boolean;

        // Automod to check for words
        words: boolean;
    };
    words: Array<string>;
}

const AutomodSchema = new Schema({
    guildID: { type: String, required: true },
    enabled: { type: Boolean, default: false },
    modules: {
        gifs: {
            status: { type: Boolean, default: false },
            ignoredChannels: { type: Array, default: [] }
        },
        links: { type: Boolean, default: false },
        words: { type: Boolean, default: false }
    },
    words: { type: Array, default: [] }
});

export default model<Automod>("Automod", AutomodSchema);