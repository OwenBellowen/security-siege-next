import {
    TextChannel,
    EmbedBuilder,
    User,
    time,
    ColorResolvable
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

/**
 * Represents a TicketLogger class that handles logging ticket events.
 */
export default class TicketLogger {
    constructor(private client: BotClient) { }

    /**
     * Logs a ticket event.
     * @param type - The type of the event.
     * @param channel - The text channel where the event occurred.
     * @returns A Promise that resolves to the result of sending the log message.
     */
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

        let title = '';
        let description = '';
        let color: ColorResolvable;

        switch (type) {
            case 'ticketOpened':
                title = 'Ticket Opened';
                description = `Ticket opened by ${user.toString()} in ${channel.toString()} at ${createdAt}`;
                color = 'Green';
                break;
            case 'ticketClosed':
                title = 'Ticket Closed';
                description = `Ticket closed by ${user.toString()} in ${channel.toString()} at ${time()}`;
                color = 'Red';
                break;
            case 'ticketClaimed':
                title = 'Ticket Claimed';
                description = `Ticket claimed by ${claimedByUser?.toString()} in ${channel.toString()} at ${time()}`;
                color = 'Yellow';
                break;
            case 'ticketDeleted':
                title = 'Ticket Deleted';
                description = `Ticket \`${channel.name}\` was deleted by ${user.toString()} at ${time()}`;
                color = 'Red';
                break;
            default:
                return null;
        }

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
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
            .setColor(color);

        const avatarURL = botImageURLs[type];

        return webhook.send({
            username: title,
            embeds: [embed],
            avatarURL
        });
    }
}
