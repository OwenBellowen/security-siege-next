import {
    CommandInteraction,
    CommandInteractionOptionResolver,
    Role,
    PermissionFlagsBits,
    SlashCommandBuilder,
    TextChannel
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
        usage: '<user>',
        examples: [
            'OwenBellowen'
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
        
        const ticket = await TicketModel.findOne({ guildID: interaction.guildId as string, userID: user.id });

        if (!ticket) {
            return interaction.reply({
                content: 'This user did not open a ticket.',
                ephemeral: true
            });
        }

        const channel = await Utility.getChannel(ticket.channelID, interaction.client as BotClient) as TextChannel;
        if (!channel) {
            return interaction.reply({
                content: 'The ticket channel could not be found.',
                ephemeral: true
            });
        }

        if (interaction.channel !== channel) {
            return interaction.reply({
                content: 'You can only use this command in the ticket channel.',
                ephemeral: true
            });
        }

        if (action === 'allow') {
            if (!ticket.claimedBy) {
                return interaction.reply({
                    content: "The ticket hasn't been claimed yet.",
                    ephemeral: true
                });
            }

            
        }
    }
}