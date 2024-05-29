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

export default <BaseCommand><unknown>{
    data: new SlashCommandBuilder()
        .setName('addcategory')
        .setDescription('Add a category to the ticket system')
        .addStringOption(option =>
            option
                .setName('codename')
                .setDescription('Enter the code name of the category. (Tip: Use a unique name without spaces)')
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

        const name = new TextInputBuilder()
            .setCustomId('name')
            .setPlaceholder('Enter the name of the category')
            .setLabel('Name')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMinLength(1)
            .setMaxLength(100);

        const description = new TextInputBuilder()
            .setCustomId('description')
            .setPlaceholder('Enter the description of the category')
            .setLabel('Description')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMinLength(1)
            .setMaxLength(100);

        const emoji = new TextInputBuilder()
            .setCustomId('emoji')
            .setPlaceholder('Enter the emoji for the category. (Tip: You can use custom emojis)')
            .setLabel('Emoji')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMinLength(1)
            .setMaxLength(100);

        const ticketName = new TextInputBuilder()
            .setCustomId('ticketName')
            .setPlaceholder('Enter the ticket name for the category. (Tip: You can use parameters like {USERNAME}, {USERID})')
            .setLabel('Ticket Name')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMinLength(1)
            .setMaxLength(100);

        const staffRoles = new TextInputBuilder()
            .setCustomId('staffRoles')
            .setPlaceholder('Enter the staff roles IDs for the category. (Tip: You can use multiple roles separated by a comma)')
            .setLabel('Staff Roles')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMinLength(1)
            .setMaxLength(100);

        const nameRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(name),
            descriptionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(description),
            emojiRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(emoji),
            ticketNameRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(ticketName),
            staffRolesRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(staffRoles);

        const modal = new ModalBuilder()
            .setTitle('Add Category')
            .setCustomId('add-category')
            .addComponents(nameRow, descriptionRow, emojiRow, ticketNameRow, staffRolesRow);

        (interaction.client as BotClient).ticketCache.set('codeName', (interaction.options as CommandInteractionOptionResolver).getString('codename') as string);

        return await interaction.showModal(modal);
    }
};