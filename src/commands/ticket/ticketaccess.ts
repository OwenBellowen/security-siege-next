import {
    CommandInteraction,
    CommandInteractionOptionResolver,
    Role,
    PermissionFlagsBits,
    SlashCommandBuilder
} from "discord.js";
import Ticket from "../../features/Ticket";
import { BaseCommand } from "../../interfaces";
import { TicketEmbedModel } from "../../models/TicketsModel";

export default <BaseCommand>{
    data: new SlashCommandBuilder()
        .setName('ticketaccess')
        .setDescription('Allow or disallow a role to access/open a ticket')
        .addRoleOption(option =>
            option
                .setName('role')
                .setDescription('Enter the role you want to allow')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('action')
                .setDescription('Enter the action you want to perform')
                .setRequired(true)
                .addChoices(
                    { name: 'Allow', value: 'allow' },
                    { name: 'Disallow', value: 'disallow' }
                )
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
        const action = (interaction.options as CommandInteractionOptionResolver).getString('action') as string;

        if (!role) {
            return interaction.reply({
                content: 'Please provide a valid role',
                ephemeral: true
            });
        }

        if (action === 'allow') {
            if (embed.allowedRoles.includes(role.id)) {
                return interaction.reply({
                    content: 'This role already has access to the ticket system',
                    ephemeral: true
                });
            }

            embed.allowedRoles.push(role.id);
        } else {
            if (!embed.allowedRoles.includes(role.id)) {
                return interaction.reply({
                    content: 'This role does not have access to the ticket system',
                    ephemeral: true
                });
            }

            embed.allowedRoles = embed.allowedRoles.filter(r => r !== role.id);
        }

        await TicketEmbedModel.findOneAndUpdate(
            { guildID: interaction.guildId as string },
            { allowedRoles: embed.allowedRoles }
        );

        interaction.reply({
            content: `The role ${role.toString()} has been ${action === 'allow' ? 'allowed' : 'disallowed'} to access the ticket system`,
            ephemeral: true
        });
    }
}