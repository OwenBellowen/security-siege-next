import { readdirSync } from "fs";
import { join } from "path";
import { BaseEvent } from "../interfaces";
import BotClient from "./Client";
import Logger from "../features/Logger";

/**
 * Represents an event handler that loads and handles events for a bot client.
 */
export default class EventHandler {
    constructor(private client: BotClient) {}

    /**
     * Loads events from event folders and sets up event listeners for each event.
     */
    public loadEvents(): void {
        const eventFolders = readdirSync(join(__dirname, "..", "events"));
        for (const folder of eventFolders) {
            const eventFiles = readdirSync(join(__dirname, "..", "events", folder)).filter(file => file.endsWith(".ts"));
            for (const file of eventFiles) {
                const event = require(join(__dirname, "..", "events", folder, file)).default as BaseEvent;
                this.client.events.set(event.name, event);

                if (event.once) {
                    this.client.once(event.name, (...args) => event.execute(this.client, ...args));
                } else {
                    this.client.on(event.name, (...args) => event.execute(this.client, ...args));
                }
            }
        }

        Logger.success("Events loaded.");
    }
}