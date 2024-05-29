import {
    ModalSubmitInteraction,
    EmbedBuilder
} from "discord.js";
import { BaseModal } from "../../interfaces";
import Ticket from "../../features/Ticket";
import { ITicketCategoryQuestion } from "../../models/TicketsModel";
import BotClient from "../../classes/Client";

export default <BaseModal>{
    customId: "addquestion",
    async execute(interaction: ModalSubmitInteraction) {
        const codeName = (interaction.client as BotClient).ticketCache.get("codeName"),
            id = interaction.fields.getTextInputValue("id"),
            label = interaction.fields.getTextInputValue("label"),
            type = interaction.fields.getTextInputValue("type"),
            placeholder = interaction.fields.getTextInputValue("placeholder"),
            maxLength = interaction.fields.getTextInputValue("maxLength");

        if (!codeName || !id || !label || !type || !placeholder || !maxLength) {
            return interaction.reply({
                content: "Please fill in all the fields",
                ephemeral: true
            });
        }

        if (type !== "SHORT" && type !== "PARAGRAPH") {
            return interaction.reply({
                content: "The type must be either `SHORT` or `PARAGRAPH`",
                ephemeral: true
            });
        }

        const question: ITicketCategoryQuestion = {
            id,
            label,
            type: type as "SHORT" | "PARAGRAPH",
            placeholder,
            maxLength: parseInt(maxLength)
        };

        const ticket = await Ticket.addQuestion(interaction.guildId as string, codeName, question);

        if (!ticket) {
            return interaction.reply({
                content: "An error occurred while adding the question",
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setTitle("Question Added")
            .setDescription(`The question has been added successfully to the category \`${codeName}\``)
            .addFields([
                {
                    name: "ID",
                    value: id
                },
                {
                    name: "Label",
                    value: label
                },
                {
                    name: "Type",
                    value: type
                },
                {
                    name: "Placeholder",
                    value: placeholder
                },
                {
                    name: "Max Length",
                    value: maxLength
                }
            ])
            .setColor("Blurple");

        return interaction.reply({
            embeds: [embed]
        });
    }
}