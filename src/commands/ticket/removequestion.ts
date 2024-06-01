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
        .setName('removequestion')
        .setDescription('Remove a question from the category')
        .addStringOption(option =>
            option
                .setName('codename')
                .setDescription('Enter the code name of the category')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('question')
                .setDescription('Enter the question you want to remove')
                .setRequired(true)
        )
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator | PermissionFlagsBits.ManageMessages),
    config: {
        category: 'ticket',
        usage: '<codename> <questionid>',
        examples: [
            'support test',
            'help test2'
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

        if (!embed.categories) {
            return interaction.reply({
                content: 'There are no categories to remove a question from',
                ephemeral: true
            });
        }

        const codeName = (interaction.options as CommandInteractionOptionResolver).getString('codename') as string;
        const question = (interaction.options as CommandInteractionOptionResolver).getString('question') as string;

        (interaction.client as BotClient).ticketCache.set('codeName', codeName);
        (interaction.client as BotClient).ticketCache.set('question', question);

        const category = embed.categories.find((category) => category.codeName === codeName);

        if (!category) {
            return interaction.reply({
                content: `The category with the code name \`${codeName}\` does not exist`,
                ephemeral: true
            });
        }

        const questionIndex = category.questions.findIndex((q) => q.id === question);

        category.questions.splice(questionIndex, 1);

        await embed.updateOne({
            categories: embed.categories
        });

        return interaction.reply({
            content: `The question \`${question}\` has been removed from the category with the code name \`${codeName}\``
        });
    }
}