import { BaseButton } from "../../interfaces";
import { TicketModel } from "../../models/TicketsModel";
import Ticket from "../../features/Ticket";
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder, TextChannel, TextInputBuilder, TextInputStyle, ModalBuilder } from "discord.js";
import BotClient from "../../classes/Client";
import Utility from "../../classes/Utility";
import Logger from "../../features/Logger";

export default <BaseButton>{
    customId: "close",
    async execute(interaction: ButtonInteraction) {
        if (!interaction.guild) return;

        const embedTicket = await Ticket.getEmbed(interaction.guildId as string);

        if (!embedTicket) {
            return interaction.reply({
                content: 'The ticket system has not been set up for this server. Please set it up first.',
                ephemeral: true
            });
        }

        const ticket = await TicketModel.findOne({ guildID: interaction.guildId, channelID: interaction.channelId });

        if (!ticket) {
            return interaction.reply({
                content: 'This channel is not a ticket channel or there are no tickets in this channel',
                ephemeral: true
            });
        }

        const ticketChannel = await Utility.getChannel(ticket.channelID, interaction.client as BotClient);

        const actionRow = new ActionRowBuilder<TextInputBuilder>()
            .addComponents(
                new TextInputBuilder()
                    .setCustomId('reason')
                    .setLabel('Why are you closing this ticket?')
                    .setPlaceholder('Enter the reason for closing the ticket')
                    .setRequired(true)
                    .setStyle(TextInputStyle.Paragraph)
            )

        const modal = new ModalBuilder()
            .addComponents(actionRow)
            .setCustomId('close_ticket')
            .setTitle('Close Ticket');

        return await interaction.showModal(modal);
    }
}