import { BaseEvent } from "../../interfaces";
import BotClient from "../../classes/Client";
import { Message } from "discord.js";

export default <BaseEvent>{
    name: "messageCreate",
    once: false,
    async execute(client: BotClient, message: Message) {
        if (message.author.bot) return;

        if (message.guildId !== client.config.guildID) return;

        // Not finished implemented
        // const infoBot = `You are ${client.user?.username}, a Discord multi-purpose bot.`;
        // const user = `User: ${message.author.username} sent a message: \`${message.content}\``;
        // const prompt = "Give simple information about the context."
        // const context = await (await client.ai.generateContent([infoBot, user, prompt])).response;
        // const text = context.text();
        // return message.reply(text);
    }
}