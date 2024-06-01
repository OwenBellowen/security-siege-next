import {
    CommandInteraction,
    SlashCommandBuilder,
    PermissionFlagsBits,
    ActionRowBuilder,
    ModalActionRowComponentBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    CommandInteractionOptionResolver,
    TextChannel
} from 'discord.js';
import { BaseCommand } from '../../interfaces';
import Ticket from '../../features/Ticket';
import BotClient from '../../classes/Client';

export default <BaseCommand>{
    data: new SlashCommandBuilder()
        .setName('setupticket')
        .setDescription('Set up the ticket system for the server')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to set up the ticket system in (Make sure the category is set up)')
                .setRequired(false)
        )
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator | PermissionFlagsBits.ManageMessages),
    config: {
        category: 'ticket',
        usage: '[channel]',
        examples: [
            '#setupticket',
        ],
        permissions: ['Administrator', 'ManageMessages']
    },
    async execute(interaction: CommandInteraction) {
        if (!interaction.guild) return;

        const channel = (interaction.options as CommandInteractionOptionResolver).getChannel('channel') as TextChannel || interaction.channel as TextChannel;

        if (!channel.parentId) {
            return interaction.reply({
                content: 'The channel must be in a category',
                ephemeral: true
            });
        }

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

        const titleRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(title),
            descriptionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(description)

        const modal = new ModalBuilder()
            .setTitle('Ticket System Setup')
            .setCustomId('ticket-setup')
            .addComponents(titleRow, descriptionRow);

        await (interaction.client as BotClient).ticketCache.set(`${interaction.user.id}-channel`, channel.id);
        await (interaction.client as BotClient).ticketCache.set(`${interaction.user.id}-category`, channel.parentId);

        return await interaction.showModal(modal);
    }
}