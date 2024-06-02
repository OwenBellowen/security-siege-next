import WarnsModel, { Warns } from "../models/WarnsModel";
import Utility from "../classes/Utility";
import { time } from "discord.js";

/**
 * Represents a class for managing warnings.
 */
export default class Warn {
    /**
     * Adds a warning for a user in a guild.
     * @param guildID - The ID of the guild.
     * @param userID - The ID of the user.
     * @param moderator - The name of the moderator who issued the warning.
     * @param reason - The reason for the warning.
     * @returns A Promise that resolves to the updated Warns object.
     */
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

    /**
     * Removes a warning from the Warns object.
     * @param warnID - The ID of the warning to remove.
     * @returns A Promise that resolves to the updated Warns object, or null if the warning was not found.
     */
    public static async removeWarn(
        warnID: string
    ): Promise<Warns | null> {
        const warn = await WarnsModel.findOne({ "warns.id": warnID });

        if (!warn) return null;

        const warnIndex = warn.warns.findIndex(w => w.id === warnID);

        warn.warns.splice(warnIndex, 1);

        if (warn.warns.length === 0) {
            await WarnsModel.deleteOne({ _id: warn._id });
            return null;
        }

        return await warn.save();
    }

    /**
     * Retrieves the Warns object for a user in a guild.
     * @param guildID - The ID of the guild.
     * @param userID - The ID of the user.
     * @returns A Promise that resolves to the Warns object, or null if the user has no warnings.
     */
    public static async getWarns(guildID: string, userID: string): Promise<Warns | null> {
        return await WarnsModel.findOne({ guildID, userID });
    }

    /**
     * Retrieves the number of warnings for a user in a guild.
     * @param guildID - The ID of the guild.
     * @param userID - The ID of the user.
     * @returns A Promise that resolves to the number of warnings.
     */
    public static async getWarnsCount(guildID: string, userID: string): Promise<number> {
        const warns = await WarnsModel.findOne({ guildID, userID });

        if (!warns) return 0;

        return warns.warns.length;
    }

    /**
     * Clears all warnings for a user in a guild.
     * @param guildID - The ID of the guild.
     * @param userID - The ID of the user.
     * @returns A Promise that resolves when the warnings are cleared.
     */
    public static async clearWarns(guildID: string, userID: string): Promise<void> {
        await WarnsModel.deleteOne({ guildID, userID });
    }
}