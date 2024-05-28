import {
    CommandInteraction,
    SlashCommandBuilder,
    GuildMember,
    CommandInteractionOptionResolver,
    EmbedBuilder
} from "discord.js";
import { BaseCommand } from "../../interfaces";
import Logger from "../../features/Logger";
import { moderation } from "../../../config/messages.json";

export default <BaseCommand>{
    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Bans a user from the server.")
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("The user to ban.")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("The reason for banning the user.")
                .setRequired(false)
        )
        .setDefaultMemberPermissions("BanMembers"),
    config: {
        category: "moderation",
        usage: "<user> [reason]",
        examples: ["@user", "@user spamming"],
        permissions: ["BanMembers"]
    },
    async execute(interaction: CommandInteraction) {
        const options = interaction.options as CommandInteractionOptionResolver;
        const user = options.getMember("user") as GuildMember;
        const reason = options.getString("reason") as string;

        if (!interaction.guild) return;

        if (!user.bannable) {
            return await interaction.reply({
                content: moderation.ban.unableToBan.replace("{user}", user.user.username),
                ephemeral: true
            });
        }

        if (user.id === interaction.guild.ownerId) {
            return await interaction.reply({
                content: moderation.ban.unableToBanOwner,
                ephemeral: true
            });
        }

        if (user.id === interaction.user.id) {
            return await interaction.reply({
                content: moderation.ban.selfBan,
                ephemeral: true
            });
        }

        if (user.roles.highest.position >= (interaction.member as GuildMember).roles.highest.position) {
            return await interaction.reply({
                content: moderation.ban.highestRole,
                ephemeral: true
            });
        }

        try {
            const embed = new EmbedBuilder()
                .setTitle("User Banned")
                .setColor("Aqua")
                .setFooter({
                    text: moderation.ban.success.footer.replace("{MODERATOR}", user.user.username),
                })
                .setTimestamp()

            if (reason) {
                embed.setDescription(moderation.ban.success.description.replace("{REASON}", reason));

                await user.ban({ reason: reason });
                await interaction.reply({ embeds: [embed] });

                try {
                    await user.send({
                        content: moderation.ban.success.dm.replace("{REASON}", reason).replace("{GUILD}", interaction.guild.name)                    });
                } catch (error) {
                    Logger.error("Failed to send DM to user.");
                }
            } else {
                embed.setDescription(moderation.ban.success.description.replace("{REASON}", "No reason provided."));

                await user.ban();
                await interaction.reply({ embeds: [embed] });

                try {
                    await user.send({
                        content: moderation.ban.success.dm.replace("{REASON}", "No reason provided.").replace("{GUILD}", interaction.guild.name)
                    });
                } catch (error) {
                    Logger.error("Failed to send DM to user.");
                }
            }
        } catch (error) {
            Logger.error((error as Error).message);
            await interaction.reply({
                content: moderation.ban.error.replace("{USER}", user.user.username),
                ephemeral: true
            });
        }
    },
};