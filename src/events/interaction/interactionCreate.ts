import { BaseEvent } from "../../interfaces";
import BotClient from "../../classes/Client";
import { CommandInteraction } from "discord.js";

export default <BaseEvent>{
    name: "interactionCreate",
    execute(client: BotClient, interaction: CommandInteraction) {
        if (!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);

        if (!command) return;

        if (command.config.category === "dev" && !client.config.owners.includes(interaction.user.id)) return interaction.reply({ content: "You do not have permission to use this command!", ephemeral: true });

        try {
            command.execute(interaction);
        } catch (error) {
            console.error(error);
            interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
        }
    }
};