import {
    TextChannel,
    EmbedBuilder,
    User,
    time
} from "discord.js";
import { TicketLogsModel, TicketModel } from "../models/TicketsModel";
import BotClient from "../classes/Client";

type LogType = 'ticketOpened' | 'ticketClosed' | 'ticketClaimed' | 'ticketDeleted';
const botImageURLs = {
    ticketOpened: 'https://i.imgur.com/M38ZmjM.png',
    ticketClosed: 'https://i.imgur.com/5ShDA4g.png',
    ticketClaimed: 'https://i.imgur.com/qqEaUyR.png',
    ticketDeleted: 'https://i.imgur.com/obTW2BS.png'
};

export default class TicketLogger {
    constructor(private client: BotClient) { }

    public async log(type: LogType, channel: TextChannel) {
        const logs = await TicketLogsModel.findOne({ guildID: channel.guild.id });
        const ticket = await TicketModel.findOne({ channelID: channel.id });

        if (!logs || !ticket) return null;

        const { userID, createdAt, category, claimedBy } = ticket;

        const user = await this.client.users.fetch(userID) as User;
        const claimedByUser = claimedBy ? await this.client.users.fetch(claimedBy) : null;

        const logsChannel = this.client.channels.cache.get(logs.channelID) as TextChannel;

        if (!logsChannel) return null;

        const webhook = await (await logsChannel.fetchWebhooks()).first() ??
            await logsChannel.createWebhook({
                name: 'Ticket Logger'
            });

        if (!webhook) return null;

        if (type === 'ticketOpened') {
            const embed = new EmbedBuilder()
                .setTitle('Ticket Opened')
                .setDescription(`Ticket opened by ${user.toString()} in ${channel.toString()} at ${createdAt}`)
                .setAuthor({
                    name: user.username,
                    iconURL: user.displayAvatarURL()
                })
                .addFields([
                    {
                        name: 'User ID',
                        value: `\`${userID}\``,
                        inline: true
                    },
                    {
                        name: 'Category',
                        value: `\`${category}\``,
                        inline: true
                    }
                ])
                .setColor('Green');

            return webhook.send({
                username: 'Ticket Opened',
                embeds: [embed],
                avatarURL: botImageURLs.ticketOpened
            });
        }

        if (type === 'ticketClosed') {
            const embed = new EmbedBuilder()
                .setTitle('Ticket Closed')
                .setDescription(`Ticket closed by ${user.toString()} in ${channel.toString()} at ${time()}`)
                .setAuthor({
                    name: user.username,
                    iconURL: user.displayAvatarURL()
                })
                .addFields([
                    {
                        name: 'User ID',
                        value: `\`${userID}\``,
                        inline: true
                    },
                    {
                        name: 'Category',
                        value: `\`${category}\``,
                        inline: true
                    }
                ])
                .setColor('Red');

            return webhook.send({
                username: 'Ticket Closed',
                embeds: [embed],
                avatarURL: botImageURLs.ticketClosed
            });
        }

        if (type === 'ticketClaimed') {
            const embed = new EmbedBuilder()
                .setTitle('Ticket Claimed')
                .setDescription(`Ticket claimed by ${claimedByUser?.toString()} in ${channel.toString()} at ${time()}`)
                .setAuthor({
                    name: claimedByUser?.username as string,
                    iconURL: claimedByUser?.displayAvatarURL()
                })
                .addFields([
                    {
                        name: 'User ID',
                        value: `\`${userID}\``,
                        inline: true
                    },
                    {
                        name: 'Category',
                        value: `\`${category}\``,
                        inline: true
                    }
                ])
                .setColor('Yellow');

            return webhook.send({
                username: 'Ticket Claimed',
                embeds: [embed],
                avatarURL: botImageURLs.ticketClaimed
            });
        }

        if (type === 'ticketDeleted') {
            const embed = new EmbedBuilder()
                .setTitle('Ticket Deleted')
                .setDescription(`Ticket \`${channel.name}\` was deleted by ${user.toString()} at ${time()}`)
                .setAuthor({
                    name: user.username,
                    iconURL: user.displayAvatarURL()
                })
                .addFields([
                    {
                        name: 'User ID',
                        value: `\`${userID}\``,
                        inline: true
                    },
                    {
                        name: 'Category',
                        value: `\`${category}\``,
                        inline: true
                    }
                ])
                .setColor('Red');

            return webhook.send({
                username: 'Ticket Deleted',
                embeds: [embed],
                avatarURL: botImageURLs.ticketDeleted
            });
        }
    }
}
