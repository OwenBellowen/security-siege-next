import {
    CommandInteraction,
    Awaitable,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
    SlashCommandSubcommandGroupBuilder,
    ClientEvents,
    PermissionResolvable,
    AutocompleteInteraction,
    SlashCommandOptionsOnlyBuilder,
    SlashCommandSubcommandsOnlyBuilder,
    StringSelectMenuInteraction,
    ModalSubmitInteraction,
    ButtonInteraction
} from "discord.js";
import BotClient from "../classes/Client";

// Category types for commands
type CategoryType = "admin" | "misc" | "moderation" | "utility" | "dev" | "info" | "ticket";

// Command configuration interface
interface CommandConfig {
    // Category of the command
    category: CategoryType;
    // Usage of the command
    usage: string;
    // Examples of how to use the command
    examples: string[];
    // Permissions required to use the command
    permissions: PermissionResolvable[];
}

// Base command interface
export interface BaseCommand {
    // Slash command data
    data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">
        | Omit<SlashCommandSubcommandBuilder, "addSubcommand" | "addSubcommandGroup">
        | Omit<SlashCommandSubcommandGroupBuilder, "addSubcommand" | "addSubcommandGroup">
        | Omit<SlashCommandOptionsOnlyBuilder, "addSubcommand" | "addSubcommandGroup">
        | Omit<SlashCommandSubcommandsOnlyBuilder, "addSubcommand" | "addSubcommandGroup">;
    // Command configuration
    config: CommandConfig;
    // Command execution function
    execute: (interaction: CommandInteraction) => Awaitable<unknown>;
    // Autocomplete function (optional)
    autocomplete?: (interaction: AutocompleteInteraction) => Awaitable<unknown>;
}

// Base event interface
export interface BaseEvent {
    // Event name
    name: keyof ClientEvents;
    // Whether the event should be executed only once
    once?: boolean;
    // Event execution function
    execute: (client: BotClient, ...args: ClientEvents[keyof ClientEvents]) => Awaitable<unknown>;
}

// Base select menu interface
export interface BaseSelectMenu {
    // Custom ID of the select menu
    customId: string;
    // Select menu execution function
    execute: (interaction: StringSelectMenuInteraction) => Awaitable<unknown>;
}

// Base modal interface
export interface BaseModal {
    // Custom ID of the modal
    customId: string;
    // Modal execution function
    execute: (interaction: ModalSubmitInteraction) => Awaitable<unknown>;
}

// Base button interface
export interface BaseButton {
    // Custom ID of the button
    customId: string;
    // Button execution function
    execute: (interaction: ButtonInteraction) => Awaitable<unknown>;
}
