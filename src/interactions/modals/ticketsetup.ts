import {
    ModalSubmitInteraction,
    EmbedBuilder
} from "discord.js";
import { BaseModal } from "../../interfaces";
import Ticket from "../../features/Ticket";

export default <BaseModal> {
    customId: "ticket-setup",
    async execute(interaction: ModalSubmitInteraction) {
        const title = interaction.fields.getTextInputValue("title");
        const description = interaction.fields.getTextInputValue("description");
        const channelID = interaction.fields.getTextInputValue("channel");

        if (!title || !description) {
            return interaction.reply({
                content: "Please fill in all the fields",
                ephemeral: true
            });
        }

        const ticket = await Ticket.createEmbed({
            guildID: interaction.guildId as string,
            channelID,
            title,
            description,
            categories: []
        });

        if (!ticket) {
            return interaction.reply({
                content: "An error occurred while setting up the ticket system",
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setTitle("Ticket System Set Up")
            .setDescription("The ticket system has been set up successfully")
            .addFields([
                {
                    name: "Title",
                    value: title
                },
                {
                    name: "Description",
                    value: description
                },
                {
                    name: "Channel",
                    value: interaction.client.channels.cache.get(channelID)?.toString() || "Unknown"
                }
            ])
            .setColor("Blurple");

        return interaction.reply({
            embeds: [embed]
        })
    }
}