import { EmbedBuilder, MessageReaction, TextChannel, User } from "discord.js"
import createEmbeds from "./createEmbeds.js"
import { Reaction } from "../../interfaces.js"
import getButtons from "./buttons.js"
import getReactionsFromEmbedFields from "./getReactionsFromEmbedField.js"
import react from "./react.js"
import combineValues from "./combineValues.js"

export default async function restructureEmbeds(reaction: MessageReaction, user: User, action: Reaction) {
    const embeds = global.preppedTasks.get(reaction.message.channelId)
    if (!embeds) {
        console.error(`Tried going to the previous page in ${reaction.message.channelId}, but found no embeds.`)
        return
    }

    const tempEmbeds: Field[] = []
    for (const embed of embeds) {
        tempEmbeds.push(...embed.data.fields as Field[])
    }

    if (action === Reaction.Add) {
        const name = reaction.message.content?.split('\n').find(line => line.includes(reaction.emoji.name || '')) || ''
        tempEmbeds.push({ name, value: `<@${user.id}>`})
    } else {
        const newEmbeds = []
        for (const field of tempEmbeds) {
            if (field.name.includes(reaction.emoji.name || '')) {
                const value = removeReaction(field.value, user.id)
                if (value.length > 0) {
                    newEmbeds.push({name: field.name, value })
                }

                continue
            }

            newEmbeds.push(field)
        }
        tempEmbeds.length = 0
        tempEmbeds.push(...newEmbeds)
    }

    const combinedFields = combineValues(tempEmbeds).sort((a, b) => a.name.localeCompare(b.name))
    const restructuredEmbeds = createEmbeds(combinedFields)
    global.preppedTasks.set(reaction.message.channelId, restructuredEmbeds)
    const lastMessage = await reaction.message.channel.messages.fetch((reaction.message.channel as TextChannel).lastMessageId || "")
    const components = getButtons(0, restructuredEmbeds.length)
    lastMessage.edit({ embeds: [restructuredEmbeds[0]], components })
    const reactions = getReactionsFromEmbedFields(combinedFields || [])
    lastMessage.reactions.removeAll()
    react(lastMessage, reactions.slice(0, 10))
}

function removeReaction(value: string, id: string) {
    const oldValues = value.split('\n')
    const newValues = []
    
    for (const value of oldValues) {
        if (!value.includes(id)) {
            newValues.push(value)
        }
    }

    return newValues.join(' ')
}
