import { BaseButton } from "../../interfaces";
import { TicketModel } from "../../models/TicketsModel";
import Ticket from "../../features/Ticket";
import { ButtonInteraction, TextChannel } from "discord.js";
import BotClient from '../../classes/Client';
import Logger from '../../features/Logger';
import Utility from "../../classes/Utility";

export default <BaseButton>{
    customId: "claim",
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

        if (ticket.claimedBy) {
            return interaction.reply({
                content: 'This ticket has already been claimed!',
                ephemeral: true
            });
        }

        const ticketUser = await interaction.guild.members.fetch(ticket.userID);

        await ticket.updateOne({ claimedBy: interaction.user.id });

        (interaction.channel as TextChannel)?.permissionOverwrites.edit(ticketUser.id, {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true
        });

        if (embedTicket.dmUser) {
            await ticketUser.send({
                content: `Your ticket in ${interaction.guild.name} has been claimed by ${interaction.user.toString()}`
            });
        }

        interaction.reply({
            content: `Ticket has been claimed by ${interaction.user.toString()} | ${ticketUser.toString()}`
        });

        const logs = await Ticket.getLogs(interaction.guildId as string);

        if (!logs) return;

        const logsChannel = await Utility.getChannel(logs.channelID, interaction.client as BotClient);

        if (!logsChannel) { return; }
        else {
            try {
                (interaction.client as BotClient).ticketLogger.log('ticketClaimed', ticketChannel);
            } catch (error) {
                Logger.error(`An error occurred while logging the ticket: ${error}`);
            }
        }
    }
}