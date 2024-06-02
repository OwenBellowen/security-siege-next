import {
    CommandInteraction,
    CommandInteractionOptionResolver,
    EmbedBuilder,
    Role,
    PermissionFlagsBits,
    SlashCommandBuilder
} from "discord.js";
import Ticket from "../../features/Ticket";
import { BaseCommand } from "../../interfaces";
import BotClient from "../../classes/Client";
import { TicketEmbedModel } from "../../models/TicketsModel";

export default <BaseCommand>{
    data: new SlashCommandBuilder()
        .setName('allowticketaccess')
        .setDescription('Allow a role to access/open a ticket')
        .addRoleOption(option =>
            option
                .setName('role')
                .setDescription('Enter the role you want to allow')
                .setRequired(true)
        )
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator | PermissionFlagsBits.ManageMessages),
    config: {
        category: 'ticket',
        usage: '<role>',
        examples: [
            'Support Team'
        ],
        permissions: ['Administrator', 'ManageMessages']
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

        const role = (interaction.options as CommandInteractionOptionResolver).getRole('role') as Role;

        if (!role) {
            return interaction.reply({
                content: 'Please provide a valid role',
                ephemeral: true
            });
        }

        if (embed.allowedRoles.includes(role.id)) {
            return interaction.reply({
                content: 'This role already has access to the ticket system',
                ephemeral: true
            });
        }

        embed.allowedRoles.push(role.id);

        const updated = await TicketEmbedModel.findOneAndUpdate({ guildID: interaction.guildId as string }, { allowedRoles: embed.allowedRoles });
        
        if (!updated) {
            return interaction.reply({
                content: 'An error occurred while updating the ticket system',
                ephemeral: true
            });
        }

        await updated.save();

        interaction.reply({
            content: `The role ${role.name} has been allowed to access the ticket system`,
            ephemeral: true
        });
    }
}