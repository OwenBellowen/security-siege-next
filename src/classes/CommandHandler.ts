import { readdirSync } from "fs";
import { join } from "path";
import { BaseCommand } from "../interfaces";
import BotClient from "./Client";

import { REST, Routes } from "discord.js";
import { guildID } from "../../config/config.json";
import Logger from "../features/Logger";

/**
 * Represents a command handler that loads and registers commands for a Discord bot.
 */
export default class CommandHandler {
    /**
     * Creates a new instance of the CommandHandler class.
     * @param client The Discord bot client.
     */
    constructor(private client: BotClient) {}

    /**
     * Loads all the commands from the command folders and adds them to the client's command collection.
     */
    public loadCommands(): void {
        const commandFolders = readdirSync(join(__dirname, "..", "commands"));
        for (const folder of commandFolders) {
            const commandFiles = readdirSync(join(__dirname, "..", "commands", folder)).filter(file => file.endsWith(".ts"));
            for (const file of commandFiles) {
                const command = require(join(__dirname, "..", "commands", folder, file)).default as BaseCommand;
                this.client.commands.set(command.data.name, command);
            }
        }

        Logger.success("Commands loaded.");
    }

    /**
     * Registers the application commands with Discord.
     * @throws An error if no token or client ID is provided.
     */
    public async registerCommands(): Promise<void> {
        if (!process.env.TOKEN) throw new Error("No token provided.");

        const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

        const commands = this.client.commands.map(command => command.data.toJSON());
        try {
            Logger.info("Started registering application commands.");

            if (!process.env.CLIENT_ID) throw new Error("No client ID provided.");

            // Register the commands globally
            // await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });

            // Remove all global commands
            // await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: [] })
            //     .then(() => Logger.info("Successfully removed all global commands."));

            // Register the commands for a specific guild
            await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, guildID), { body: commands });

            Logger.success("Successfully registered application commands.");
        } catch (error) {
            console.error(error);
        }
    }
}