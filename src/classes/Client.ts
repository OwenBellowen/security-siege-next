import { Client, Collection, IntentsBitField } from "discord.js";
import { BaseCommand, BaseEvent, BaseSelectMenu, BaseModal, BaseButton } from "../interfaces";
import { connect } from "mongoose";
import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";

import CommandHandler from "./CommandHandler";
import EventHandler from "./EventHandler";
import Logger from "../features/Logger";

import "dotenv/config";
import config from "../../config/config.json";
import Interactionhandler from "./InteractionHandler";
import TicketLogger from "../features/TicketLogger";

/**
 * Represents a Bot Client.
 */
export default class BotClient extends Client {
    /**
     * Collection of commands.
     */
    public commands: Collection<string, BaseCommand> = new Collection();

    /**
     * Collection of events.
     */
    public events: Collection<string, BaseEvent> = new Collection();

    /**
     * Collection of select menus.
     */
    public selectMenus: Collection<string, BaseSelectMenu> = new Collection();

    /**
     * Collection of modals.
     */
    public modals: Collection<string, BaseModal> = new Collection();

    /**
     * Collection of buttons.
     */
    public buttons: Collection<string, BaseButton> = new Collection();

    /**
     * Collection of tickets.
     */
    public ticketCache: Collection<string, string> = new Collection();

    public ticketQuestionIDs: Collection<string, string[]> = new Collection();

    /**
     * Google Generative AI instance.
     */
    public ai: GenerativeModel = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
        .getGenerativeModel({ model: "gemini-1.5-pro", generationConfig: {
            maxOutputTokens: 100,
            temperature: 0.5,
            topP: 1,
            topK: 40
        }});

    /**
     * Ticket logger instance.
     */
    public ticketLogger: TicketLogger = new TicketLogger(this);

    private commandHandler: CommandHandler = new CommandHandler(this);
    private eventHandler: EventHandler = new EventHandler(this);
    private interactionHandler: Interactionhandler = new Interactionhandler(this);

    /**
     * Bot configuration.
     */
    public config = config;

    /**
     * Creates a new instance of BotClient.
     */
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

    /**
     * Starts the bot client.
     */
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

    /**
     * Connects to the database.
     */
    private async connectDatabase(): Promise<void> {
        await connect(process.env.MONGO_URI as string, {
            dbName: "security-siege"
        })
            .then(() => Logger.success("Connected to the database."))
            .catch(error => {
                Logger.error("An error occurred while connecting to the database.");
                console.error(error);
            });
    }
}