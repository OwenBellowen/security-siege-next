import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { BaseCommand } from "../../interfaces";

export default <BaseCommand>{
    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Bans a user from the server.")
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("The user to ban.")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("The reason for banning the user.")
                .setRequired(false)
        ),
    config: {
        category: "moderation",
        usage: "",
        examples: [],
        permissions: []
    },
    async execute(interaction: CommandInteraction) {
        await interaction.reply("Test");
    },
};