import {
    CommandInteraction,
    CommandInteractionOptionResolver,
    PermissionFlagsBits,
    SlashCommandBuilder,
    TextChannel
} from "discord.js";
import { BaseCommand } from "../../interfaces";
import { TicketModel } from "../../models/TicketsModel";
import Ticket from "../../features/Ticket";

export default <BaseCommand>{
    data: new SlashCommandBuilder()
        .setName('claimticket')
        .setDescription('Claim a ticket in the current channel or in the specified channel')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The ticket channel')
                .setRequired(false))
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages | PermissionFlagsBits.Administrator),
    config: {
        category: 'ticket',
        examples: [
            '#claimticket',
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

        if (ticket.claimedBy) {
            return interaction.reply({
                content: 'This ticket has already been claimed!',
                ephemeral: true
            });
        }

        const ticketUser = await interaction.guild.members.fetch(ticket.userID);

        await TicketModel.updateOne({ guildID: interaction.guildId, channelID: channel.id }, { claimedBy: interaction.user.id });

        await channel.send(`Ticket has been claimed by ${interaction.user.toString()}! ${ticketUser.toString()} please wait for a staff member to assist you.`);

        await channel.permissionOverwrites.edit(ticket.userID, {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true
        });

        return interaction.reply({
            content: 'Ticket has been claimed!',
            ephemeral: true
        });
    }
}