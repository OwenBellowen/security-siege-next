import {
    CommandInteraction,
    CommandInteractionOptionResolver,
    PermissionFlagsBits,
    SlashCommandBuilder,
    TextChannel,
    ActionRowBuilder,
    TextInputBuilder,
    TextInputStyle,
    ModalBuilder
} from "discord.js";
import { BaseCommand } from "../../interfaces";
import { TicketModel } from "../../models/TicketsModel";
import Ticket from "../../features/Ticket";
import Utility from "../../classes/Utility";
import BotClient from "../../classes/Client";

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

        const actionRow = new ActionRowBuilder<TextInputBuilder>()
            .addComponents(
                new TextInputBuilder()
                    .setCustomId('reason')
                    .setLabel('Why are you closing this ticket?')
                    .setPlaceholder('Enter the reason for closing the ticket')
                    .setStyle(TextInputStyle.Paragraph)
            )

        const modal = new ModalBuilder()
            .addComponents(actionRow)
            .setCustomId('close_ticket')
            .setTitle('Close Ticket');

        return await interaction.showModal(modal);
    }
}