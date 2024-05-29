import { readdirSync } from "fs";
import { join } from "path";
import { BaseSelectMenu } from "../interfaces";
import BotClient from "./Client";
import Logger from "../features/Logger";

export default class Interactionhandler {
    public constructor(private client: BotClient) {}

    public loadSelectMenus(): void {
        const selectMenus = readdirSync(join(__dirname, "..", "interactions", "selectMenus")).filter(file => file.endsWith(".ts"));

        for (const file of selectMenus) {
            const selectMenu = require(join(__dirname, "..", "interactions", "selectMenus", file)).default as BaseSelectMenu;
            this.client.selectMenus.set(selectMenu.customId, selectMenu);
        }

        Logger.success("Select menus loaded.");
    }
}