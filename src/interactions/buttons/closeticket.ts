import { BaseButton } from "../../interfaces";
import { TicketModel } from "../../models/TicketsModel";
import Ticket from "../../features/Ticket";
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder, TextChannel } from "discord.js";
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

        if (!ticket.claimedBy) {
            return interaction.reply({
                content: 'This ticket has not been claimed yet!',
                ephemeral: true
            });
        }

        await TicketModel.updateOne({ guildID: interaction.guildId, channelID: interaction.channel?.id }, { claimedBy: null });

        const actionRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('delete_ticket')
                    .setLabel('Delete Ticket')
                    .setStyle(ButtonStyle.Danger)
            );

        const embed = new EmbedBuilder()
            .setTitle('Ticket Closed')
            .setDescription(`Ticket has been closed by ${interaction.user.toString()}`)
            .setColor('Red');

        await interaction.channel?.send({
            components: [actionRow],
            embeds: [embed]
        });

        await (interaction.channel as TextChannel)?.permissionOverwrites.edit(interaction.guild.members.cache.get(ticket.userID)?.id as string, {
            ViewChannel: false,
            SendMessages: false,
            ReadMessageHistory: false
        });

        if (embedTicket.dmUser) {
            await interaction.guild.members.cache.get(ticket.userID)?.send({
                content: `Your ticket in ${interaction.guild.name} has been closed by ${interaction.user.toString()}`
            });
        }

        interaction.reply({
            content: 'Ticket has been closed!',
            ephemeral: true
        });

        const logs = await Ticket.getLogs(interaction.guildId as string);

        if (!logs) return;

        const logsChannel = await Utility.getChannel(logs.channelID, interaction.client as BotClient);

        if (!logsChannel) { return; }
        else {
            try {
                (interaction.client as BotClient).ticketLogger.log('ticketClosed', ticketChannel);
            } catch (error) {
                Logger.error(`An error occurred while logging the ticket: ${error}`);
            }
        }
    }
}