import {
    CommandInteraction,
    SlashCommandBuilder,
    GuildMember,
    CommandInteractionOptionResolver,
    EmbedBuilder
} from "discord.js";
import { BaseCommand } from "../../interfaces";
import Logger from "../../classes/Logger";
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


    },
};