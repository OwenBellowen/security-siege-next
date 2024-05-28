import {
    CommandInteraction,
    SlashCommandBuilder,
    GuildMember,
    CommandInteractionOptionResolver,
    EmbedBuilder,
    PermissionFlagsBits,
    APIEmbedField,
    RestOrArray
} from "discord.js";
import { BaseCommand } from "../../interfaces";
import Logger from "../../features/Logger";
import { moderation } from "../../../config/messages.json";
import Warn from "../../features/Warn";
import BotClient from "../../classes/Client";

export default <BaseCommand>{
    data: new SlashCommandBuilder()
        .setName("warn")
        .setDescription("Warn a member.")
        .addSubcommand(subcommand =>
            subcommand
                .setName("add")
                .setDescription("Warn a member.")
                .addUserOption(option =>
                    option
                        .setName("member")
                        .setDescription("The member to warn.")
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName("reason")
                        .setDescription("The reason for the warn.")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("remove")
                .setDescription("Remove a warn from a member.")
                .addUserOption(option =>
                    option
                        .setName("member")
                        .setDescription("The member to remove the warn from.")
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName("warn-id")
                        .setDescription("The ID of the warn to remove.")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("list")
                .setDescription("Get the warns of a member.")
                .addUserOption(option =>
                    option
                        .setName("member")
                        .setDescription("The member to get the warns of.")
                        .setRequired(true)
                )
        )
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    config: {
        category: "moderation",
        usage: "<member> <reason>",
        examples: [
            "warn add @user#0001 spamming",
            "warn remove @user#0001 1234567890",
            "warn get @user#0001"
        ],
        permissions: ["KickMembers"],
    },
    async execute(interaction: CommandInteraction) {
        const options = interaction.options as CommandInteractionOptionResolver;
        const subcommand = options.getSubcommand();
        const member = options.getMember("member") as GuildMember;
        const reason = options.getString("reason") as string;
        const warnID = options.getString("warn-id") as string;

        if (!interaction.guild) return;

        if (subcommand === "add") {
            await Warn.warn(interaction.guild.id, member.id, interaction.user.id, reason);

            const embed = new EmbedBuilder()
                .setTitle(moderation.warn.add.success.title)
                .setDescription(moderation.warn.add.success.description.replace("{USER}", `\`${member.user.username}\``).replace("{REASON}", `\`${reason}\``))
                .setColor("Aqua")
                .setFooter({
                    text: moderation.warn.add.success.footer.replace("{MODERATOR}", interaction.user.username),
                    iconURL: interaction.user.displayAvatarURL()
                });

            await interaction.reply({ embeds: [embed] });

            try {
                await member.send({
                    content: moderation.warn.add.success.dm.replace("{REASON}", reason).replace("{GUILD}", interaction.guild.name)
                })
            } catch (error) {
                Logger.error(moderation.warn.add.error.replace("{USER}", member.user.username));
            }
        }

        if (subcommand === "remove") {
            const warn = await Warn.removeWarn(interaction.guild.id, member.id, warnID);

            if (!warn) {
                const embed = new EmbedBuilder()
                    .setTitle(moderation.warn.remove.noWarn.title)
                    .setDescription(moderation.warn.remove.noWarn.description.replace("{USER}", `\`${member.user.username}\``))
                    .setColor("Red");

                return await interaction.reply({ embeds: [embed] });
            }

            const embed = new EmbedBuilder()
                .setTitle(moderation.warn.remove.success.title)
                .setDescription(moderation.warn.remove.success.description.replace("{USER}", `\`${member.user.username}\``))
                .setColor("Aqua")
                .setFooter({
                    text: moderation.warn.remove.success.footer.replace("{MODERATOR}", interaction.user.username),
                    iconURL: interaction.user.displayAvatarURL()
                });

            await interaction.reply({ embeds: [embed] });

            try {
                await member.send({
                    content: moderation.warn.remove.success.dm.replace("{GUILD}", interaction.guild.name)
                })
            } catch (error) {
                Logger.error(moderation.warn.remove.error.replace("{USER}", member.user.username));
            }
        }

        if (subcommand === "list") {
            const warns = await Warn.getWarns(interaction.guild.id, member.id);

            if (!warns) {
                const embed = new EmbedBuilder()
                    .setDescription(moderation.warn.list.noWarnings.replace("{USER}", `\`${member.user.username}\``))
                    .setColor("Red");

                return await interaction.reply({ embeds: [embed] });
            }

            const fields: RestOrArray<APIEmbedField> = warns.warns.map(warn => ({
                name: `Warn ID: ${warn.id}`,
                value: `Moderator: <@${warn.moderator}>\nReason: \`${warn.reason}\`\nTimestamp: ${warn.timestamp}`
            }));

            const embed = new EmbedBuilder()
                .setTitle(moderation.warn.list.warnings.replace("{USER}", `\`${member.user.username}\``))
                .setColor("Aqua")
                .addFields(fields)
                .setFooter({
                    text: moderation.warn.list.footer.replace("{REQUESTER}", interaction.user.username),
                    iconURL: interaction.user.displayAvatarURL()
                })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
    }
}