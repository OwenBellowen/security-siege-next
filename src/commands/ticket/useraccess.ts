import {
    CommandInteraction,
    CommandInteractionOptionResolver,
    PermissionFlagsBits,
    SlashCommandBuilder
} from "discord.js";
import Ticket from "../../features/Ticket";
import { BaseCommand } from "../../interfaces";
import { TicketModel } from "../../models/TicketsModel";
import Utility from "../../classes/Utility";
import BotClient from "../../classes/Client";

export default <BaseCommand>{
    data: new SlashCommandBuilder()
        .setName('useraccess')
        .setDescription('Allow or disallow a user to access/open a ticket')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Enter the user you want to allow')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('action')
                .setDescription('Enter the action you want to perform')
                .setRequired(true)
                .addChoices(
                    { name: 'Allow', value: 'allow' },
                    { name: 'Disallow', value: 'disallow' }
                )
        )
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator | PermissionFlagsBits.ManageMessages),
    config: {
        category: 'ticket',
        usage: '<user> <action>',
        examples: [
            'OwenBellowen allow',
            'JamesBellowen disallow'
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

        const user = (interaction.options as CommandInteractionOptionResolver).getUser('user');
        const action = (interaction.options as CommandInteractionOptionResolver).getString('action') as string;
        
        if (!user) {
            return interaction.reply({
                content: 'Please provide a valid user',
                ephemeral: true
            });
        }
        
        const ticket = await TicketModel.findOne({ guildID: interaction.guildId as string, channelID: interaction.channelId });

        if (!ticket) {
            return interaction.reply({
                content: 'This is not a valid ticket channel.',
                ephemeral: true
            });
        }

        const channel = await Utility.getChannel(interaction.channelId, interaction.client as BotClient);

        if (!channel) {
            return interaction.reply({
                content: 'Channel not found',
                ephemeral: true
            });
        }

        if (ticket.userID === user.id) {
            return interaction.reply({
                content: 'The user was the one who opened the ticket. They can view the ticket channel once it is claimed.',
                ephemeral: true
            });
        }

        const checked = (action === "allow") ? true : false;

        await channel.permissionOverwrites.edit(user.id, {
            ViewChannel: checked,
            SendMessages: checked,
            ReadMessageHistory: checked
        });

        return interaction.reply({
            content: `User ${user} has been ${action}ed access to the ticket channel`,
            ephemeral: true
        })
    }
}