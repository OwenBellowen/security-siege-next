import { time } from 'discord.js';
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
    allowedRoles: string[];
    blacklistedRoles: string[];
    dmUser?: boolean | false;
    ticketCategoryID?: string; // The category ID where the ticket will be created (if not specified, it will be created in the same category as the embed)
    categories?: ITicketCategory[];
}

export interface ITicket {
    guildID: string;
    channelID: string;
    userID: string;
    claimedBy: string;
    category: string;
    createdAt?: string;
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
    allowedRoles: { type: Array<String>, required: false, default: [] },
    blacklistedRoles: { type: Array<String>, required: false, default: [] },
    dmUser: { type: Boolean, required: false, default: false },
    ticketCategoryID: { type: String, required: false, default: null },
    categories: { type: Array<ITicketCategory>, required: false, default: [] }
});

export const TicketSchema = new Schema({
    guildID: { type: String, required: true },
    channelID: { type: String, required: true },
    userID: { type: String, required: true },
    claimedBy: { type: String, required: false },
    category: { type: String, required: true },
    createdAt: { type: String, required: false, default: time() }
});

export const TicketLogsSchema = new Schema({
    guildID: { type: String, required: true },
    channelID: { type: String, required: true }
});

export const TicketEmbedModel = model<ITicketEmbed>('TicketEmbed', TicketEmbedSchema);
export const TicketModel = model<ITicket>('Ticket', TicketSchema);
export const TicketLogsModel = model<ITicketLogs>('TicketLogs', TicketLogsSchema);