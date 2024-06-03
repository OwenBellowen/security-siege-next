import {
    TicketEmbedModel,
    ITicketCategoryQuestion,
    ITicketCategory,
    ITicketEmbed,
    TicketLogsModel
} from "../models/TicketsModel";

type CategoryField = "name" | "description" | "emoji" | "ticketName" | "staffRoles";

/**
 * Represents a Ticket class.
 */
export default class Ticket {
    /**
     * Creates a new ticket embed.
     * @param embed - The ticket embed data.
     * @returns A promise that resolves to the created embed.
     */
    public static async createEmbed(embed: ITicketEmbed) {
        return (await TicketEmbedModel.create(embed)).save();
    }

    /**
     * Retrieves the ticket embed for a guild.
     * @param guildID - The ID of the guild.
     * @returns A promise that resolves to the ticket embed.
     */
    public static async getEmbed(guildID: string) {
        return TicketEmbedModel.findOne({ guildID });
    }

    /**
     * Retrieves the ticket logs for a guild.
     * @param guildID - The ID of the guild.
     * @returns A promise that resolves to the ticket logs.
     */
    public static async getLogs(guildID: string) {
        return TicketLogsModel.findOne({ guildID });
    }

    /**
     * Adds a category to the ticket embed.
     * @param guildID - The ID of the guild.
     * @param category - The category to add.
     * @returns A promise that resolves to the updated embed.
     */
    public static async addCategory(guildID: string, category: ITicketCategory) {
        const embed = await Ticket.getEmbed(guildID);
        if (!embed) return null;

        if (!embed.categories) embed.categories = [];

        embed.categories.push(category);
        return embed.save();
    }

    /**
     * Removes a category from the ticket embed.
     * @param guildID - The ID of the guild.
     * @param codeName - The code name of the category to remove.
     * @returns A promise that resolves to the updated embed.
     */
    public static async removeCategory(guildID: string, codeName: string) {
        const embed = await Ticket.getEmbed(guildID);
        if (!embed) return null;

        if (!embed.categories) embed.categories = [];

        embed.categories = embed.categories.filter((category) => category.codeName !== codeName);
        return embed.save();
    }

    /**
     * Adds a question to a category in the ticket embed.
     * @param guildID - The ID of the guild.
     * @param codeName - The code name of the category.
     * @param question - The question to add.
     * @returns A promise that resolves to the updated embed.
     */
    public static async addQuestion(guildID: string, codeName: string, question: ITicketCategoryQuestion) {
        const embed = await Ticket.getEmbed(guildID);
        if (!embed) return null;

        if (!embed.categories) return null;

        const category = embed.categories.find((category) => category.codeName === codeName);
        if (!category) return null;

        return TicketEmbedModel.findOneAndUpdate(
            { guildID, "categories.codeName": codeName },
            { $push: { "categories.$.questions": question } },
            { new: true }
        );
    }

    /**
     * Removes a question from a category in the ticket embed.
     * @param guildID - The ID of the guild.
     * @param codeName - The code name of the category.
     * @param label - The label of the question to remove.
     * @returns A promise that resolves to the updated embed.
     */
    public static async removeQuestion(guildID: string, codeName: string, label: string) {
        const embed = await Ticket.getEmbed(guildID);
        if (!embed) return null;

        if (!embed.categories) embed.categories = [];

        const category = embed.categories.find((category) => category.codeName === codeName);
        if (!category) return null;

        if (!category.questions) category.questions = [];

        return TicketEmbedModel.findOneAndUpdate(
            { guildID, "categories.codeName": codeName },
            { $pull: { "categories.$.questions": { label } } },
            { new: true }
        );
    }

    /**
     * Updates a question in a category in the ticket embed.
     * @param guildID - The ID of the guild.
     * @param codeName - The code name of the category.
     * @param label - The label of the question to update.
     * @param question - The updated question.
     * @returns A promise that resolves to the updated embed.
     */
    public static async updateQuestion(guildID: string, codeName: string, label: string, question: ITicketCategoryQuestion) {
        const embed = await Ticket.getEmbed(guildID);
        if (!embed) return null;

        if (!embed.categories) embed.categories = [];

        const category = embed.categories.find((category) => category.codeName === codeName);
        if (!category) return null;

        if (!category.questions) category.questions = [];

        return TicketEmbedModel.findOneAndUpdate(
            { guildID, "categories.codeName": codeName, "categories.questions.label": label },
            { $set: { "categories.$.questions.$": question } },
            { new: true }
        );
    }

    /**
     * Updates a category in the ticket embed.
     * @param guildID - The ID of the guild.
     * @param codeName - The code name of the category.
     * @param field - The field to update.
     * @param value - The new value.
     * @returns A promise that resolves to the updated embed.
     */
    public static async updateCategory(guildID: string, codeName: string, field: CategoryField, value: string, action?: "add" | "remove") {
        const embed = await Ticket.getEmbed(guildID);
        if (!embed) return null;

        if (!embed.categories) embed.categories = [];

        if (field === "staffRoles") {
            if (action === "add") {
                return TicketEmbedModel.findOneAndUpdate(
                    { guildID, "categories.codeName": codeName },
                    { $push: { "categories.$.staffRoles": value } },
                    { new: true }
                );
            } else if (action === "remove") {
                return TicketEmbedModel.findOneAndUpdate(
                    { guildID, "categories.codeName": codeName },
                    { $pull: { "categories.$.staffRoles": value } },
                    { new: true }
                );
            }
        }

        return TicketEmbedModel.findOneAndUpdate(
            { guildID, "categories.codeName": codeName },
            { $set: { [`categories.$.${field}`]: value } },
            { new: true }
        );
    }
}