import {
    CommandInteraction,
    SlashCommandBuilder,
    TextChannel,
    EmbedBuilder,
    CommandInteractionOptionResolver
} from "discord.js";
import { BaseCommand } from "../../interfaces";
import Logger from "../../features/Logger";
import { moderation } from "../../../config/messages.json";

const PurgeType = [
    { name: "User", value: "user" },
    { name: "Bot", value: "bot" },
    { name: "Embeds", value: "embeds" },
    { name: "Images", value: "images" },
]

export default <BaseCommand>{
    data: new SlashCommandBuilder()
        .setName("purge")
        .setDescription("Deletes a specified amount of messages.")
        .addIntegerOption(option =>
            option
                .setName("amount")
                .setDescription("The amount of messages to delete.")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("type")
                .setDescription("The type of messages to delete.")
                .setRequired(false)
                .addChoices(PurgeType),
        )
        .setDefaultMemberPermissions("ManageMessages"),
    config: {
        category: "moderation",
        usage: "<amount> [type]",
        examples: ["10", "5 user"],
        permissions: ["ManageMessages"]
    },
    async execute(interaction: CommandInteraction) {
        const options = interaction.options as CommandInteractionOptionResolver;
        const amount = options.getInteger("amount") as number;
        const type = options.getString("type") as string;

        if (amount < 1 || amount > 100) {
            return await interaction.reply({
                content: moderation.purge.invalidAmount.replace("{AMOUNT}", amount.toString()),
                ephemeral: true
            });
        }

        const channel = interaction.channel as TextChannel;
        const messages = await channel.messages.fetch({ limit: amount });

        const filteredMessages = messages.filter((msg) => {
            if (type) {
                if (type === "user" && msg.author.bot) return false;
                if (type === "bot" && !msg.author.bot) return false;
                if (type === "embeds" && !msg.embeds.length) return false;
                if (type === "images" && !msg.attachments.size) return false;
            }

            return true;
        });

        try {
            await channel.bulkDelete(filteredMessages);
            await interaction.reply({
                content: moderation.purge.success.replace("{AMOUNT}", amount.toString()),
                ephemeral: true
            });
        } catch (error) {
            Logger.error(`Error purging messages: ${error}`);
            await interaction.reply({
                content: moderation.purge.error,
                ephemeral: true
            });
        }
    },
}