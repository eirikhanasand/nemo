import { ButtonInteraction, ChatInputCommandInteraction } from "discord.js"
import { nextPage, previousPage } from "./preppedPage.js"
import { nextPage as nextPageHelp, previousPage as previousPageHelp } from "./help.js"

export default async function handleComponents(interaction: ButtonInteraction | ChatInputCommandInteraction, id: string | undefined) {    
    const buttonInteraction = interaction as ButtonInteraction

    // id is present if interaction is ChatInputCommandInteraction
    switch (id || buttonInteraction.customId) {
        case 'next_page':
            await nextPage(buttonInteraction)
            break
            case 'previous_page':
            await previousPage(buttonInteraction)
            break
        case 'next_page_help':
            await nextPageHelp(buttonInteraction)
            break
        case 'previous_page_help':
            await previousPageHelp(buttonInteraction)
            break
        case 'error':
        case 'trash':
            await (interaction as ButtonInteraction).message.delete()
            break
        default:
            console.error(`${buttonInteraction.customId || id} is unhandled in handleComponents.`)
            await buttonInteraction.reply({ content: `Unknown action. ${buttonInteraction.customId}`, ephemeral: true })
            break
    }
}
