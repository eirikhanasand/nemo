import { ButtonInteraction, Embed } from "discord.js"
import getButtons from "./buttons.ts"
import getReactionsFromEmbedFields from "./getReactionsFromEmbedField.ts"
import react from "./react.ts"

export async function nextPage(interaction: ButtonInteraction) {
    const page = extractPageNumberFromEmbed(interaction.message.embeds[0])
    const embeds = global.preppedTasks.get(interaction.channelId)

    if (!embeds) {
        console.error(`Tried going to the next page in ${interaction.channelId}, but found no embeds.`)
        return
    }

    const newPage = embeds[page]
    const newButtons = getButtons(page, embeds?.length || 0)
    const reactions = getReactionsFromEmbedFields(newPage.data.fields || [])
    await interaction.update({ embeds: [newPage], components: newButtons })
    interaction.message.reactions.removeAll()
    react(interaction.message, reactions)
}

export async function previousPage(interaction: ButtonInteraction) {
    const page = extractPageNumberFromEmbed(interaction.message.embeds[0])
    const previousPage = page - 2
    const embeds = global.preppedTasks.get(interaction.channelId)
    
    if (!embeds) {
        console.error(`Tried going to the previous page in ${interaction.channelId}, but found no embeds.`)
        return
    }
    
    const newPage = embeds[previousPage]
    const reactions = getReactionsFromEmbedFields(newPage.data.fields || [])
    const newButtons = getButtons(previousPage, embeds?.length || 0)
    await interaction.update({ embeds: [newPage], components: newButtons })
    interaction.message.reactions.removeAll()
    react(interaction.message, reactions)
}

function extractPageNumberFromEmbed(embed: Embed): number {
    const match = embed.data.title?.match(/Prepped tasks (\d+) \/ \d+/)
    if (match && match[1]) {
        return parseInt(match[1], 10)
    }

    return 0
}
