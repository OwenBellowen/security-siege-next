import {
    CommandInteraction,
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

export default <BaseCommand><unknown>{
    data: new SlashCommandBuilder()
        .setName('setupticket')
        .setDescription('Set up the ticket system for the server')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator | PermissionFlagsBits.ManageMessages),
    config: {
        category: 'ticket',
        usage: '',
        examples: [],
        permissions: ['Administrator', 'ManageMessages']
    },
    async execute(interaction: CommandInteraction) {
        if (!interaction.guild) return;

        const embed = await Ticket.getEmbed(interaction.guildId as string);

        if (embed) {
            return interaction.reply({
                content: 'The ticket system has already been set up for this server',
                ephemeral: true
            });
        }

        const title = new TextInputBuilder()
            .setCustomId('title')
            .setPlaceholder('Enter the title of the ticket embed')
            .setLabel('Title')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMinLength(1)
            .setMaxLength(100);

        const description = new TextInputBuilder()
            .setCustomId('description')
            .setPlaceholder('Enter the description of the ticket embed. (Tip: You can use markdown to format the text)')
            .setLabel('Description')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMinLength(1)
            .setMaxLength(1000);

        const channel = new TextInputBuilder()
            .setCustomId('channel')
            .setPlaceholder('Enter the channel ID where the embed will be sent')
            .setLabel('Channel ID')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMinLength(1)
            .setMaxLength(100);

        const titleRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(title),
            descriptionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(description),
            channelRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(channel);

        const modal = new ModalBuilder()
            .setTitle('Ticket System Setup')
            .setCustomId('ticket-setup')
            .addComponents(titleRow, descriptionRow, channelRow);

        return await interaction.showModal(modal);
    }
}