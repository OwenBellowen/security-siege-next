import { CommandInteraction, SlashCommandBuilder, EmbedBuilder } from "discord.js";
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
        const botPing = Date.now() - interaction.createdTimestamp;
        const apiPing = Math.round(interaction.client.ws.ping);

        const embed = new EmbedBuilder()
            .setTitle("Pong!")
            .setDescription(`Bot Ping: ${botPing}ms\nAPI Ping: ${apiPing}ms`)
            .setColor("Aqua");

        await interaction.reply({ embeds: [embed] });
    },
};