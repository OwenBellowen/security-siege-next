import { model, Schema, Document } from 'mongoose';

export interface ITicketCategoryQuestion {
    id: string;
    label: string;
    placeholder: string;
    type: "SHORT" | "PARAGRAPH";
    maxLength?: number | 1000;
}

export interface ITicketCategory {
    guildID: string;
    codeName: string;
    name: string;
    description: string;
    emoji: string;
    /**
     * Some parameters to remember are: {USERNAME}, {USERID}
     * These parameters are used to create the ticket channel name. E.g ticket-{USERNAME}-{USERID}
     */
    ticketName: string;
    staffRoles: string[]; // Category specific staff roles that can view the ticket
    questions: ITicketCategoryQuestion[];
}

export interface ITicketEmbed {
    guildID: string;
    channelID: string; // The channel ID where the embed is sent
    title: string;
    description: string;
    categories?: ITicketCategory[];
}

export interface ITicketLogs {
    guildID: string;
    channelID: string;
}

export const TicketEmbedSchema = new Schema({
    guildID: { type: String, required: true },
    channelID: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    categories: { type: Array<ITicketCategory>, required: false, default: [] }
});

export const TicketLogsSchema = new Schema({
    guildID: { type: String, required: true },
    channelID: { type: String, required: true }
});

export const TicketEmbedModel = model<ITicketEmbed>('TicketEmbed', TicketEmbedSchema);
export const TicketLogsModel = model<ITicketLogs>('TicketLogs', TicketLogsSchema);