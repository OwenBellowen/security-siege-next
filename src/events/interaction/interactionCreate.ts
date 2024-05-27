import { BaseEvent } from "../../interfaces";
import BotClient from "../../classes/Client";
import { CommandInteraction, AutocompleteInteraction } from "discord.js";
import Logger from "../../features/Logger";

export default <BaseEvent>{
    name: "interactionCreate",
    async execute(client: BotClient, interaction: CommandInteraction | AutocompleteInteraction) {
        if (interaction.isChatInputCommand()) {
            if (!interaction.isCommand()) return;

            const command = client.commands.get(interaction.commandName);

            if (!command) return;

            if (command.config.category === "dev" && !client.config.owners.includes(interaction.user.id)) return interaction.reply({ content: "You do not have permission to use this command!", ephemeral: true });

            try {
                await command.execute(interaction);
            } catch (error) {
                Logger.error(error as string);
                interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
            }
        }

        if (interaction.isAutocomplete()) {
            const command = client.commands.get(interaction.commandName);

            if (!command || !command.autocomplete) return;

            try {
                await command.autocomplete(interaction);
            } catch (error) {
                Logger.error(error as string);
            }
        }
    }
};