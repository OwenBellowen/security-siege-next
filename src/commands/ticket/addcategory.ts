import {
    CommandInteraction,
    CommandInteractionOptionResolver,
    SlashCommandBuilder,
    PermissionFlagsBits,
    ActionRowBuilder,
    ModalActionRowComponentBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    Role
} from 'discord.js';
import { BaseCommand } from '../../interfaces';
import Ticket from '../../features/Ticket';
import BotClient from '../../classes/Client';

export default <BaseCommand>{
    data: new SlashCommandBuilder()
        .setName('addcategory')
        .setDescription('Add a category to the ticket system')
        .addStringOption(option =>
            option
                .setName('codename')
                .setDescription('Enter the code name of the category. (Tip: Use a unique name without spaces)')
                .setRequired(true)
        )
        .addRoleOption(option =>
            option
                .setName('staffroles')
                .setDescription('Enter the staff roles for the category.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('emoji')
                .setDescription('Enter the emoji for the category. (Tip: You can use custom emojis)')
                .setRequired(true)
        )
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator | PermissionFlagsBits.ManageMessages),
    config: {
        category: 'ticket',
        usage: '<codename> <staffroles>',
        examples: [
            'support 1234567890,0987654321',
            'help 1234567890'
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

        const ticketName = new TextInputBuilder()
            .setCustomId('ticketName')
            .setPlaceholder('Enter the ticket name for the category. (Tip: You can use parameters like {USERNAME}, {USERID})')
            .setLabel('Ticket Name')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMinLength(1)
            .setMaxLength(100);

        const nameRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(name),
            descriptionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(description),
            ticketNameRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(ticketName);

        const modal = new ModalBuilder()
            .setTitle('Add Category')
            .setCustomId('add-category')
            .addComponents(nameRow, descriptionRow, ticketNameRow);

        (interaction.client as BotClient).ticketCache.set('codeName', (interaction.options as CommandInteractionOptionResolver).getString('codename') as string);
        (interaction.client as BotClient).ticketCache.set('staffRoles', ((interaction.options as CommandInteractionOptionResolver).getRole('staffroles') as Role).id);
        (interaction.client as BotClient).ticketCache.set('emoji', (interaction.options as CommandInteractionOptionResolver).getString('emoji') as string);
        return await interaction.showModal(modal);
    }
};