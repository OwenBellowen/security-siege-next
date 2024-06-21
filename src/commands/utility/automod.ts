import {
    CommandInteraction,
    SlashCommandBuilder,
    CommandInteractionOptionResolver,
    PermissionFlagsBits
} from "discord.js";
import { BaseCommand } from "../../interfaces";
import AutomodModel, { Automod } from "../../models/AutomodModel";

export default <BaseCommand>{
    data: new SlashCommandBuilder()
        .setName("automod")
        .setDescription("Automod settings for the server.")
        .addSubcommand(subcommand =>
            subcommand
                .setName("enable_disable")
                .setDescription("Enable or disable automod.")
                .addStringOption(option =>
                    option
                        .setName("status")
                        .setDescription("Enable or disable automod.")
                        .setRequired(true)
                        .addChoices(
                            { name: "Enable", value: "enable" },
                            { name: "Disable", value: "disable" }
                        )
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("module")
                .setDescription("Enable or disable a module.")
                .addStringOption(option =>
                    option
                        .setName("module")
                        .setDescription("The module to enable or disable.")
                        .setRequired(true)
                        .addChoices(
                            { name: "Gifs", value: "gifs" },
                            { name: "Links", value: "links" },
                            { name: "Words", value: "words" }
                        )
                )
                .addStringOption(option =>
                    option
                        .setName("status")
                        .setDescription("Enable or disable the module.")
                        .setRequired(true)
                        .addChoices(
                            { name: "Enable", value: "enable" },
                            { name: "Disable", value: "disable" }
                        )
                )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),
    config: {
        category: "utility",
        usage: "<subcommand> [options]",
        examples: ["enable_disable enable", "module gifs enable"],
        permissions: ["Administrator"]
    },
    async execute(interaction: CommandInteraction) {
        if (!interaction.guild) return;
        
        const options = interaction.options as CommandInteractionOptionResolver;
        const subcommand = options.getSubcommand();
        
        let automod: Automod | null = await AutomodModel.findOne({ guildID: interaction.guild.id });
        
        if (!automod) {
            automod = await AutomodModel.create({
                guildID: interaction.guild.id,
                enabled: false,
                modules: {
                    gifs: {
                        status: false,
                        ignoredChannels: []
                    },
                    links: false,
                    words: false
                },
                words: []
            });
        
            await automod.save();
        }
        
        if (subcommand === "enable_disable") {
            const status = options.getString("status", true);
            const enabled = status === "enable";
        
            await AutomodModel.findOneAndUpdate({ guildID: interaction.guild.id }, { enabled });
            interaction.reply(`Automod has been ${enabled ? "enabled" : "disabled"}.`);
        } else if (subcommand === "module") {
            const module = options.getString("module", true);
            const moduleStatus = options.getString("status", true);
        
            if (!automod.enabled) {
                return interaction.reply("Automod is disabled. Please enable automod first.");
            }
        
            const moduleEnabled = moduleStatus === "enable";
        
            switch (module) {
                case "gifs":
                    await AutomodModel.findOneAndUpdate({ guildID: interaction.guild.id }, { modules: { gifs: { status: moduleEnabled } } });
                    interaction.reply(`Gifs module has been ${moduleEnabled ? "enabled" : "disabled"}.`);
                    break;
                case "links":
                    await AutomodModel.findOneAndUpdate({ guildID: interaction.guild.id }, { modules: { links: moduleEnabled } });
                    interaction.reply(`Links module has been ${moduleEnabled ? "enabled" : "disabled"}.`);
                    break;
                case "words":
                    await AutomodModel.findOneAndUpdate({ guildID: interaction.guild.id }, { modules: { words: moduleEnabled } });
                    interaction.reply(`Words module has been ${moduleEnabled ? "enabled" : "disabled"}.`);
                    break;
            }
        }
    }
}