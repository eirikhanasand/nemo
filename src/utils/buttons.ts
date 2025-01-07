import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js"

export default function getButtons(page: number, pages: number) {
    const previous = new ButtonBuilder()
        .setCustomId('previous_page')
        .setLabel('Previous')
        .setStyle(ButtonStyle.Secondary)

    const next = new ButtonBuilder()
        .setCustomId('next_page')
        .setLabel('Next')
        .setStyle(ButtonStyle.Secondary)

    const buttons = new ActionRowBuilder<ButtonBuilder>()

    if (pages === 1) {
        return
    } else if (page > 0 && page < pages - 1) {
        buttons.addComponents(previous, next)
    } else if (page > 0) {
        buttons.addComponents(previous)
    } else if (page < pages) {
        buttons.addComponents(next)
    }

    return buttons.components.length ? [buttons] : undefined
}
