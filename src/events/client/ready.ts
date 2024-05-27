import { BaseEvent } from "../../interfaces";
import BotClient from "../../classes/Client";
import Logger from "../../features/Logger";
import { ActivityType } from "discord.js";

export default <BaseEvent>{
    name: "ready",
    once: true,
    execute(client: BotClient) {
        Logger.info(`Logged in as ${client.user?.tag}`);

        client.user?.setPresence({
            status: "online",
            activities: [
                {
                    name: "your commands",
                    type: ActivityType.Watching
                }
            ]
        })
    }
};