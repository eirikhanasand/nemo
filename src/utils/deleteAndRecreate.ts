import { Channel, EmbedBuilder, PermissionsBitField, TextChannel } from "discord.js"
import appendReaction from "./appendReaction.js"

export default async function deleteAndRecreate(channel: Channel) {
    if (!channel?.isTextBased() || !('name' in channel) || !channel?.name?.includes('prepped-tasks')) {
        return
    }

    const textChannel = channel as TextChannel
    const me = textChannel.guild.members.me
    const permissions = me ? textChannel.permissionsFor(me) : undefined
    
    if (!permissions?.has([PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ReadMessageHistory])) {
        console.log(`Skipped ${textChannel.name}, no access.`)
        return
    }
    
    console.log(`Continued with ${textChannel.name}, has access.`)
    
    const messages = await textChannel.messages.fetch({ limit: 25 })
    const lastmessage = textChannel.lastMessageId
    let exists = null
    let players = ""
    let tasks = ""
    
    console.log("before messages", messages.size)
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
            {name: "Player", value: tasks || "🕥", inline: true},
            {name: "Task", value: players || "No tasks prepared yet...", inline: true},
        )

    if (!exists) {
        console.log("f", channel.name)
        await textChannel.send({ embeds: [embed]})
    } else {
        console.log("g", (embed.data as any).fields[0])
        await exists.edit({ embeds: [embed]})
    }
}