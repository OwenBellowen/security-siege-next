import { readdirSync } from "fs";
import { join } from "path";
import { BaseSelectMenu, BaseModal, BaseButton } from "../interfaces";
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

    public loadModals(): void {
        const modals = readdirSync(join(__dirname, "..", "interactions", "modals")).filter(file => file.endsWith(".ts"));

        for (const file of modals) {
            const modal = require(join(__dirname, "..", "interactions", "modals", file)).default as BaseModal;
            this.client.modals.set(modal.customId, modal);
        }

        Logger.success("Modals loaded.");
    }

    public loadButtons(): void {
        const buttons = readdirSync(join(__dirname, "..", "interactions", "buttons")).filter(file => file.endsWith(".ts"));

        for (const file of buttons) {
            const button = require(join(__dirname, "..", "interactions", "buttons", file)).default as BaseButton;
            this.client.buttons.set(button.customId, button);
        }

        Logger.success("Buttons loaded.");
    }
}