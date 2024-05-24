import { BaseEvent } from "../../interfaces";
import BotClient from "../../classes/Client";

export default <BaseEvent>{
    name: "ready",
    once: true,
    execute(client: BotClient) {
        console.log(`Logged in as ${client.user?.username}!`);
    }
};