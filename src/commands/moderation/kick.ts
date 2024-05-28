import {
    CommandInteraction,
    SlashCommandBuilder,
    GuildMember,
    CommandInteractionOptionResolver,
    EmbedBuilder,
    PermissionFlagsBits
} from "discord.js";
import { BaseCommand } from "../../interfaces";
import Logger from "../../features/Logger";
import { moderation } from "../../../config/messages.json";

export default <BaseCommand>{
    data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Kick a member from the server.")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("The user to kick.")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("reason")
                .setDescription("The reason for kicking the user.")
                .setRequired(false))
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    config: {
        category: "moderation",
        usage: "<user> [reason]",
        examples: ["@user", "@user spamming"],
        permissions: ["KickMembers"]
    },
    async execute(interaction: CommandInteraction) {
        const options = interaction.options as CommandInteractionOptionResolver;
        const user = options.getMember("user") as GuildMember;
        const reason = options.getString("reason") as string;

        if (!interaction.guild) return;

        if (!user.kickable) {
            return await interaction.reply({
                content: moderation.kick.unableToKick.replace("{USER}", user.user.username),
                ephemeral: true
            });
        }

        if (user.id === interaction.guild.ownerId) {
            return await interaction.reply({
                content: moderation.kick.unableToKickOwner,
                ephemeral: true
            });
        }

        if (user.id === interaction.user.id) {
            return await interaction.reply({
                content: moderation.kick.selfKick,
                ephemeral: true
            });
        }

        if (user.roles.highest.position >= (interaction.member as GuildMember).roles.highest.position) {
            return await interaction.reply({
                content: moderation.kick.highestRole,
                ephemeral: true
            });
        }

        try {
            const embed = new EmbedBuilder()
                .setTitle("User Banned")
                .setColor("Aqua")
                .setFooter({
                    text: moderation.kick.success.footer.replace("{MODERATOR}", user.user.username),
                })
                .setTimestamp()

            if (reason) {
                embed.setDescription(moderation.kick.success.description.replace("{REASON}", reason));

                await user.kick(reason);
                await interaction.reply({ embeds: [embed] });

                try {
                    await user.send({
                        content: moderation.kick.success.dm.replace("{REASON}", reason).replace("{GUILD}", interaction.guild.name)
                    });
                } catch (error) {
                    Logger.error("Failed to send DM to user.");
                }
            } else {
                embed.setDescription(moderation.kick.success.description.replace("{REASON}", "No reason provided."));

                await user.kick();
                await interaction.reply({ embeds: [embed] });

                try {
                    await user.send({
                        content: moderation.kick.success.dm.replace("{REASON}", "No reason provided.").replace("{GUILD}", interaction.guild.name)
                    });
                } catch (error) {
                    Logger.error("Failed to send DM to user.");
                }
            }
        } catch (error) {
            Logger.error((error as Error).message);
            await interaction.reply({
                content: moderation.kick.error.replace("{USER}", user.user.username),
                ephemeral: true
            });
        }
    }
};