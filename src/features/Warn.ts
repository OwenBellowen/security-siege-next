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
        warnID: string
    ): Promise<Warns | null> {
        const warn = await WarnsModel.findOne({ "warns.id": warnID });

        if (!warn) return null;

        const warnIndex = warn.warns.findIndex(warn => warn.id === warnID);

        warn.warns.splice(warnIndex, 1);

        if (warn.warns.length === 0) {
            await WarnsModel.deleteOne({ _id: warn._id });
            return null;
        }

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