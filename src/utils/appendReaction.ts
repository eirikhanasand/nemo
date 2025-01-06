import { Collection, Message, MessageReaction, User } from "discord.js"

type AppendProps = { 
    reaction: MessageReaction
    users: Collection<string, User>
}

export default async function appendReaction(message: Message) {
    const content = message.content.split('\n')
    const reactionsData: AppendProps[] = []
    const field = { name: "", value: "" }
    const fields = []
    const reactionPromises = Array.from(message.reactions.cache.values()).map(async (reaction) => {
        const users = await reaction.users.fetch()
        if (users.size >= 2) {
            reactionsData.push({ reaction, users })
        }
    })
    await Promise.all(reactionPromises)

    for (const { reaction, users } of reactionsData) {
        const reactionContent = content.find((a) => a.includes(reaction.emoji.name || ''))
        for (const [, author] of users) {
            if (author.username === 'puzzlesoup_86746') {
                continue
            }

            field.name = `${reactionContent?.replaceAll(`/${reaction.emoji.name}/g`, `<${reaction.emoji.name}:${reaction.emoji.id}`)}\n`
            field.value = `<@${author.id}>\n`
            if (field.name.length > 0 && field.value.length > 0) {
                fields.push({...field})
            }
            field.name = ""
            field.value = ""
        }
    }

    return fields
}
