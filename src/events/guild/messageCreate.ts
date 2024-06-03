import { BaseEvent } from "../../interfaces";
import BotClient from "../../classes/Client";
import { Message } from "discord.js";

export default <BaseEvent>{
    name: "messageCreate",
    once: false,
    async execute(client: BotClient, message: Message) {
        if (message.author.bot) return;

        // const context = await client.ai.generateContent(message.content);
        // const result = await context.response;
        // const text = result.text();
        // return message.reply(text);
    }
}