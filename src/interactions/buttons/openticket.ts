import { BaseButton } from "../../interfaces";
import {
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ButtonInteraction,
    GuildMemberRoleManager,
} from "discord.js";
import Ticket from "../../features/Ticket";

export default <BaseButton>{
    customId: 'open_ticket',
    async execute(interaction: ButtonInteraction) {
        if (!interaction.guild) return;

        const embedModel = await Ticket.getEmbed(interaction.guildId as string);


        if (!embedModel) {
            return interaction.reply({
                content: 'The ticket system has not been set up for this server. Please set it up first.',
                ephemeral: true
            });
        }

        const { categories, allowedRoles } = embedModel;

        if (!categories || categories.length === 0) {
            return interaction.reply({
                content: 'There are no ticket categories set up for this server. Please set it up first.',
                ephemeral: true
            });
        }

        const member = interaction.member?.roles as GuildMemberRoleManager;

        if (!categories.some(category => category.staffRoles.some(role => member.cache.has(role)))) {
            if (allowedRoles && allowedRoles.length > 0) {
                const isAllowed = allowedRoles.some(role => member.cache.has(role));
                if (!isAllowed) {
                    return interaction.reply({
                        content: 'You are not allowed to open a ticket in this server. Please contact a staff member.',
                        ephemeral: true
                    });
                }
            } else {
                return interaction.reply({
                    content: 'You are not allowed to open a ticket in this server. Please contact a staff member.',
                    ephemeral: true
                });
            }
        }

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('ticket_category')
            .setPlaceholder('Select a category where you need help with!')
            .setMinValues(1)
            .setMaxValues(1);

        categories.forEach(async (category) => {
            selectMenu.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel(category.name)
                    .setValue(category.codeName)
                    .setDescription(category.description)
                    .setEmoji(category.emoji)
            )
        })

        const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(selectMenu);

        await interaction.reply({
            components: [actionRow],
            ephemeral: true
        });
    }
}