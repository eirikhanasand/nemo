import { EmbedBuilder } from "discord.js"

const pageLength = 10

export default function createEmbeds(fields: Field[]) {
    const embeds = []
    const pages = Math.floor(fields.length / pageLength)

    if (!fields.length) {
        return [
            new EmbedBuilder()
                .setTitle("Prepped tasks")
                .setColor("#fd8738")
                .setTimestamp()
                .addFields([{name: "🕥 No tasks prepared yet...", value: " ", inline: true}])
        ]
    }

    for (let i = 0; i < fields.length / pageLength; i++) {
        const activeIndex = i * pageLength
        const relevant = fields.slice(activeIndex, activeIndex + pageLength)
        if (relevant.length > 0) {
            const embed = new EmbedBuilder()
                .setTitle(`Prepped tasks${fields.length > pageLength ? ` ${i + 1} / ${pages + 1}` : ''}`)
                .setColor("#fd8738")
                .setTimestamp()
                .addFields(relevant)
            embeds.push(embed)
        }
    }

    return embeds
}
