import {
    ModalSubmitInteraction,
    EmbedBuilder
} from "discord.js";
import { BaseModal } from "../../interfaces";
import Ticket from "../../features/Ticket";
import { ITicketCategory } from "../../models/TicketsModel";
import BotClient from "../../classes/Client";

export default <BaseModal> {
    customId: "add-category",
    async execute(interaction: ModalSubmitInteraction) {
        const codeName = (interaction.client as BotClient).ticketCache.get("codeName"),
            staffRoles = (interaction.client as BotClient).ticketCache.get("staffRoles") as string,
            emoji = (interaction.client as BotClient).ticketCache.get("emoji") as string,
            name = interaction.fields.getTextInputValue("name"),
            description = interaction.fields.getTextInputValue("description"),
            ticketName = interaction.fields.getTextInputValue("ticketName");

        if (!codeName || !name || !description || !emoji || !ticketName || !staffRoles) {
            return interaction.reply({
                content: "Please fill in all the fields",
                ephemeral: true
            });
        }

        const category: ITicketCategory = {
            guildID: interaction.guildId as string,
            codeName,
            name,
            description,
            emoji,
            ticketName,
            staffRoles: staffRoles ? staffRoles.split(",") : [],
            questions: []
        };

        const ticket = await Ticket.addCategory(interaction.guildId as string, category);

        if (!ticket) {
            return interaction.reply({
                content: "An error occurred while adding the category",
                ephemeral: true
            });
        }

        const staffRoleMentions = category.staffRoles.map((role) => `<@&${role}>`).join(", ");

        const embed = new EmbedBuilder()
            .setTitle("Category Added")
            .setDescription(`The category: \`${name}\` has been added successfully`)
            .addFields([
                {
                    name: "Code Name",
                    value: codeName
                },
                {
                    name: "Name",
                    value: name
                },
                {
                    name: "Description",
                    value: description
                },
                {
                    name: "Emoji",
                    value: emoji
                },
                {
                    name: "Ticket Name",
                    value: ticketName
                },
                {
                    name: "Staff Roles",
                    value: staffRoleMentions
                }
            ])
            .setColor("Blurple");

        await (interaction.client as BotClient).ticketCache.delete("codeName");

        return interaction.reply({
            embeds: [embed]
        });
    }
}