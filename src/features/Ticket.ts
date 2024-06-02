import {
    TicketEmbedModel,
    ITicketCategoryQuestion,
    ITicketCategory,
    ITicketEmbed,
    TicketLogsModel
} from "../models/TicketsModel";

export default class Ticket {
    public static async createEmbed(embed: ITicketEmbed) {
        return (await TicketEmbedModel.create(embed)).save();
    }

    public static async getEmbed(guildID: string) {
        return await TicketEmbedModel.findOne({ guildID });
    }

    public static async getLogs(guildID: string) {
        return await TicketLogsModel.findOne({ guildID });
    }

    public static async addCategory(guildID: string, category: ITicketCategory) {
        const embed = await Ticket.getEmbed(guildID);
        if (!embed) return null;

        if (!embed.categories) embed.categories = [];

        embed.categories.push(category);
        return await embed.save();
    }

    public static async removeCategory(guildID: string, codeName: string) {
        const embed = await Ticket.getEmbed(guildID);
        if (!embed) return null;

        if (!embed.categories) embed.categories = [];

        embed.categories = embed.categories.filter((category) => category.codeName !== codeName);
        return await embed.save();
    }

    public static async addQuestion(guildID: string, codeName: string, question: ITicketCategoryQuestion) {
        const embed = await Ticket.getEmbed(guildID);
        if (!embed) return null;

        if (!embed.categories) return null;

        const category = embed.categories.find((category) => category.codeName === codeName);
        if (!category) return null;

        return await TicketEmbedModel.findOneAndUpdate(
            { guildID, "categories.codeName": codeName },
            { $push: { "categories.$.questions": question } },
            { new: true }
        );
    }

    public static async removeQuestion(guildID: string, codeName: string, label: string) {
        const embed = await Ticket.getEmbed(guildID);
        if (!embed) return null;

        if (!embed.categories) embed.categories = [];

        const category = embed.categories.find((category) => category.codeName === codeName);
        if (!category) return null;

        if (!category.questions) category.questions = [];

        return await TicketEmbedModel.findOneAndUpdate(
            { guildID, "categories.codeName": codeName },
            { $pull: { "categories.$.questions": { label } } },
            { new: true }
        );
    }
}