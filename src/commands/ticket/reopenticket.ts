import {
    CommandInteraction,
    PermissionFlagsBits,
    SlashCommandBuilder,
    TextChannel
} from "discord.js";
import { BaseCommand } from "../../interfaces";
import Ticket from "../../features/Ticket";
import { TicketModel } from "../../models/TicketsModel";
import BotClient from "../../classes/Client";
import Utility from "../../classes/Utility";
import Logger from "../../features/Logger";

export default <BaseCommand>{
    data: new SlashCommandBuilder()
        .setName("reopenticket")
        .setDescription("Reopen a closed ticket")
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages | PermissionFlagsBits.Administrator),
    config: {
        category: "ticket",
        usage: "",
        examples: [],
        permissions: ["ManageMessages", "Administrator"]
    },
    async execute(interaction: CommandInteraction) {
        if (!interaction.guild) return;

        const channel = interaction.channel as TextChannel;

        const embedTicket = await Ticket.getEmbed(interaction.guildId as string);

        if (!embedTicket) {
            return interaction.reply({
                content: "The ticket system has not been set up for this server. Please set it up first.",
                ephemeral: true
            });
        }

        const ticket = await TicketModel.findOne({ guildID: interaction.guildId, channelID: channel.id });

        if (!ticket) {
            return interaction.reply({
                content: "This channel is not a ticket channel or there are no tickets in this channel",
                ephemeral: true
            });
        }

        if (ticket.claimedBy) {
            return interaction.reply({
                content: "You cannot reopen a ticket that is already claimed",
                ephemeral: true
            });
        }

        await channel.permissionOverwrites.edit(ticket.userID, {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true
        });

        await TicketModel.updateOne({ guildID: interaction.guildId, channelID: channel.id }, { claimedBy: null });
        
        await channel.send({
            content: `Ticket reopened by ${interaction.user.toString()} | <@${ticket.userID}>`,
        });

        const logs = await Ticket.getLogs(interaction.guildId as string);

        if (!logs) return;

        const logsChannel = Utility.getChannel(logs.channelID, interaction.client as BotClient);

        if (!logsChannel) return;

        try {
            await (interaction.client as BotClient).ticketLogger.log("ticketReopened", channel);
        } catch (error) {
            Logger.error(`An error occurred while logging the ticket: ${error}`);
        }
    }
}