import { Collection, Message, MessageReaction, User } from "discord.js"

type AppendProps = { 
    reaction: MessageReaction
    users: Collection<string, User>
}

export default async function appendReaction(message: Message) {
    const content = message.content.split('\n')
    const reactionsData: AppendProps[] = []
    const field = { name: "", value: "" }
    
    // Fetch all reactions in parallel for all the reactions in the cache
    const reactionPromises = Array.from(message.reactions.cache.values()).map(async (reaction) => {
        const users = await reaction.users.fetch()
        if (users.size >= 2) {
            reactionsData.push({ reaction, users })
        }
    })

    // Wait for all the fetches to complete
    await Promise.all(reactionPromises)

    for (const { reaction, users } of reactionsData) {
        console.log("Continued with", reaction.emoji.name)
        const reactionContent = content.find((a) => a.includes(reaction.emoji.name || ''))
        for (const [, author] of users) {
            if (author.username === 'puzzlesoup_86746') {
                continue
            }

            field.name = `${reactionContent?.replaceAll(`/${reaction.emoji.name}/g`, `<${reaction.emoji.name}:${reaction.emoji.id}`)}\n`
            field.value = `<@${author.id}>\n`
        }
    }

    console.log("returning", field)
    return field
}
