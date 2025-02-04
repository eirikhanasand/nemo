import { EmbedBuilder, Message, PermissionsBitField, TextChannel } from "discord.js"
import appendReaction from "./appendReaction.js"
import combineValues from "./combineValues.js"
import createEmbeds from "./createEmbeds.js"
import getButtons from "./buttons.js"
import react from "./react.js"
import getReactionsFromEmbedFields from "./getReactionsFromEmbedField.js"

export default async function deleteAndRecreate(channel: TextChannel) {
    const textChannel = channel as TextChannel
    const me = textChannel.guild.members.me
    const permissions = me ? textChannel.permissionsFor(me) : undefined    
    if (!permissions?.has([PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ReadMessageHistory])) {
        console.error(`Skipped ${textChannel.name}, no access.`)
        return
    }
    console.log(`Continued with ${textChannel.name}...`)
    
    const messages = (await textChannel.messages.fetch({ limit: 25 })).reverse()
    let lastMessage = await textChannel.messages.fetch("")
    global.finished.set(channel.id, false)

    try {
        lastMessage = await textChannel.messages.fetch(textChannel.lastMessageId || "")
    } catch (error) {
        console.error(`Unable to edit last message in ${textChannel.name}. Continuing without editing.`)
    }

    if (lastMessage) {
        const relevant = Array.isArray(lastMessage.embeds) ? lastMessage.embeds[0] : null
        const needsToBeEditedWhileRestarting = relevant?.title?.includes("Prepped tasks") ? lastMessage : null
        if (needsToBeEditedWhileRestarting) {
            const embeds = lastMessage.embeds
            const updatedEmbeds = { 
                embeds: [{
                    ...embeds[0].data, 
                    description: `Reloading (0s)...\nEstimated time remaining: 180s`
                }, ...embeds.slice(1)], 
                components: []
            }
            await lastMessage.edit(updatedEmbeds)
            updateEvery5SecondsWhileReloading(lastMessage)
        }
    } else {
        updateEvery5SecondsWhileReloading(undefined)
    }

    let exists = null
    const fields: Field[] = []
    
    for (const [, message] of messages) {
        if (message.id === lastMessage?.id) {
            const relevant = message.embeds[0]
            exists = relevant.title?.includes("Prepped tasks") ? message : null
            continue
        }
        
        if (message.embeds.length > 0) {
            const embedWithPreppedTasks = message.embeds.find(embed => embed.title?.includes("Prepped tasks"))
            if (embedWithPreppedTasks) {
                await message.delete()
                console.error(`Deleted outdated tasks in ${channel.name}.`)
            }
        }

        const newFields = await appendReaction(message)
        if (newFields.length > 0) {
            fields.push(...newFields)
        }
    }

    global.finished.set(channel.id, true)
    const combinedFields = combineValues(fields)
    const embeds = createEmbeds(combinedFields)
    global.preppedTasks.set(channel.id, embeds)

    setTimeout(async() => {
        const page = (Number((exists?.embeds[0].title?.match(/\d/) || [0])[0]) || 1) - 1
        await send(embeds, textChannel, exists, page)
    }, 5050)
}

async function send(embeds: EmbedBuilder[], textChannel: TextChannel, exists: Message<true> | null, page: number) {
    const components = getButtons(page, embeds.length)
    const reactions = getReactionsFromEmbedFields(embeds[0].data.fields || [])

    if (!exists) {
        const message = await textChannel.send({ embeds: [embeds[0]], components })
        message.reactions.removeAll()
        react(message, reactions)
    } else {
        await exists.edit({ embeds: [embeds[0]], components })
        exists.reactions.removeAll()
        react(exists, reactions)
    }
}

function updateEvery5SecondsWhileReloading(message: Message<true> | undefined) {
    const embeds = message?.embeds || undefined
    let startTime = new Date().getTime()
    const interval = setInterval(() => {
        const diff = Math.floor((new Date().getTime() - startTime) / 1000)
        if (message && embeds) {
            message.edit({ embeds: [{
                ...embeds[0].data, 
                description: embeds[0].description?.
                replace(/(\d+s)/g, `${diff}s`)
                .replace(/: \d+s/, `: ${180 - diff}s`)
            }, ...embeds.slice(1)]})
            const done = global.finished.get(message.channelId)
            if (done) {
                clearInterval(interval)
                message.edit({ embeds: [{
                    ...embeds[0].data,
                    description: undefined
                }, ...embeds.slice(1)]})
            }
        } else {
            console.log(`${diff}s elapsed. Estimated time 180s (~ ${180 - diff} remaining).`)
        }
    }, 5000)
}
