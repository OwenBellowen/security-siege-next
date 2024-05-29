import { BaseButton } from "../../interfaces";
import {
    ButtonInteraction
} from "discord.js";
import { TicketModel } from "../../models/TicketsModel";

export default <BaseButton>{
    customId: 'delete_ticket',
    async execute(interaction: ButtonInteraction) {
        if (!interaction.guild) return;

        if (!interaction.channel) return;

        const ticket = await TicketModel.findOne({ guildID: interaction.guildId, channelID: interaction.channel.id });

        if (!ticket) {
            return interaction.reply({
                content: 'This channel is not a ticket channel or there are no tickets in this channel',
                ephemeral: true
            });
        }

        await TicketModel.deleteOne({ guildID: interaction.guildId, channelID: interaction.channel.id });

        await interaction.channel.delete();
    }
}