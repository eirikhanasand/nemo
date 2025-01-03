import { Message } from "discord.js"

export default async function appendReaction(message: Message, reactions: string, messages: string) {
    const content = message.content.split('\n')
    for (const [, reaction] of message.reactions.cache) {
        const users = await reaction.users.fetch()
        const reactionContent = content.find((a) => a.includes(reaction.emoji.name || ''))
        for (const [,author] of users) {
            const member = await message.guild?.members.fetch(author.id)
            const nickname = member?.nickname || author.username
            if (nickname.includes('VictoryBot')) {
                continue
            }
            messages += `${nickname}\n`
            reactions += `${reactionContent?.replaceAll(`/${reaction.emoji.name}/g`, `<${reaction.emoji.name}:${reaction.emoji.id}`)}\n`
        }
    }

    return [reactions, messages]
}
