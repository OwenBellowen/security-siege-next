import {
    CommandInteraction,
    CommandInteractionOptionResolver,
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
    AutocompleteInteraction
} from "discord.js";
import { BaseCommand } from "../../interfaces";
import Ticket from "../../features/Ticket";

export default <BaseCommand>{
    data: new SlashCommandBuilder()
        .setName("listticket")
        .setDescription("Lists either categories or questions.")
        .addStringOption(option =>
            option
                .setName("type")
                .setDescription("The type of list to display.")
                .setRequired(true)
                .addChoices(
                    { name: "Categories", value: "categories" },
                    { name: "Questions", value: "questions" }
                )
        )
        .addStringOption(option =>
            option
                .setName("category")
                .setDescription("The category to list.")
                .setRequired(false)
                .setAutocomplete(true)
        )
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator | PermissionFlagsBits.ManageMessages),
    config: {
        category: "ticket",
        usage: "<type>",
        examples: [
            "categories",
            "questions"
        ],
        permissions: ["Administrator", "ManageMessages"]
    },
    async execute(interaction: CommandInteraction) {
        const options = interaction.options as CommandInteractionOptionResolver;
        const type = options.getString("type", true);
        const category = options.getString("category", false);

        if (!interaction.guild) return;

        const embed = new EmbedBuilder()
            .setTitle("Ticket List")
            .setColor("Blurple");

        const embedData = await Ticket.getEmbed(interaction.guild.id);
        if (!embedData) return interaction.reply("No ticket embed found.");

        if (!embedData.categories) return interaction.reply("No categories found.");

        if (type === "categories") {
            if (category) {
                const categoryData = embedData.categories.find((cat) => cat.name.toLowerCase() === category.toLowerCase());
                if (!categoryData) return interaction.reply("Category not found.");

                if (!categoryData.questions || categoryData.questions.length === 0) {
                    embed.setDescription("No questions found.");
                } else {
                    embed.addFields(categoryData.questions.map((question, index) => {
                        return {
                            name: `Question ${index + 1}`,
                            value: `**Question:** ${question.label}\n**Placeholder:** ${question.placeholder}\n**Type:** ${question.type} ${question.maxLength ? `- Max Length: ${question.maxLength}` : ""}`
                        }
                    }));
                }
            } else {
                embed.addFields(embedData.categories.map((category, index) => {
                    const roles = interaction.guild?.roles.cache.filter((role) => category.staffRoles.includes(role.id)).map((role) => role.toString()) || [];
                    return {
                        name: `Category ${index + 1}:`,
                        value: `**Name:** ${category.name}\n**Codename:** ${category.codeName}\n**Description:** ${category.description}\n**Emoji:** ${category.emoji}\n**Ticket Name:** ${category.ticketName}\n**Staff Roles:** ${roles ? roles.join(", ") : "None"}`
                    }
                }));
            }
        }

        if (type === "questions") {
            embed.setDescription(embedData.categories.map((category, index) => {
                return `${index + 1}. **${category.name}** - ${category.questions.length} questions`;
            }).join("\n"));
        }

        interaction.reply({ embeds: [embed] });
    },

    async autocomplete(interaction: AutocompleteInteraction) {
        const type = interaction.options.getString("type", true);

        if (type === "categories") {
            const embedData = await Ticket.getEmbed(interaction.guildId as string);
            if (!embedData) return;

            if (!embedData.categories) return;

            return interaction.respond(embedData.categories.map((category) => {
                return {
                    name: category.name,
                    value: category.name
                }
            }
            ));
        }
    },
}