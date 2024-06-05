import {
    SlashCommandBuilder,
    CommandInteraction,
    PermissionFlagsBits
} from "discord.js";
import { BaseCommand } from "../../interfaces";
import Ticket from "../../features/Ticket";

export default <BaseCommand>{
    data: new SlashCommandBuilder()
        .setName('toggledmticket')
        .setDescription('Toggles whether you want the bot to send a DM to the user when a ticket is closed, or claimed.')
        .setDMPermission(true)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator | PermissionFlagsBits.ManageMessages),
    config: {
        category: 'ticket',
        usage: '',
        examples: [],
        permissions: ["Administrator", "ManageMessages"]
    },
    async execute(interaction: CommandInteraction) {
        if (!interaction.guild) return;

        const embed = await Ticket.getEmbed(interaction.guildId as string);

        if (!embed) {
            return interaction.reply({
                content: 'The ticket system has not been set up for this server',
                ephemeral: true
            });
        }

        const dmUser = embed.dmUser;

        await embed.updateOne({ dmUser: !dmUser });

        return interaction.reply({
            content: `DMs for tickets have been ${!dmUser ? 'enabled' : 'disabled'}`
        });
    }
}