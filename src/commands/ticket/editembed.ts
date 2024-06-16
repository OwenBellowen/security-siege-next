import { CommandInteraction, CommandInteractionOptionResolver, SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType, TextChannel, Message } from "discord.js";
import { BaseCommand } from "../../interfaces";
import { TicketEmbedModel } from "../../models/TicketsModel";
import Utility from "../../classes/Utility";
import BotClient from "../../classes/Client";

export default <BaseCommand>{
    data: new SlashCommandBuilder()
        .setName("editembed")
        .setDescription("Edit the ticket embed.")
        .addSubcommand(subcommand =>
            subcommand
                .setName("title")
                .setDescription("The title of the embed.")
                .addStringOption(option =>
                    option
                        .setName("value")
                        .setDescription("The new value.")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("description")
                .setDescription("The description of the embed.")
                .addStringOption(option =>
                    option
                        .setName("value")
                        .setDescription("The new value. (Use `\\n` for new lines, you can also use markdown formatting)")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("channel")
                .setDescription("The channel where the embed will be sent.")
                .addChannelOption(option =>
                    option
                        .setName("value")
                        .setDescription("The new value.")
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildText)
                )
        )
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    config: {
        category: "ticket",
        usage: "<subcommand> <value>",
        examples: [
            "title Ticket System",
            "description Welcome to the ticket system!\\nPlease react with 🎫 to open a ticket.",
            "channel #ticket-embed"
        ],
        permissions: ["Administrator"]
    },
    async execute(interaction: CommandInteraction) {
        const options = interaction.options as CommandInteractionOptionResolver;
        const subcommand = options.getSubcommand();

        if (!interaction.guild) {
            return;
        }

        const embedModel = await TicketEmbedModel.findOne({ guildID: interaction.guildId });

        if (!embedModel) {
            return interaction.reply({
                content: "The ticket system has not been set up for this server. Please set it up first.",
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setTitle("Embed Updated")
            .setColor("Blurple");

        let channel: TextChannel | undefined;
        let message: Message<true> | undefined;
        let value;

        switch (subcommand) {
            case "title":
                value = options.getString("value", true);
                const oldTitle = embedModel.title;
                embedModel.title = value;
                embed
                    .setDescription("Title updated.")
                    .addFields([
                        {
                            name: "Old Title",
                            value: `\`${oldTitle}\``
                        },
                        {
                            name: "New Title",
                            value: `\`${value}\``
                        }
                    ]);
                break;
            case "description":
                value = options.getString("value", true);
                const oldDescription = embedModel.description;
                embedModel.description = value;
                embed
                    .setDescription("Description updated.")
                    .addFields([
                        {
                            name: "Old Description",
                            value: `\`${oldDescription}\``
                        },
                        {
                            name: "New Description",
                            value: `\`${value}\``
                        }
                    ]);
                break;
            case "channel":
                value = options.getChannel("value", true).id;
                const oldChannelID = embedModel.channelID;
                const oldChannel = await Utility.getChannel(oldChannelID, interaction.client as BotClient) || interaction.guild.channels.cache.get(oldChannelID) as TextChannel;

                if (oldChannel?.id === value) {
                    return interaction.reply("The channel is already set to that.");
                }

                embedModel.channelID = value;
                embed
                    .setDescription("Channel updated.")
                    .addFields([
                        {
                            name: "Old Channel",
                            value: `<#${oldChannelID}>`
                        },
                        {
                            name: "New Channel",
                            value: `<#${value}>`
                        }
                    ]);

                if (!embedModel.startEmbed || !embedModel.messageID) {
                    return interaction.reply({
                        content: "The ticket system has not been started yet.",
                        ephemeral: true
                    });
                }

                const oldMessage = await oldChannel?.messages.fetch(embedModel.messageID);
                const components = oldMessage?.components;

                if (!oldMessage) {
                    return interaction.reply({
                        content: "The old message could not be found.",
                        ephemeral: true
                    });
                }

                await oldMessage.delete();

                channel = await Utility.getChannel(value, interaction.client as BotClient) || interaction.guild.channels.cache.get(value) as TextChannel;

                if (!channel) {
                    return interaction.reply({
                        content: "Channel not found in the database. Please set it up again.",
                        ephemeral: true
                    });
                }

                await channel.send({
                    embeds: [Utility.createTicketEmbed(embedModel, interaction)],
                    components
                });

                break;
            default:
                break;
        }

        await embedModel.save();

        return interaction.reply({
            content: "Embed updated.",
            embeds: [embed]
        });
    }
}
