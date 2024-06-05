import { BaseButton } from "../../interfaces";
import {
    ButtonInteraction
} from "discord.js";
import { TicketModel } from "../../models/TicketsModel";
import Ticket from "../../features/Ticket";
import BotClient from "../../classes/Client";
import Utility from "../../classes/Utility";
import Logger from "../../features/Logger";
import { createTranscript } from "discord-html-transcripts";

export default <BaseButton>{
    customId: 'delete_ticket',
    async execute(interaction: ButtonInteraction) {
        if (!interaction.guild) return;

        const embedTicket = await Ticket.getEmbed(interaction.guildId as string);

        if (!embedTicket) {
            return interaction.reply({
                content: 'The ticket system has not been set up for this server. Please set it up first.',
                ephemeral: true
            });
        }

        const ticket = await TicketModel.findOne({ guildID: interaction.guildId, channelID: interaction.channel?.id });

        if (!ticket) {
            return interaction.reply({
                content: 'This channel is not a ticket channel or there are no tickets in this channel',
                ephemeral: true
            });
        }

        const ticketChannel = await Utility.getChannel(ticket.channelID, interaction.client as BotClient);

        const logs = await Ticket.getLogs(interaction.guildId as string);

        if (!logs) return;

        const logsChannel = await Utility.getChannel(logs.channelID, interaction.client as BotClient);

        if (!logsChannel) { return; }

        // @ts-ignore
        const transcript = await createTranscript(ticketChannel);

        try {
            await (interaction.client as BotClient).ticketLogger.log('ticketDeleted', ticketChannel);
        } catch (error) {
            Logger.error(`An error occurred while logging the ticket: ${error}`);
        }

        await TicketModel.deleteOne({ guildID: interaction.guildId, channelID: interaction.channel?.id });

        await interaction.channel?.delete();

        if (embedTicket.dmUser) {
            const ticketUser = await interaction.guild.members.fetch(ticket.userID);

            await ticketUser.send({
                content: `Your ticket in ${interaction.guild.name} has been deleted by ${interaction.user.toString()}`
            });
        }
    }
}