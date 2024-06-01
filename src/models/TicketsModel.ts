import { model, Schema } from 'mongoose';

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
    categoryID: string; // The category ID where the embed is sent
    channelID: string; // The channel ID where the embed is sent
    title: string;
    description: string;
    startEmbed: boolean | false;
    dmUser?: boolean | false;
    categories?: ITicketCategory[];
}

export interface ITicket {
    guildID: string;
    channelID: string;
    userID: string;
    claimedBy: string;
    category: string;
}

export interface ITicketLogs {
    guildID: string;
    channelID: string;
}

export const TicketEmbedSchema = new Schema({
    guildID: { type: String, required: true },
    categoryID: { type: String, required: true },
    channelID: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    startEmbed: { type: Boolean, required: false, default: false },
    dmUser: { type: Boolean, required: false, default: false },
    categories: { type: Array<ITicketCategory>, required: false, default: [] }
});

export const TicketSchema = new Schema({
    guildID: { type: String, required: true },
    channelID: { type: String, required: true },
    userID: { type: String, required: true },
    claimedBy: { type: String, required: false },
    category: { type: String, required: true }
});

export const TicketLogsSchema = new Schema({
    guildID: { type: String, required: true },
    channelID: { type: String, required: true }
});

export const TicketEmbedModel = model<ITicketEmbed>('TicketEmbed', TicketEmbedSchema);
export const TicketModel = model<ITicket>('Ticket', TicketSchema);
export const TicketLogsModel = model<ITicketLogs>('TicketLogs', TicketLogsSchema);