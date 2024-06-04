import {
    CategoryChannel,
    ChannelType,
    CommandInteraction,
    CommandInteractionOptionResolver,
    PermissionFlagsBits,
    SlashCommandBuilder,
    TextChannel
} from "discord.js";
import { BaseCommand } from "../../interfaces";
import Ticket from "../../features/Ticket";
import { TicketModel } from "../../models/TicketsModel";
import Utility from "../../classes/Utility";
import BotClient from "../../classes/Client";
import Logger from "../../features/Logger";

export default <BaseCommand>{
    data: new SlashCommandBuilder()
        .setName('moveticket')
        .setDescription('Move a ticket to another category')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The ticket channel')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText))
        .addChannelOption(option =>
            option.setName('category')
                .setDescription('The category to move the ticket to')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildCategory))
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages | PermissionFlagsBits.Administrator),
    config: {
        category: 'ticket',
        examples: [
            '#moveticket #ticket-category',
        ],
        usage: '<channel> <category>',
        permissions: ['ManageMessages', 'Administrator']
    },
    async execute(interaction: CommandInteraction) {
        if (!interaction.guild) return;

        const options = interaction.options as CommandInteractionOptionResolver;
        const channel = options.getChannel('channel') as TextChannel;
        const category = options.getChannel('category') as CategoryChannel;

        if (!channel || !category) {
            return interaction.reply({
                content: 'Channel or category not found',
                ephemeral: true
            });
        }

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

        await channel.setParent(category.id);

        interaction.reply({
            content: `Ticket moved to ${category.name}`,
            ephemeral: true
        });

        const logs = await Ticket.getLogs(interaction.guildId as string);

        if (!logs) return;

        const logsChannel = Utility.getChannel(logs.channelID, interaction.client as BotClient);

        if (!logsChannel) return;

        try {
            await (interaction.client as BotClient).ticketLogger.log('ticketMoved', channel, category);
        } catch (error) {
            Logger.error(`An error occurred while logging the ticket: ${error}`);
        }
    }
}