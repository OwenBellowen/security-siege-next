import { BaseCommand } from "../../interfaces";
import {
    CommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder,
    AutocompleteInteraction,
    CommandInteractionOptionResolver,
    APIEmbedField,
    RestOrArray
} from "discord.js";
import Logger from "../../classes/Logger";
import BotClient from "../../classes/Client";
import Utility from "../../classes/Utility";

export default <BaseCommand>{
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Displays a list of commands or information about a specific command.")
        .addSubcommand(subcommand =>
            subcommand
                .setName("all")
                .setDescription("Displays a list of all commands.")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("command")
                .setDescription("Displays information about a specific command.")
                .addStringOption(option =>
                    option
                        .setName("command")
                        .setDescription("The command to display information about.")
                        .setRequired(true)
                        .setAutocomplete(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("category")
                .setDescription("Displays a list of commands in a specific category.")
                .addStringOption(option =>
                    option
                        .setName("category")
                        .setDescription("The category to display commands for.")
                        .setRequired(true)
                        .setAutocomplete(true)
                )
        )
        .setDMPermission(false),
    config: {
        category: "info",
        usage: "/help",
        examples: ["/help all", "/help command ban", "/help category moderation"],
        permissions: []
    },
    async execute(interaction: CommandInteraction) {
        const options = interaction.options as CommandInteractionOptionResolver;
        const client = interaction.client as BotClient;
        const subcommand = options.getSubcommand();

        if (subcommand === "all") {
            const commands = client.commands.map(command => command);
            const categories = [...new Set(commands.map(command => command.config.category))];
            let fields: RestOrArray<APIEmbedField> = [];

            for (const category of categories) {
                const categoryCommands = commands.filter(command => command.config.category === category);
                fields.push({
                    name: Utility.capitalize(category),
                    value: categoryCommands.map(command => `\`${command.data.name}\``).join(", "),
                    inline: true
                });
            }

            if (fields.length > 25) {
                Logger.warn("Too many categories to display in one embed.");
                return interaction.reply({ content: "There are too many categories to display in one embed.", ephemeral: true });
            }

            if (!client.config.owners.includes(interaction.user.id)) {
                fields = fields.filter(field => field.name !== "Dev");
            }

            const embed = new EmbedBuilder()
                .setTitle("Need help? Here's a list of commands.")
                .setDescription("To get more information about a specific command, use `/help command <command>`. To get a list of commands in a specific category, use `/help category <category>`.")
                .addFields(fields)
                .setColor("Aqua");

            await interaction.reply({ embeds: [embed] });
        }

        if (subcommand === "command") {
            const commandName = options.getString("command");

            const command = client.commands.get(commandName as string);

            if (!command) {
                return interaction.reply({ content: "That command does not exist.", ephemeral: true });
            }

            if (command.config.category === "dev" && !client.config.owners.includes(interaction.user.id)) {
                return interaction.reply({ content: "You do not have permission to view this command.", ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle(`Command: ${command.data.name}`)
                .setDescription(command.data.description)
                .addFields([
                    {
                        name: "Category",
                        value: `\`${Utility.capitalize(command.config.category)}\``,
                        inline: true
                    },
                    {
                        name: "Permissions",
                        value: `${command.config.permissions.length ? command.config.permissions.map(permission => `\`${permission}\``).join(", ") : "No permissions required."}`,
                        inline: true
                    },
                    {
                        name: "Usage",
                        value: `\`${command.config.usage}\`` || "No usage provided.",
                        inline: false
                    },
                    {
                        name: "Examples",
                        value: `${command.config.examples.length ? command.config.examples.map(example => `\`${example}\``).join(", ") : "No examples provided."}`,
                        inline: false
                    }
                ])
                .setColor("Aqua");

            await interaction.reply({ embeds: [embed] });
        }

        if (subcommand === "category") {
            const category = Utility.capitalize(options.getString("category") as string);

            const commands = client.commands.filter(command => command.config.category === category.toLowerCase());

            if (!commands.size) {
                return interaction.reply({ content: "That category does not exist or has no commands.", ephemeral: true });
            }

            if (!client.config.owners.includes(interaction.user.id) && category === "Dev") {
                return interaction.reply({ content: "You do not have permission to view this category.", ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle(`Category: ${category}`)
                .setDescription(`Here are the commands in the ${category} category.`)
                .addFields(commands.map(command => ({
                    name: command.data.name,
                    value: command.data.description,
                    inline: true
                }))
                    .sort((a, b) => a.name.localeCompare(b.name))
                )
                .setColor("Aqua");

            await interaction.reply({ embeds: [embed] });
        }
    },

    async autocomplete(interaction: AutocompleteInteraction) {
        const options = interaction.options as CommandInteractionOptionResolver,
            command = options.getString("command"),
            category = options.getString("category"),
            client = interaction.client as BotClient;

        if (command) {
            const commands = client.commands.map((c) => c.data.name);

            const focused = interaction.options.getFocused();
            const filtered = commands.filter(c => c.startsWith(focused));

            await interaction.respond(
                filtered.map((c) => ({ name: c, value: c }))
            )
        }

        if (category) {
            const categories = [...new Set(
                client.commands.map((c) => c.config.category)
            )]

            const focused = interaction.options.getFocused();
            const filtered = categories.filter(c => c.startsWith(focused));

            await interaction.respond(
                filtered.map((c) => ({ name: c, value: c }))
            )
        }
    }
};
