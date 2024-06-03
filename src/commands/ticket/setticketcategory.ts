import {
    CommandInteraction,
    CommandInteractionOptionResolver,
    PermissionFlagsBits,
    SlashCommandBuilder,
    CategoryChannel,
    ChannelType
} from 'discord.js';
import { BaseCommand } from '../../interfaces';
import Ticket from '../../features/Ticket';
import { TicketEmbedModel } from '../../models/TicketsModel';

export default <BaseCommand>{
    data: new SlashCommandBuilder()
        .setName('setticketcategory')
        .setDescription('Set the ticket category for the server')
        .addChannelOption(option =>
            option
                .setName('category')
                .setDescription('The category to set as the ticket category')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildCategory)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator | PermissionFlagsBits.ManageMessages),
    config: {
        category: 'ticket',
        usage: '<category>',
        examples: [
            'Support'
        ],
        permissions: ['Administrator']
    },
    async execute(interaction: CommandInteraction) {
        const options = interaction.options as CommandInteractionOptionResolver;
        const category = options.getChannel('category') as CategoryChannel;

        if (!category) {
            return interaction.reply({
                content: 'Category not found'
            });
        }

        const embed = await Ticket.getEmbed(interaction.guildId!);
        if (!embed) {
            return interaction.reply({
                content: 'Ticket embed not found'
            });
        }

        embed.ticketCategoryID = category.id;
        await TicketEmbedModel.findOneAndUpdate({ guildID: interaction.guildId }, embed);

        return interaction.reply({
            content: `Ticket category has been set to ${category.name}`
        });
    }
}