import { Client, Collection, IntentsBitField } from "discord.js";
import { BaseCommand, BaseEvent } from "../interfaces";

import CommandHandler from "./CommandHandler";
import EventHandler from "./EventHandler";

import "dotenv/config";
import config from "../../config/config.json";

export default class BotClient extends Client {
    public commands: Collection<string, BaseCommand> = new Collection();
    public events: Collection<string, BaseEvent> = new Collection();

    private commandHandler: CommandHandler = new CommandHandler(this);
    private eventHandler: EventHandler = new EventHandler(this);

    public config = config;

    public constructor() {
        super({
            intents: [
                IntentsBitField.Flags.Guilds,
                IntentsBitField.Flags.GuildMessages,
                IntentsBitField.Flags.GuildMessageReactions,
                IntentsBitField.Flags.DirectMessages,
                IntentsBitField.Flags.DirectMessageReactions,
                IntentsBitField.Flags.MessageContent,
                IntentsBitField.Flags.GuildMembers
            ],
            allowedMentions: { parse: ["users", "roles"], repliedUser: true },
            shards: "auto"
        });
    }

    public async start(): Promise<void> {
        this.login(process.env.TOKEN);
        this.commandHandler.loadCommands();
        this.commandHandler.registerCommands();
        this.eventHandler.loadEvents();
    }
}