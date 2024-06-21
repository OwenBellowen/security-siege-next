import BotClient from "./Client";
import Logger from "../features/Logger";

export default class AutomodHandler {
    public gifRegex = /https?:\/\/tenor\.com\/view\/.*/gi;
    
    constructor(public botClient: BotClient) {}

    public async checkForGIFs(content: string): Promise<boolean> {
        if (content.endsWith(".gif")) return true;
        return this.gifRegex.test(content);
    }
}