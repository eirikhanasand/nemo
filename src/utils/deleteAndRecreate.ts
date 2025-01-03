import { Channel, EmbedBuilder, TextChannel } from "discord.js"
import appendReaction from "./appendReaction.js"

export default async function deleteAndRecreate(channel: Channel) {
    if (!channel?.isTextBased() || !('name' in channel) || !channel?.name?.includes('prepped-tasks')) {
        return
    }

    const textChannel = channel as TextChannel
    const messages = await textChannel.messages.fetch({ limit: 20 })
    const lastmessage = textChannel.lastMessageId
    let exists = null
    let players = ""
    let tasks = ""

    for (const [, message] of messages) {
        if (message.id === lastmessage) {
            exists = message.embeds.find(embed => embed.title === 'Prepped tasks') ? message : null
            continue
        }

        if (message.embeds.length > 0) {
            const embedWithPreppedTasks = message.embeds.find(embed => embed.title === 'Prepped tasks')
            if (embedWithPreppedTasks) {
                await message.delete()
                console.log(`Deleted a message with embed titled "Prepped tasks" in channel ${channel.name}`)
            }
        }

        [players, tasks] = await appendReaction(message, players, tasks)
    }
    
    const embed = new EmbedBuilder()
        .setTitle('Prepped tasks')
        .setColor("#fd8738")
        .setTimestamp()
        .addFields(
            {name: "Task", value: tasks || "🕥", inline: true},
            {name: "Player", value: players || "No tasks prepared yet...", inline: true},
        )

    if (!exists) {
        await textChannel.send({ embeds: [embed]})
    } else {
        await exists.edit({ embeds: [embed]})
    }
}