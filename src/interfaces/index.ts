import {
    CommandInteraction,
    Awaitable,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
    SlashCommandSubcommandGroupBuilder,
    ClientEvents,
    PermissionResolvable
} from "discord.js";
import BotClient from "../classes/Client";

type CategoryType = "admin" | "misc" | "moderation" | "utility" | "dev";

interface CommandConfig {
    category: CategoryType;
    usage: string;
    examples: string[];
    permissions: PermissionResolvable[];
}

export interface BaseCommand {
    data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">
        | Omit<SlashCommandSubcommandBuilder, "addSubcommand" | "addSubcommandGroup">
        | Omit<SlashCommandSubcommandGroupBuilder, "addSubcommand" | "addSubcommandGroup">;
    config: CommandConfig;
    execute: (interaction: CommandInteraction) => Awaitable<unknown>;
}

export interface BaseEvent {
    name: keyof ClientEvents;
    once?: boolean;
    execute: (client: BotClient, ...args: ClientEvents[keyof ClientEvents]) => Awaitable<unknown>;
}