import { BaseEvent } from "../../interfaces";
import BotClient from "../../classes/Client";
import { Message } from "discord.js";
import AutomodModel, { Automod } from "../../models/AutomodModel";

export default <BaseEvent>{
    name: "messageCreate",
    once: false,
    async execute(client: BotClient, message: Message) {
        if (message.author.bot) return;

        if (!message.guild) return;

        const automod = await AutomodModel.findOne<Automod>({ guildID: message.guild.id });

        if (!automod) return;

        const { gifs } = automod.modules;
        const { content } = message;

        if (gifs.status) {
            if (await client.automod.checkForGIFs(content)) {
                for (const channel of gifs.ignoredChannels) {
                    if (message.channel.id === channel) return;
                }

                message.delete();
                message.channel.send(`${message.author}, you are not allowed to send gifs here.`)
                    .then((msg) => {
                        setTimeout(() => {
                            msg.delete();
                        }, 5000);
                    });
            }
        }
    }
}