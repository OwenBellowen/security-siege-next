import {
    CommandInteraction,
    CommandInteractionOptionResolver,
    SlashCommandBuilder,
    PermissionFlagsBits,
    ActionRowBuilder,
    ModalActionRowComponentBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} from 'discord.js';
import { BaseCommand } from '../../interfaces';
import Ticket from '../../features/Ticket';
import BotClient from '../../classes/Client';

export default <BaseCommand>{
    data: new SlashCommandBuilder()
        .setName('addquestion')
        .setDescription('Add a question to the category')
        .addStringOption(option =>
            option
                .setName('codename')
                .setDescription('Enter the code name of the category')
                .setRequired(true)
        )
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator | PermissionFlagsBits.ManageMessages),
    config: {
        category: 'ticket',
        usage: '<codename>',
        examples: [
            'support'
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
                content: 'There are no categories to add a question to',
                ephemeral: true
            });
        }

        const codeName = (interaction.options as CommandInteractionOptionResolver).getString('codename') as string;

        (interaction.client as BotClient).ticketCache.set('codeName', codeName);

        const category = embed.categories.find((category) => category.codeName === codeName);

        if (!category) {
            return interaction.reply({
                content: `The category with the code name \`${codeName}\` does not exist`,
                ephemeral: true
            });
        }

        const id = new TextInputBuilder()
            .setCustomId('id')
            .setPlaceholder('Enter the ID of the question. (Tip: Use a unique name without spaces and lowercase)')
            .setLabel('ID')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMinLength(1)
            .setMaxLength(10);

        const label = new TextInputBuilder()
            .setCustomId('label')
            .setPlaceholder('Enter the label of the question. (Tip: A label is what you see on the question)')
            .setLabel('Label')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMinLength(1)
            .setMaxLength(30);

        const placeholder = new TextInputBuilder()
            .setCustomId('placeholder')
            .setPlaceholder('Enter the placeholder of the question. (Tip: A placeholder is what you see here)')
            .setLabel('Placeholder')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMinLength(1)
            .setMaxLength(200);

        const type = new TextInputBuilder()
            .setCustomId('type')
            .setPlaceholder('Enter the type of the question. (Tip: SHORT or PARAGRAPH)')
            .setLabel('Type')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMinLength(1)
            .setMaxLength(10);

        const maxLength = new TextInputBuilder()
            .setCustomId('maxLength')
            .setPlaceholder('Enter the max length of the question. (Tip: How long you want the user to type in the question)')
            .setLabel('Max Length')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
            .setMinLength(1)
            .setMaxLength(5);

        const idRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(id),
            labelRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(label),
            placeholderRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(placeholder),
            typeRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(type),
            maxLengthRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(maxLength);

        const modal = new ModalBuilder()
            .setTitle('Add a question')
            .setCustomId('addquestion')
            .addComponents(idRow, labelRow, placeholderRow, typeRow, maxLengthRow);

        return await interaction.showModal(modal);
    }
}