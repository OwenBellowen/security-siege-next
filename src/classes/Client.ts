import { Client, Collection, IntentsBitField } from "discord.js";
import { BaseCommand, BaseEvent, BaseSelectMenu, BaseModal, BaseButton } from "../interfaces";
import { connect } from "mongoose";

import CommandHandler from "./CommandHandler";
import EventHandler from "./EventHandler";
import Logger from "../features/Logger";

import "dotenv/config";
import config from "../../config/config.json";
import Interactionhandler from "./InteractionHandler";

export default class BotClient extends Client {
    public commands: Collection<string, BaseCommand> = new Collection();
    public events: Collection<string, BaseEvent> = new Collection();
    public selectMenus: Collection<string, BaseSelectMenu> = new Collection();
    public modals: Collection<string, BaseModal> = new Collection();
    public buttons: Collection<string, BaseButton> = new Collection();

    public ticketCache: Collection<string, string> = new Collection();

    private commandHandler: CommandHandler = new CommandHandler(this);
    private eventHandler: EventHandler = new EventHandler(this);
    private interactionHandler: Interactionhandler = new Interactionhandler(this);

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

        // Load commands and events
        this.commandHandler.loadCommands();
        this.commandHandler.registerCommands();
        this.eventHandler.loadEvents();

        // Load interactions
        this.interactionHandler.loadSelectMenus();
        this.interactionHandler.loadModals();
        this.interactionHandler.loadButtons();

        // Connect to the database
        await this.connectDatabase();
    }

    private async connectDatabase(): Promise<void> {
        await connect(this.config.mongoURI, {
            dbName: "security-siege"
        })
            .then(() => Logger.success("Connected to the database."))
            .catch(error => {
                Logger.error("An error occurred while connecting to the database.");
                console.error(error);
            });
    }
}