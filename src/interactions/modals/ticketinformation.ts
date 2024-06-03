import {
    ModalSubmitInteraction,
    EmbedBuilder,
    CategoryChannel,
    ChannelType,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    time
} from 'discord.js';
import { BaseModal } from '../../interfaces';
import Ticket from '../../features/Ticket';
import Utility from '../../classes/Utility';
import { TicketModel } from '../../models/TicketsModel';
import BotClient from '../../classes/Client';
import Logger from '../../features/Logger';

export default <BaseModal>{
    customId: "ticket_information",
    async execute(interaction: ModalSubmitInteraction) {
        const codeName = (interaction.client as BotClient).ticketCache.get(interaction.user.id) as string;

        if (!interaction.guild) return;

        const embedModel = await Ticket.getEmbed(interaction.guildId as string);

        if (!embedModel) {
            return interaction.reply({
                content: 'The ticket system has not been set up for this server. Please set it up first.',
                ephemeral: true
            });
        }

        const { categories, guildID, categoryID, allowedRoles, ticketCategoryID } = embedModel;

        if (!categories || categories.length === 0) {
            return interaction.reply({
                content: 'There are no ticket categories set up for this server. Please set it up first.',
                ephemeral: true
            });
        }

        const category = categories.find(c => c.codeName === codeName);

        if (!category) {
            return interaction.reply({
                content: 'Invalid category selected',
                ephemeral: true
            });
        }

        const categoryChannel = ticketCategoryID ? interaction.guild.channels.cache.get(ticketCategoryID) as CategoryChannel : interaction.guild.channels.cache.get(categoryID) as CategoryChannel;

        const ticketChannel = await (interaction.client as BotClient).guilds.cache.get(guildID)?.channels.create({
            name: category.ticketName
                .replace('{USERNAME}', interaction.user.username)
                .replace('{USERID}', interaction.user.id),
            type: ChannelType.GuildText,
            parent: categoryChannel,
            permissionOverwrites: [
                {
                    id: interaction.guild.roles.everyone.id,
                    deny: ['ViewChannel']
                }
            ]
        })
        
        if (!ticketChannel) {
            return interaction.reply({
                content: 'An error occurred while creating the ticket channel',
                ephemeral: true
            });
        }
        
        allowedRoles.forEach(role => {
            ticketChannel?.permissionOverwrites.create(role, { ViewChannel: false, SendMessages: false, ReadMessageHistory: false });
        })

        const staffRoles = category.staffRoles.map(roleID => interaction.guild?.roles.cache.get(roleID)) || [];

        const ticketEmbed = new EmbedBuilder()
            .setTitle("Ticket Created")
            .setDescription("Please wait for a staff member to assist you.")
            .setColor('Aqua')
            .addFields([
                {
                    name: 'Category',
                    value: category.name,
                    inline: true
                },
                {
                    name: 'Description',
                    value: category.description,
                    inline: true
                }
            ])
            .setFooter({
                text: `Ticket created by ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setTimestamp();

        staffRoles.forEach(role => {
            if (role) ticketChannel.permissionOverwrites.create(role, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true });
        });

        const claimButton = new ButtonBuilder()
            .setCustomId('claim')
            .setLabel('Claim Ticket')
            .setStyle(ButtonStyle.Primary);

        const closeButton = new ButtonBuilder()
            .setCustomId('close')
            .setLabel('Close Ticket')
            .setStyle(ButtonStyle.Danger);

        const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(claimButton, closeButton);

        ticketChannel.send({
            content: staffRoles.map(role => role?.toString()).join(' '),
            embeds: [ticketEmbed],
            components: [actionRow]
        });

        interaction.reply({
            content: `Ticket channel has been created. Please wait for a staff member to claim it.`,
            ephemeral: true
        });

        await (await TicketModel.create({
            guildID: guildID,
            channelID: ticketChannel.id,
            userID: interaction.user.id,
            category: category.codeName,
            claimedBy: '',
            createdAt: time()
        })).save();

        (interaction.client as BotClient).ticketCache.delete(interaction.user.id);

        const logs = await Ticket.getLogs(guildID);

        if (!logs) return;

        const logsChannel = await Utility.getChannel(logs.channelID, interaction.client as BotClient);

        if (!logsChannel) { return; }
        else {
            try {
                (interaction.client as BotClient).ticketLogger.log('ticketOpened', ticketChannel);
            } catch (error) {
                Logger.error(`An error occurred while logging the ticket: ${error}`);
            }
        }
    }
}