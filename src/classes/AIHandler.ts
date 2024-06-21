import {
    GenerativeModel,
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} from "@google/generative-ai";
import BotClient from "./Client";

export default class AIHandler {
    private ai: GenerativeModel = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
        .getGenerativeModel({
            model: "gemini-1.0-pro-001", generationConfig: {
                temperature: 0.9,
                topP: 1,
                topK: 0,
                maxOutputTokens: 40,
                responseMimeType: "text/plain",
            }
        });

    constructor(private client: BotClient) { }

    public async generateContent(input: string): Promise<string> {
        const result = await this.ai.startChat({
            safetySettings: [
                {
                    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
                },
                {
                    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
                },
                {
                    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
                },
                {
                    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
                },
            ],
        });

        return (await result.sendMessage(input)).response.text();
    }
}