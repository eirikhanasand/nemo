import { Channel, EmbedBuilder, PermissionsBitField, TextChannel } from "discord.js"
import appendReaction from "./appendReaction.js"

type Field = {
    name: string
    value: string
    inline?: true
}

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
    
    console.log(`Continued with ${textChannel.name}.`)
    const messages = await textChannel.messages.fetch({ limit: 25 })
    const lastmessage = textChannel.lastMessageId
    let exists = null
    const fields: Field[] = []
    
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

        const field = await appendReaction(message)
        if (field.name.length > 0 && field.value.length > 0) {
            fields.push(field)
        }
    }

    if (fields.length > 10) {
        fields.forEach((field) => field = {...field, inline: true})
    }
    
    const embed = new EmbedBuilder()
        .setTitle('Prepped tasks')
        .setColor("#fd8738")
        .setTimestamp()
        .addFields(fields.length > 0 ? fields : [{name: "🕥 No tasks prepared yet...", value: " ", inline: true}])
    if (!exists) {
        console.log("f", channel.name)
        await textChannel.send({ embeds: [embed]})
    } else {
        await exists.edit({ embeds: [embed]})
    }
}
