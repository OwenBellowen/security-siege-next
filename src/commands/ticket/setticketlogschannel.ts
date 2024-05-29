import {
    CommandInteraction,
    TextChannel,
    EmbedBuilder,
    SlashCommandBuilder,
    ChannelType,
    PermissionFlagsBits,
    CommandInteractionOptionResolver
} from 'discord.js';
import { BaseCommand } from '../../interfaces';
import { TicketLogsModel } from '../../models/TicketsModel';

export default <BaseCommand>{
    data: new SlashCommandBuilder()
        .setName('setticketlogschannel')
        .setDescription('Set the ticket logs channel for the server')
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('The channel to set as the ticket logs channel')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true))
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator | PermissionFlagsBits.ManageMessages),
    config: {
        category: 'ticket',
        usage: '<channel>',
        examples: [
            '#ticket-logs'
        ],
        permissions: ['Administrator']
    },
    async execute(interaction: CommandInteraction) {
        const options = interaction.options as CommandInteractionOptionResolver;
        const channel = options.getChannel('channel') as TextChannel;

        if (!channel) {
            return interaction.reply({
                content: 'Channel not found'
            });
        }

        const ticketLogs = await TicketLogsModel.findOne({ guildID: interaction.guildId });

        if (ticketLogs) {
            await ticketLogs.updateOne({ channelID: channel.id });

            return interaction.reply({
                content: `Ticket logs channel has been set to ${channel.toString()}`
            });
        }

        await TicketLogsModel.create({ guildID: interaction.guildId, channelID: channel.id });

        return interaction.reply({
            content: `Ticket logs channel has been set to ${channel.toString()}`
        });
    }
}