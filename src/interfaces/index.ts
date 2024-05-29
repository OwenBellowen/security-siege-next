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
    ModalSubmitInteraction
} from "discord.js";
import BotClient from "../classes/Client";

type CategoryType = "admin" | "misc" | "moderation" | "utility" | "dev" | "info";

interface CommandConfig {
    category: CategoryType;
    usage: string;
    examples: string[];
    permissions: PermissionResolvable[];
}

export interface BaseCommand {
    data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">
        | Omit<SlashCommandSubcommandBuilder, "addSubcommand" | "addSubcommandGroup">
        | Omit<SlashCommandSubcommandGroupBuilder, "addSubcommand" | "addSubcommandGroup">
        | Omit<SlashCommandOptionsOnlyBuilder, "addSubcommand" | "addSubcommandGroup">
        | Omit<SlashCommandSubcommandsOnlyBuilder, "addSubcommand" | "addSubcommandGroup">;
    config: CommandConfig;
    execute: (interaction: CommandInteraction) => Awaitable<unknown>;
    autocomplete?: (interaction: AutocompleteInteraction) => Awaitable<unknown>;
}

export interface BaseEvent {
    name: keyof ClientEvents;
    once?: boolean;
    execute: (client: BotClient, ...args: ClientEvents[keyof ClientEvents]) => Awaitable<unknown>;
}

export interface BaseSelectMenu {
    customId: string;
    execute: (interaction: StringSelectMenuInteraction) => Awaitable<unknown>;
}

export interface BaseModal {
    customId: string;
    execute: (interaction: ModalSubmitInteraction) => Awaitable<unknown>;
}