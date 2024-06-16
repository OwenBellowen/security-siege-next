import {
    CommandInteraction,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    SlashCommandBuilder,
    PermissionFlagsBits,
    ActionRowBuilder,
    TextChannel
} from 'discord.js';
import { BaseCommand } from '../../interfaces';
import Logger from '../../features/Logger';
import Ticket from '../../features/Ticket';

export default <BaseCommand>{
    data: new SlashCommandBuilder()
        .setName('startticket')
        .setDescription('Starts the ticket system.')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator | PermissionFlagsBits.ManageMessages),
    config: {
        category: 'ticket',
        usage: '',
        examples: [],
        permissions: ["Administrator", "ManageMessages"]
    },
    async execute(interaction: CommandInteraction) {
        if (!interaction.guild) return;

        const embedModel = await Ticket.getEmbed(interaction.guildId as string);

        if (!embedModel) {
            return interaction.reply({
                content: 'The ticket system has not been set up for this server. Please set it up first.',
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(embedModel.title)
            .setDescription(embedModel.description)
            .setColor('Aqua')
            .setFooter({ text: 'React with the button below to start a ticket', iconURL: interaction.client.user.displayAvatarURL() });
        
        const button = new ButtonBuilder()
            .setCustomId('open_ticket')
            .setLabel('Open a ticket')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

        const channel = await interaction.guild.channels.fetch(embedModel.channelID) as TextChannel;

        if (!channel) {
            Logger.error('Channel not found.');
            return interaction.reply({
                content: 'Channel not found in the database. Please set it up again.',
                ephemeral: true
            });
        }

        const message = await channel.send({
            embeds: [embed],
            components: [row]
        });

        embedModel.startEmbed = true;
        embedModel.messageID = message.id;

        await embedModel.save();

        return await interaction.reply({
            content: `The ticket system has been started in ${channel.toString()}.`,
            ephemeral: true
        })
    }
}