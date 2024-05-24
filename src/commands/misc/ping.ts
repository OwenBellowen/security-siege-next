import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { BaseCommand } from "../../interfaces";

export default <BaseCommand>{
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with Pong!")
        .setDMPermission(false),
    config: {
        category: "misc",
        usage: "",
        examples: [],
        permissions: []
    },
    async execute(interaction: CommandInteraction) {
        await interaction.reply("Pong!");
    },
};