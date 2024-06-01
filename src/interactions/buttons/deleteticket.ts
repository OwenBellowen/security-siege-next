import { BaseButton } from "../../interfaces";
import {
    ButtonInteraction
} from "discord.js";
import { TicketModel } from "../../models/TicketsModel";
import Ticket from "../../features/Ticket";

export default <BaseButton>{
    customId: 'delete_ticket',
    async execute(interaction: ButtonInteraction) {
        if (!interaction.guild) return;

        if (!interaction.channel) return;

        const embedTicket = await Ticket.getEmbed(interaction.guildId as string);

        if (!embedTicket) {
            return interaction.reply({
                content: 'The ticket system has not been set up for this server. Please set it up first.',
                ephemeral: true
            });
        }
        
        const ticket = await TicketModel.findOne({ guildID: interaction.guildId, channelID: interaction.channel.id });

        if (!ticket) {
            return interaction.reply({
                content: 'This channel is not a ticket channel or there are no tickets in this channel',
                ephemeral: true
            });
        }

        await TicketModel.deleteOne({ guildID: interaction.guildId, channelID: interaction.channel.id });

        await interaction.channel.delete();

        if (embedTicket.dmUser) {
            const ticketUser = await interaction.guild.members.fetch(ticket.userID);

            await ticketUser.send({
                content: `Your ticket in ${interaction.guild.name} has been deleted by ${interaction.user.toString()}`
            });
        }
    }
}