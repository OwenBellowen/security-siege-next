import {
    CommandInteraction,
    CommandInteractionOptionResolver,
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
    AutocompleteInteraction,
    Role
} from "discord.js";
import { BaseCommand } from "../../interfaces";
import Ticket from "../../features/Ticket";

export default <BaseCommand>{
    data: new SlashCommandBuilder()
        .setName("editcategory")
        .setDescription("Edit a ticket category.")
        .addSubcommand(subcommand =>
            subcommand
                .setName("name")
                .setDescription("The name of the category.")
                .addStringOption(option =>
                    option
                        .setName("codename")
                        .setDescription("The code name of the category.")
                        .setRequired(true)
                        .setAutocomplete(true)
                )
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
                .setDescription("The description of the category.")
                .addStringOption(option =>
                    option
                        .setName("codename")
                        .setDescription("The code name of the category.")
                        .setRequired(true)
                        .setAutocomplete(true)
                )
                .addStringOption(option =>
                    option
                        .setName("value")
                        .setDescription("The new value.")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("emoji")
                .setDescription("The emoji of the category.")
                .addStringOption(option =>
                    option
                        .setName("codename")
                        .setDescription("The code name of the category.")
                        .setRequired(true)
                        .setAutocomplete(true)
                )
                .addStringOption(option =>
                    option
                        .setName("value")
                        .setDescription("The new value.")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("ticketname")
                .setDescription("The ticket name of the category.")
                .addStringOption(option =>
                    option
                        .setName("codename")
                        .setDescription("The code name of the category.")
                        .setRequired(true)
                        .setAutocomplete(true)
                )
                .addStringOption(option =>
                    option
                        .setName("value")
                        .setDescription("The new value.")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("staffroles")
                .setDescription("The staff roles of the category.")
                .addStringOption(option =>
                    option
                        .setName("codename")
                        .setDescription("The code name of the category.")
                        .setRequired(true)
                        .setAutocomplete(true)
                )
                .addRoleOption(option =>
                    option
                        .setName("role")
                        .setDescription("The new role.")
                        .setRequired(true)
                )
                .addStringOption(option => 
                    option
                        .setName("action")
                        .setDescription("What action to perform on the role.")
                        .addChoices(
                            { name: "Add", value: "add" },
                            { name: "Remove", value: "remove" }
                        )
                        .setRequired(true)
                )
        )
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator | PermissionFlagsBits.ManageMessages),
    config: {
        category: "ticket",
        usage: "<subcommand> <codename> <value>",
        examples: [
            "name support Support",
            "description support Support category",
            "emoji support 🎫",
            "ticketname support ticket-{USERNAME}-{USERID}",
            "staffroles support @Support Team add",
            "staffroles support @Support Team remove"
        ],
        permissions: ["Administrator", "ManageMessages"]
    },
    async execute(interaction: CommandInteraction) {
        const options = interaction.options as CommandInteractionOptionResolver;
        const subcommand = options.getSubcommand(true);

        if (!interaction.guild) return;

        const guildID = interaction.guild.id;
        const codeName = options.getString("codename", true);
        let value;
        let result;

        const embed = new EmbedBuilder()
            .setTitle("Category Updated")
            .setColor("Blurple");

        switch (subcommand) {
            case "name":
                value = options.getString("value", true);
                result = await Ticket.updateCategory(guildID, codeName, "name", value);
                embed
                    .setDescription("Name updated.")
                    .addFields([
                        {
                            name: "Category",
                            value: `\`${codeName}\``
                        },
                        {
                            name: "Name",
                            value: `\`${value}\``
                        }
                    ]);
                break;
            case "description":
                value = options.getString("value", true);
                result = await Ticket.updateCategory(guildID, codeName, "description", value);
                embed
                    .setDescription("Description updated.")
                    .addFields([
                        {
                            name: "Category",
                            value: `\`${codeName}\``
                        },
                        {
                            name: "Description",
                            value: `\`${value}\``
                        }
                    ]);
                break;
            case "emoji":
                value = options.getString("value", true);
                result = await Ticket.updateCategory(guildID, codeName, "emoji", value);
                embed
                    .setDescription("Emoji updated.")
                    .addFields([
                        {
                            name: "Category",
                            value: `\`${codeName}\``
                        },
                        {
                            name: "Emoji",
                            value: `\`${value}\``
                        }
                    ]);
                break;
            case "ticketname":
                value = options.getString("value", true);
                result = await Ticket.updateCategory(guildID, codeName, "ticketName", value);
                embed
                    .setDescription("Ticket name updated.")
                    .addFields([
                        {
                            name: "Category",
                            value: `\`${codeName}\``
                        },
                        {
                            name: "Ticket Name",
                            value: `\`${value}\``
                        }
                    ]);
                break;
            case "staffroles":
                const role = options.getRole("role", true) as Role;
                const action = options.getString("action", true) as "add" | "remove";

                result = await Ticket.updateCategory(guildID, codeName, "staffRoles", role.id, action);
                embed
                    .setDescription("Staff role updated.")
                    .addFields([
                        {
                            name: "Category",
                            value: `\`${codeName}\``
                        },
                        {
                            name: "Role",
                            value: role.toString()
                        },
                        {
                            name: "Action",
                            value: `\`${action}\``
                        }
                    ]);
                break;
        }

        if (!result) {
            return interaction.reply({
                content: "Category not found.",
                ephemeral: true
            });
        }

        interaction.reply({
            content: "Category updated.",
            embeds: [embed],
            ephemeral: true
        });
    },

    async autocomplete(interaction: AutocompleteInteraction) {
        const embed = await Ticket.getEmbed(interaction.guildId as string);

        if (!embed) return;

        if (!embed.categories) return;

        return interaction.respond(embed.categories.map((category) => {
            return {
                name: category.codeName,
                value: category.codeName
            }
        }));
    }
}