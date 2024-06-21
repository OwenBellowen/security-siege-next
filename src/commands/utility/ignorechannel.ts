import {
    CommandInteraction,
    SlashCommandBuilder,
    CommandInteractionOptionResolver,
    PermissionFlagsBits,
    ChannelType,
    TextChannel
} from "discord.js";
import { BaseCommand } from "../../interfaces";
import AutomodModel, { Automod } from "../../models/AutomodModel";

export default <BaseCommand>{
    data: new SlashCommandBuilder()
        .setName("ignorechannel")
        .setDescription("Ignore a channel for a specific module.")
        .addStringOption(option =>
            option
                .setName("module")
                .setDescription("The module to ignore the channel for.")
                .setRequired(true)
                .addChoices(
                    { name: "Gifs", value: "gifs" },
                    { name: "Links", value: "links" },
                    { name: "Words", value: "words" }
                )
        )
        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("The channel to ignore.")
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),
    config: {
        category: "utility",
        usage: "<module> <channel>",
        examples: ["gifs #general"],
        permissions: ["Administrator"]
    },
    async execute(interaction: CommandInteraction) {
        const options = interaction.options as CommandInteractionOptionResolver;
        const module = options.getString("module", true);
        const channel = options.getChannel("channel", true) as TextChannel;

        if (!channel) {
            return interaction.reply({
                content: "Please provide a valid channel.",
                ephemeral: true
            });
        }

        const automod = await AutomodModel.findOne<Automod>({ guildID: interaction.guildId as string });

        if (!automod) {
            return interaction.reply({
                content: "Automod is not enabled for this server.",
                ephemeral: true
            });
        }

        const { gifs } = automod.modules;

        if (module === "gifs") {
            if (!gifs.status) {
                return interaction.reply({
                    content: "The gifs module is not enabled for this server.",
                    ephemeral: true
                });
            }

            if (gifs.ignoredChannels.includes(channel.id)) {
                return interaction.reply({
                    content: "This channel is already ignored for gifs module.",
                    ephemeral: true
                });
            }

            gifs.ignoredChannels.push(channel.id);
        }

        await automod.save();
        return interaction.reply({
            content: `The channel ${channel} has been ignored for ${module} module.`,
            ephemeral: true
        });
    }
}