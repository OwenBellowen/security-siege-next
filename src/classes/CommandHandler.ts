import { readdirSync } from "fs";
import { join } from "path";
import { BaseCommand } from "../interfaces";
import BotClient from "./Client";

import { REST, Routes, SlashCommandBuilder } from "discord.js";
import { guildID } from "../../config/config.json";
import Logger from "./Logger";

export default class CommandHandler {
    constructor(private client: BotClient) {}

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

    public async registerCommands(): Promise<void> {
        if (!process.env.TOKEN) throw new Error("No token provided.");

        const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

        const commands = this.client.commands.map(command => {
            (command.data as SlashCommandBuilder).setDMPermission(false);
            return command.data.toJSON();
        });
        try {
            Logger.info("Started registering application commands.");

            if (!process.env.CLIENT_ID) throw new Error("No client ID provided.");

            await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, guildID), { body: commands });

            Logger.success("Successfully registered application commands.");
        } catch (error) {
            console.error(error);
        }
    }
}