import {
    StringSelectMenuInteraction,
    EmbedBuilder,
    CategoryChannel,
    ChannelType,
    ModalBuilder,
    ModalActionRowComponentBuilder,
    TextInputBuilder,
    ActionRowBuilder,
    TextInputStyle
} from 'discord.js';
import { BaseSelectMenu } from '../../interfaces';
import Ticket from '../../features/Ticket';
import BotClient from '../../classes/Client';
import Logger from '../../features/Logger';

export default <BaseSelectMenu>{
    customId: "ticket_category",
    async execute(interaction: StringSelectMenuInteraction) {
        if (!interaction.guild) return;

        const embedModel = await Ticket.getEmbed(interaction.guildId as string);

        if (!embedModel) {
            return interaction.reply({
                content: 'The ticket system has not been set up for this server. Please set it up first.',
                ephemeral: true
            });
        }

        const { categories } = embedModel;

        if (!categories || categories.length === 0) {
            return interaction.reply({
                content: 'There are no ticket categories set up for this server. Please set it up first.',
                ephemeral: true
            });
        }

        const category = categories.find(c => c.codeName === interaction.values[0]);

        if (!category) {
            return interaction.reply({
                content: 'Invalid category selected',
                ephemeral: true
            });
        }

        if (!category.questions || category.questions.length === 0) {
            return interaction.reply({
                content: 'There are no questions set up for this category. Please contact a staff member.',
                ephemeral: true
            });
        }

        const questions: ActionRowBuilder<ModalActionRowComponentBuilder>[] = [];

        category.questions.forEach(question => {
            questions.push(
                new ActionRowBuilder<ModalActionRowComponentBuilder>()
                    .addComponents(
                        new TextInputBuilder()
                            .setCustomId(question.id)
                            .setLabel(question.label)
                            .setStyle((question.type === "SHORT") ? TextInputStyle.Short : TextInputStyle.Paragraph)
                            .setPlaceholder(question.placeholder)
                            .setMaxLength(question.maxLength || 1000)
                    )
            );
        });

        const modal = new ModalBuilder()
            .setTitle('Ticket Information')
            .setCustomId('ticket_information')
        
        questions.forEach(question => modal.addComponents(question));

        try {
            await interaction.showModal(modal);
            (interaction.client as BotClient).ticketCache.set(interaction.user.id, category.codeName);
        } catch (error) {
            Logger.error(`An error occurred while opening the ticket modal: ${(error as Error).message}`);
            return interaction.reply({
                content: 'An error occurred while opening the ticket modal',
                ephemeral: true
            });
        }
    }
}