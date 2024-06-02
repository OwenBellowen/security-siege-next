import {
    CommandInteraction,
    CommandInteractionOptionResolver,
    PermissionFlagsBits,
    SlashCommandBuilder,
    TextChannel,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    EmbedBuilder
} from "discord.js";
import { BaseCommand } from "../../interfaces";
import { TicketModel } from "../../models/TicketsModel";
import Ticket from "../../features/Ticket";
import Utility from "../../classes/Utility";
import BotClient from "../../classes/Client";
import Logger from "../../features/Logger";

export default <BaseCommand>{
    data: new SlashCommandBuilder()
        .setName('closeticket')
        .setDescription('Close a ticket in the current channel or in the specified channel')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The ticket channel')
                .setRequired(false))
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages | PermissionFlagsBits.Administrator),
    config: {
        category: 'ticket',
        examples: [
            '#closeticket',
        ],
        usage: '[channel]',
        permissions: ['ManageMessages', 'Administrator']
    },
    async execute(interaction: CommandInteraction) {
        if (!interaction.guild) return;

        const channel = (interaction.options as CommandInteractionOptionResolver).getChannel('channel') as TextChannel || interaction.channel as TextChannel;

        const embedTicket = await Ticket.getEmbed(interaction.guildId as string);

        if (!embedTicket) {
            return interaction.reply({
                content: 'The ticket system has not been set up for this server. Please set it up first.',
                ephemeral: true
            });
        }

        const ticket = await TicketModel.findOne({ guildID: interaction.guildId, channelID: channel.id });

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

        await TicketModel.updateOne({ guildID: interaction.guildId, channelID: channel.id }, { claimedBy: null });

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

        await channel.send({
            components: [actionRow],
            embeds: [embed]
        });

        await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
            ViewChannel: false
        });

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