import { BaseSelectMenu } from "../../interfaces";
import {
    StringSelectMenuInteraction,
    APIEmbedField,
    RestOrArray,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    EmbedBuilder
} from "discord.js";
import Logger from "../../features/Logger";
import Warn from "../../features/Warn";
import WarnsModel from "../../models/WarnsModel";
import { moderation } from "../../../config/messages.json";

export default <BaseSelectMenu>{
    customId: "warns",
    async execute(interaction: StringSelectMenuInteraction) {
        const warning = await WarnsModel.findOne({ "warns.id": interaction.values[0] });

        if (!warning) return interaction.reply({ content: "This warning does not exist.", ephemeral: true });

        const warn = warning.warns.find(warn => warn.id === interaction.values[0]);

        if (!warn) return interaction.reply({ content: "This warning does not exist.", ephemeral: true });

        try {
            await Warn.removeWarn(warn.id);
            interaction.reply({ content: "The warning has been removed." });

            warning.warns = warning.warns.filter(warn => warn.id !== interaction.values[0]);

            if (warning.warns.length === 0) {
                const embed = new EmbedBuilder()
                    .setTitle("No warns")
                    .setDescription("This user has no more warns.")
                    .setColor("Aqua");

                interaction.message.edit({ embeds: [embed], components: [] });
            } else {
                let warnFields: RestOrArray<APIEmbedField> = [];

                for (const warn of warning.warns) {
                    warnFields.push({
                        name: `Warn ID: ${warn.id}`,
                        value: `Moderator: <@${warn.moderator}>\nReason: ${warn.reason}`
                    });
                }

                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId("warns")
                    .setPlaceholder("Select a warning to remove")
                    .addOptions(
                        warning.warns.map(warn => new StringSelectMenuOptionBuilder()
                            .setLabel(`Warn ID: ${warn.id}`)
                            .setDescription(`Reason: ${warn.reason}`)
                            .setValue(warn.id)
                        )
                    );

                const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>()
                    .addComponents(selectMenu);

                const embed = new EmbedBuilder()
                    .setTitle(moderation.warn.list.warnings.replace("{USER}", `\`${interaction.client.users.cache.get(warning.userID)?.username}\``))
                    .setColor("Aqua")
                    .addFields(warnFields)
                    .setFooter({
                        text: moderation.warn.list.footer.replace("{REQUESTER}", interaction.user.username),
                        iconURL: interaction.user.displayAvatarURL()
                    })
                    .setTimestamp();

                interaction.message.edit({ embeds: [embed], components: [actionRow] });
            }
        } catch (error) {
            Logger.error(error as string);
            interaction.reply({ content: "An error occurred while removing the warning.", ephemeral: true });
        }
    }
};