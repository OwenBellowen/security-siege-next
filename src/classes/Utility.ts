import { TextChannel } from "discord.js";
import BotClient from "./Client";

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

    public static async getChannel(channelID: string, client: BotClient): Promise<TextChannel> {
        return client.channels.cache.get(channelID) as TextChannel;
    }
}