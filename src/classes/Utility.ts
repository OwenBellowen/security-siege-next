import { CommandInteraction, EmbedBuilder, TextChannel } from "discord.js";
import BotClient from "./Client";
import { ITicketEmbed } from "../models/TicketsModel";

/**
 * Utility class with various helper methods.
 */
export default class Utility {
    /**
     * Asynchronously sleeps for the specified number of milliseconds.
     * @param ms - The number of milliseconds to sleep.
     * @returns A Promise that resolves after the specified time.
     */
    public static async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Capitalizes the first letter of a string.
     * @param str - The string to capitalize.
     * @returns The capitalized string.
     */
    public static capitalize(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Generates a UUID (Universally Unique Identifier) string.
     * @returns The generated UUID string.
     */
    public static uuid(): string {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
            const r = (Math.random() * 16) | 0,
                v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    /**
     * Retrieves a TextChannel object based on the provided channel ID.
     * @param channelID - The ID of the channel to retrieve.
     * @param client - The BotClient instance.
     * @returns A Promise that resolves to a TextChannel object.
     */
    public static async getChannel(channelID: string, client: BotClient): Promise<TextChannel> {
        return client.channels.cache.get(channelID) as TextChannel;
    }

    /**
     * Retrieves a message object based on the provided channel and message IDs.
     * @param client - The BotClient instance.
     * @param channelID - The ID of the channel to retrieve the message from.
     * @param messageID - The ID of the message to retrieve.
     * @returns A Promise that resolves to a message object.
     */
    public static async getMessage(client: BotClient, channelID: string, messageID: string) {
        return (await this.getChannel(channelID, client)).messages.fetch(messageID);
    }

    /**
     * Creates a ticket embed using the provided embed model and interaction.
     * @param embedModel - The embed model containing the title and description of the ticket embed.
     * @param interaction - The command interaction object.
     * @returns The created ticket embed as an instance of EmbedBuilder.
     */
    public static createTicketEmbed(embedModel: ITicketEmbed, interaction: CommandInteraction): EmbedBuilder {
        return new EmbedBuilder()
            .setTitle(embedModel.title)
            .setDescription(embedModel.description)
            .setColor("Aqua")
            .setFooter({ text: 'React with the button below to start a ticket', iconURL: interaction.client.user.displayAvatarURL() });
    }
}