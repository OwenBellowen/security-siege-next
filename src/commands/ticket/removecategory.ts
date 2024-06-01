import {
    CommandInteraction,
    CommandInteractionOptionResolver,
    SlashCommandBuilder,
    PermissionFlagsBits
} from 'discord.js';
import { BaseCommand } from '../../interfaces';
import Ticket from '../../features/Ticket';
import BotClient from '../../classes/Client';

export default <BaseCommand>{
    data: new SlashCommandBuilder()
        .setName('removecategory')
        .setDescription('Remove a category from the ticket system')
        .addStringOption(option =>
            option
                .setName('codename')
                .setDescription('Enter the code name of the category you want to remove')
                .setRequired(true)
        )
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator | PermissionFlagsBits.ManageMessages),
    config: {
        category: 'ticket',
        usage: '<codename>',
        examples: [
            'support',
            'help'
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

        const codename = (interaction.options as CommandInteractionOptionResolver).getString('codename');

        if (!embed.categories) {
            return interaction.reply({
                content: 'No categories found',
                ephemeral: true
            });
        }

        const category = embed.categories.find(c => c.codeName === codename);

        if (!category) {
            return interaction.reply({
                content: 'Category not found',
                ephemeral: true
            });
        }

        await embed.updateOne({
            categories: embed.categories.filter(c => c.codeName !== codename)
        });

        return interaction.reply({
            content: `Category \`${codename}\` has been removed`
        });
    }
}