import WarnsModel, { Warns } from "../models/WarnsModel";
import Utility from "../classes/Utility";
import { time } from "discord.js";

export default class Warn {
    public static async warn(
        guildID: string,
        userID: string,
        moderator: string,
        reason: string
    ): Promise<Warns> {
        const warn = await WarnsModel.findOne({ guildID, userID });

        if (warn) {
            warn.warns.push({
                id: Utility.uuid(),
                moderator,
                reason,
                timestamp: time()
            });

            return await warn.save();
        }

        return await WarnsModel.create({
            guildID,
            userID,
            warns: [
                {
                    id: Utility.uuid(),
                    moderator,
                    reason,
                    timestamp: time()
                }
            ]
        });
    }

    public static async removeWarn(
        guildID: string,
        userID: string,
        warnID: string
    ): Promise<Warns | null> {
        const warn = await WarnsModel.findOne({ guildID, userID });

        if (!warn) return null;

        const index = warn.warns.findIndex(warn => warn.id === warnID);

        if (index === -1) return null;

        warn.warns.splice(index, 1);

        return await warn.save();
    }

    public static async getWarns(guildID: string, userID: string): Promise<Warns | null> {
        return await WarnsModel.findOne({ guildID, userID });
    }

    public static async getWarnsCount(guildID: string, userID: string): Promise<number> {
        const warns = await WarnsModel.findOne({ guildID, userID });

        if (!warns) return 0;

        return warns.warns.length;
    }

    public static async clearWarns(guildID: string, userID: string): Promise<void> {
        await WarnsModel.deleteOne({ guildID, userID });
    }
}